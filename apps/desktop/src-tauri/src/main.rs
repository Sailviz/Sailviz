// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let fullscreen = args.contains(&"--fullscreen".to_string());
    app_lib::run(fullscreen);
}
