// Robust Tauri detection helper.
// Tauri can expose different globals depending on version and environment.
// This helper checks multiple signals at runtime and returns a boolean.

export function isTauriRuntime(): boolean {
    if (typeof window === 'undefined') return false

    const w = window as any

    // Some Tauri builds expose an internal marker used by the app; root
    // route uses `__TAURI_INTERNALS__ in window` — check that first.
    try {
        if ('__TAURI_INTERNALS__' in w) return true
    } catch (e) {}

    // Common Tauri globals
    if (w.__TAURI__ !== undefined && w.__TAURI__ !== null) return true
    if (w.__TAURI_IPC__ !== undefined && w.__TAURI_IPC__ !== null) return true

    // The presence of the Tauri API object (namespaced) is also a signal
    if (w.__TAURI && typeof w.__TAURI__ === 'object') return true

    // navigator userAgent may include 'tauri' in packaged apps
    try {
        const ua = navigator.userAgent || ''
        if (ua.toLowerCase().includes('tauri')) return true
    } catch (e) {}

    // In development mode, Tauri serves the web app from localhost, so
    // userAgent or globals may be absent. Check for the presence of the
    // `@tauri-apps/api` IPC bridge by testing invoke availability if present.
    try {
        if (w.__TAURI__ && typeof w.__TAURI__.invoke === 'function') return true
    } catch (e) {}

    return false
}

export default isTauriRuntime
