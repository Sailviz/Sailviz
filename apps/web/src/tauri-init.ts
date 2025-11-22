// Initialize Tauri-specific auth behavior: monkey-patch `fetch` to attach
// `Authorization: Bearer <token>` using the Tauri store plugin stored token.

export async function initTauriAuth() {
    try {
        // Use eval import to avoid Vite resolving this dependency during web build
        // Import the official package name so the plugin is resolved inside Tauri.
        const { Store } = await eval('import("@tauri-apps/plugin-store")')
        const store = new Store('sailviz-store.dat')

        const origFetch = window.fetch.bind(window)
        // override global fetch
        ;(window as any).fetch = async (input: RequestInfo, init?: RequestInit) => {
            try {
                const token = (await store.get('sailviz_token')) as string | null
                console.debug('initTauriAuth: read token from store', !!token)
                const headers = new Headers((init?.headers as HeadersInit) || {})
                if (token) {
                    headers.set('Authorization', `Bearer ${token}`)
                }
                const merged: RequestInit = { ...init, headers }
                return origFetch(input, merged)
            } catch (e) {
                console.warn('initTauriAuth: error reading store or attaching token', e)
                return origFetch(input, init)
            }
        }
    } catch (e) {
        console.warn('Tauri init failed or store plugin not available:', e)
    }
}
