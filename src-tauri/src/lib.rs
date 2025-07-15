// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

#[tauri::command]
async fn copy_directory(source: String, destination: String) -> Result<(), String> {
    let mut options = fs_extra::dir::CopyOptions::new();
    options.copy_inside = true;
    match fs_extra::dir::copy(source, destination, &options) {
        Ok(_) => { Ok(()) }
        Err(e) => { Err(e.to_string()) }
    }
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // add functions here
            copy_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
