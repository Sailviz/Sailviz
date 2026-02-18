use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(fullscreen: bool) {
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    use tauri_plugin_updater;

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    let mut builder = tauri::Builder::default().plugin(tauri_plugin_updater::Builder::new().build());

    #[cfg(any(target_os = "android", target_os = "ios"))]
    let mut builder = tauri::Builder::default();

    if cfg!(debug_assertions) {
        builder = builder.plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        );
    }

    builder
        .setup(move |app_handle| {
            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            {
                if let Some(window) = app_handle.get_webview_window("main") {
                    if fullscreen {
                        window.set_fullscreen(true).unwrap();
                    }
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![toggle_fullscreen])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn toggle_fullscreen(window: tauri::Window) -> Result<(), String> {
    // On desktop platforms, toggle fullscreen. On Android, window
    // fullscreen APIs are not supported in the same way and may
    // not be available at compile time. Use cfg to provide a
    // platform-specific implementation.

    #[cfg(target_os = "android")]
    {
        // No-op on Android. Return Ok to make the JS invoke a no-op as well.
        // If you want logging, you can log here using tauri::api::log::... but
        // keep the behavior non-failing so builds and runtime work smoothly.
        return Ok(());
    }

    #[cfg(not(target_os = "android"))]
    {
        let is_fullscreen = window.is_fullscreen().map_err(|e| e.to_string())?;
        window
            .set_fullscreen(!is_fullscreen)
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}
