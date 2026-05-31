#[path = "../parser.rs"]
mod parser;
#[path = "../db.rs"]
mod db;

use std::path::{Path, PathBuf};

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

fn main() -> Result<(), String> {
    let args: Vec<String> = std::env::args().collect();
    let root = PathBuf::from(args.get(1).map(String::as_str).unwrap_or("/Users/sergiosolis/Programacion/aideen/logs"));
    let max_files = args
        .get(2)
        .and_then(|v| v.parse::<usize>().ok())
        .unwrap_or(80);
    let app_data_dir = PathBuf::from("/Users/sergiosolis/Library/Application Support/com.aideen.live-lab");

    let database = db::Database::new(app_data_dir)?;
    let mut files = Vec::new();
    collect_log_files(&root, &mut files)?;
    files.sort_by(|a, b| {
        let a_modified = a.metadata().and_then(|m| m.modified()).ok();
        let b_modified = b.metadata().and_then(|m| m.modified()).ok();
        b_modified.cmp(&a_modified)
    });

    let mut imported = 0usize;
    let mut skipped = 0usize;

    for path in files.into_iter().take(max_files) {
        let text = match std::fs::read_to_string(&path) {
            Ok(text) => text,
            Err(err) => {
                eprintln!("skip read {}: {}", path.display(), err);
                skipped += 1;
                continue;
            }
        };
        let file_name = path.file_name().and_then(|s| s.to_str()).map(|s| s.to_string());
        let display_name = path
            .strip_prefix(&root)
            .ok()
            .and_then(|p| p.to_str())
            .map(|s| s.to_string())
            .or_else(|| file_name.clone());
        let parsed = parser::parse_aideen_log(&text, file_name, display_name);
        if parsed.run.points.is_empty()
            && parsed.run.summary.final_val_loss.is_none()
            && parsed.run.summary.avg_loss.is_none()
        {
            eprintln!("skip metrics {}", path.display());
            skipped += 1;
            continue;
        }
        database.save_run(&parsed.run)?;
        imported += 1;
    }

    println!("imported={imported} skipped={skipped}");
    Ok(())
}
