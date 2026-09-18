use tauri::Manager;
use pcsc::*;
use std::error::Error;

#[cfg(not(any(target_os = "android", target_os = "ios")))]
use tauri_plugin_updater::UpdaterExt;

#[cfg(not(any(target_os = "android", target_os = "ios")))]
pub fn run(fullscreen: bool) {
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    use tauri_plugin_updater;

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build());

    if cfg!(debug_assertions) {
        builder = builder.plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        );
    }

    builder
        .setup(move |app| {
            if let Some(window) = app.get_webview_window("main") {
                if fullscreen {
                    window.set_fullscreen(true).unwrap();
                }
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    update(handle).await.unwrap();
                });
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![toggle_fullscreen])
        .invoke_handler(tauri::generate_handler![scan_nfc])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[cfg(any(target_os = "android", target_os = "ios"))]
pub fn run() {
    let mut builder = tauri::Builder::default();

    if cfg!(debug_assertions) {
        builder = builder.plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        );
    }

    builder
        .setup(move |_app_handle| Ok(()))
        .invoke_handler(tauri::generate_handler![toggle_fullscreen])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn toggle_fullscreen(window: tauri::Window) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
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

#[tauri::command]
#[cfg(not(any(target_os = "android", target_os = "ios")))]
async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        let mut downloaded = 0;
        update
            .download_and_install(
                |chunk_length, content_length| {
                    downloaded += chunk_length;
                    println!("downloaded {downloaded} from {content_length:?}");
                },
                || {
                    println!("download finished");
                },
            )
            .await?;

        println!("update installed");
        app.restart();
    }

    Ok(())
}


fn read_block(card: &Card, block: u8) -> Result<Vec<u8>, Box<dyn Error>> {
    // ISO15693 Read Binary:
    // FF B0 <block_number> <number_of_blocks>
    let apdu = [0xFF, 0x00, 0x00, 0x00,
    0x03,
    0x22, // Flags
    0x20, block];
    let mut buf = [0u8; 258];

    // transmit() returns &[u8]
    let rapdu = card.transmit(&apdu, &mut buf)?;
    Ok(rapdu.to_vec())
}


#[tauri::command]
fn scan_nfc() -> Result<String, String> {
    // Establish a PC/SC context.
    let ctx = match Context::establish(Scope::User) {
        Ok(ctx) => ctx,
        Err(err) => {
            eprintln!("Failed to establish context: {}", err);
            std::process::exit(1);
        }
    };

    // List available readers.
    let mut readers_buf = [0; 2048];
    let mut readers = match ctx.list_readers(&mut readers_buf) {
        Ok(readers) => readers,
        Err(err) => {
            eprintln!("Failed to list readers: {}", err);
            std::process::exit(1);
        }
    };

    // Use the first reader.
    let reader = match readers.next() {
        Some(reader) => reader,
        None => {
            println!("No readers are connected.");
            return Ok("No readers are connected.".to_string());
        }
    };
    println!("Using reader: {:?}", reader);

    // Connect to the card.
     // Wait for card
    let card = ctx.connect(reader, ShareMode::Shared, Protocols::ANY)
        .map_err(|e| format!("Failed to connect to card: {}", e))?;
    println!("Tag detected");

    // Read blocks containing TLV + NDEF
    let apdu = [0xFF, 0xfb, 0x00, 0x02, 0x03, 0x23, 0x02, 0x06];
    let mut tlv = [0u8; 258];

    // transmit() returns &[u8]
    let len = card.transmit(&apdu, &mut tlv).map_err(|e| format!("Failed to talk to card: {}", e))?;;

    println!("Raw TLV bytes: {:02X?}", tlv);

    // ---- Parse TLV ----
    let mut i = 0;

    // Skip NULL TLVs
    while tlv[i] == 0x00 {
        i += 1;
    }

    if tlv[i] != 0x03 {
        println!("Not an NDEF TLV");
    }

    let ndef_len = tlv[i+1] as usize;
    let ndef = &tlv[i+2 .. i+2+ndef_len];


    println!("NDEF bytes: {:02X?}", ndef);

    // ---- Parse NDEF Text Record ----
    // D1 01 <len> 54 02 'e' 'n' <payload>
    let tnf = ndef[0];
    let type_len = ndef[1] as usize;
    let payload_len = ndef[2] as usize;

    let record_type = &ndef[3..3 + type_len];
    let status = ndef[3 + type_len];
    let lang_len = (status & 0x3F) as usize;

    let lang = &ndef[4 + type_len .. 4 + type_len + lang_len];
    let text = &ndef[4 + type_len + lang_len .. 3 + type_len + payload_len];

    let serial = String::from_utf8_lossy(text);

    println!("Language: {}", String::from_utf8_lossy(lang));
    println!("Record Type: {}", String::from_utf8_lossy(record_type));
    println!("Serial Number: {}", serial);

    Ok(serial.to_string())
}