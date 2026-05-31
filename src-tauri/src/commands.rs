use std::collections::HashMap;
use std::path::{Path, PathBuf};
use tokio::sync::Mutex;
use tauri::{AppHandle, Emitter, State};
use crate::db::Database;
use crate::parser::{self, AideenRun, ParseResult};

/// Manages active file watchers
pub struct WatcherState {
    pub handles: Mutex<HashMap<String, tokio::task::JoinHandle<()>>>,
}

#[derive(Debug, serde::Serialize)]
pub struct ImportLogsResult {
    pub imported: usize,
    pub skipped: usize,
    pub warnings: Vec<String>,
}

#[tauri::command]
pub fn parse_log(text: String, file_name: Option<String>, display_name: Option<String>) -> Result<ParseResult, String> {
    let result = parser::parse_aideen_log(&text, file_name, display_name);
    Ok(result)
}

#[tauri::command]
pub fn save_run(db: State<Database>, run: AideenRun) -> Result<(), String> {
    db.save_run(&run)
}

#[tauri::command]
pub fn load_runs(db: State<Database>) -> Result<Vec<AideenRun>, String> {
    db.load_runs()
}

#[tauri::command]
pub fn load_run_detail(db: State<Database>, id: String) -> Result<Option<AideenRun>, String> {
    db.load_run_detail(&id)
}

#[tauri::command]
pub fn delete_run(db: State<Database>, id: String) -> Result<(), String> {
    db.delete_run(&id)
}

#[tauri::command]
pub fn clear_runs(db: State<Database>) -> Result<(), String> {
    db.clear_runs()
}

#[tauri::command]
pub fn import_logs_from_dir(
    db: State<Database>,
    root_path: String,
    max_files: Option<usize>,
) -> Result<ImportLogsResult, String> {
    let root = PathBuf::from(&root_path);
    if !root.exists() {
        return Err(format!("Log directory does not exist: {}", root_path));
    }

    let mut files = Vec::new();
    collect_log_files(&root, &mut files)?;
    files.sort_by(|a, b| {
        let a_modified = a.metadata().and_then(|m| m.modified()).ok();
        let b_modified = b.metadata().and_then(|m| m.modified()).ok();
        b_modified.cmp(&a_modified)
    });

    let limit = max_files.unwrap_or(80);
    let mut result = ImportLogsResult {
        imported: 0,
        skipped: 0,
        warnings: Vec::new(),
    };

    for path in files.into_iter().take(limit) {
        match std::fs::read_to_string(&path) {
            Ok(text) => {
                let file_name = path.file_name().and_then(|s| s.to_str()).map(|s| s.to_string());
                let display_name = path
                    .strip_prefix(&root)
                    .ok()
                    .and_then(|p| p.to_str())
                    .map(|s| s.to_string())
                    .or_else(|| file_name.clone());
                let parse_result = parser::parse_aideen_log(&text, file_name, display_name);
                if parse_result.run.points.is_empty()
                    && parse_result.run.summary.final_val_loss.is_none()
                    && parse_result.run.summary.avg_loss.is_none()
                {
                    result.skipped += 1;
                    result.warnings.push(format!("Skipped {}: no metrics parsed", path.display()));
                    continue;
                }
                for warning in &parse_result.warnings {
                    result.warnings.push(format!("{}: {}", path.display(), warning));
                }
                db.save_run(&parse_result.run)?;
                result.imported += 1;
            }
            Err(err) => {
                result.skipped += 1;
                result.warnings.push(format!("Could not read {}: {}", path.display(), err));
            }
        }
    }

    Ok(result)
}

fn collect_log_files(dir: &Path, out: &mut Vec<PathBuf>) -> Result<(), String> {
    for entry in std::fs::read_dir(dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_dir() {
            collect_log_files(&path, out)?;
        } else if path
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| ext.eq_ignore_ascii_case("log") || ext.eq_ignore_ascii_case("txt"))
            .unwrap_or(false)
        {
            out.push(path);
        }
    }
    Ok(())
}

/// Start watching a log file for changes. Emits 'log-update' events with IncrementalUpdate.
#[tauri::command]
pub async fn watch_log_file(
    app: AppHandle,
    watcher_state: State<'_, WatcherState>,
    path: String,
    display_name: Option<String>,
) -> Result<(), String> {
    // Stop any existing watcher for this path
    let mut handles = watcher_state.handles.lock().await;
    if let Some(old) = handles.remove(&path) {
        old.abort();
    }

    let app_for_loop = app.clone();
    let app_for_error = app.clone();
    let path_clone = path.clone();
    let name = display_name.unwrap_or_else(|| {
        std::path::Path::new(&path)
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("Unnamed")
            .to_string()
    });

    let handle = tokio::spawn(async move {
        if let Err(e) = watch_file_loop(app_for_loop, &path_clone, &name).await {
            eprintln!("Watch error for {}: {}", path_clone, e);
            let _ = app_for_error.emit("log-watch-error", format!("Watch error: {}", e));
        }
    });

    handles.insert(path, handle);
    Ok(())
}

/// Stop watching a log file
#[tauri::command]
pub async fn stop_watch_log_file(
    watcher_state: State<'_, WatcherState>,
    path: String,
) -> Result<(), String> {
    let mut handles = watcher_state.handles.lock().await;
    if let Some(handle) = handles.remove(&path) {
        handle.abort();
    }
    Ok(())
}

/// Stop all watchers
#[tauri::command]
pub async fn stop_all_watchers(
    watcher_state: State<'_, WatcherState>,
) -> Result<(), String> {
    let mut handles = watcher_state.handles.lock().await;
    for (_, handle) in handles.drain() {
        handle.abort();
    }
    Ok(())
}

async fn watch_file_loop(app: AppHandle, path: &str, display_name: &str) -> Result<(), String> {
    use tokio::io::AsyncBufReadExt;
    use tokio::io::BufReader;

    let file = tokio::fs::File::open(path).await.map_err(|e| format!("Cannot open file: {}", e))?;
    let reader = BufReader::new(file);
    let mut lines = reader.lines();

    let mut line_count: usize = 0;
    let mut buffer: Vec<String> = Vec::new();
    let mut last_emit = std::time::Instant::now();

    // Emit initial event to signal that watching started
    let _ = app.emit("log-watch-started", serde_json::json!({
        "path": path,
        "display_name": display_name,
    }));

    loop {
        tokio::select! {
            line_result = lines.next_line() => {
                match line_result {
                    Ok(Some(line)) => {
                        line_count += 1;
                        buffer.push(line);
                    }
                    Ok(None) => {
                        // EOF - flush remaining buffer and sleep
                        if !buffer.is_empty() {
                            emit_update(&app, &buffer, line_count, true).await;
                            buffer.clear();
                        }
                        // Small sleep before checking for new data
                        tokio::time::sleep(std::time::Duration::from_millis(200)).await;
                    }
                    Err(e) => {
                        eprintln!("Read error: {}", e);
                        tokio::time::sleep(std::time::Duration::from_secs(1)).await;
                    }
                }
            }
            _ = tokio::time::sleep(std::time::Duration::from_millis(500)) => {
                // Time-based flush: emit every 500ms if we have data
                if !buffer.is_empty() && last_emit.elapsed() >= std::time::Duration::from_millis(500) {
                    emit_update(&app, &buffer, line_count, false).await;
                    buffer.clear();
                    last_emit = std::time::Instant::now();
                }
            }
        }
    }
}

async fn emit_update(app: &AppHandle, new_lines: &[String], total_lines: usize, eof: bool) {
    let update = parser::parse_incremental_lines(new_lines, total_lines, eof);
    let _ = app.emit("log-update", &update);
}
