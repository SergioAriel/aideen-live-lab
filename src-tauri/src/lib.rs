mod parser;
mod db;
mod commands;

use db::Database;
use commands::WatcherState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().expect("Failed to get app data dir");
            let database = Database::new(app_data_dir).expect("Failed to initialize database");
            app.manage(database);
            app.manage(WatcherState {
                handles: tokio::sync::Mutex::new(std::collections::HashMap::new()),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::parse_log,
            commands::save_run,
            commands::load_runs,
            commands::load_run_detail,
            commands::delete_run,
            commands::clear_runs,
            commands::import_logs_from_dir,
            commands::watch_log_file,
            commands::stop_watch_log_file,
            commands::stop_all_watchers,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
