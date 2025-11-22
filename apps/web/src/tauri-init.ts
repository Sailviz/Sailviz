// Initialize Tauri-specific auth behavior: monkey-patch `fetch` to attach
// `Authorization: Bearer <token>` using `tauri-plugin-store-api` stored token.

export async function initTauriAuth() {
    try {
        // Use eval import to avoid Vite resolving this dependency during web build
        const { Store } = await eval('import("tauri-plugin-store-api")')
        const store = new Store('sailviz-store.dat')

        const origFetch = window.fetch.bind(window)
        // override global fetch
        ;(window as any).fetch = async (input: RequestInfo, init?: RequestInit) => {
            try {
                const token = (await store.get('sailviz_token')) as string | null
                const headers = new Headers((init?.headers as HeadersInit) || {})
                if (token) {
                    headers.set('Authorization', `Bearer ${token}`)
                }
                const merged: RequestInit = { ...init, headers }
                return origFetch(input, merged)
            } catch (e) {
                return origFetch(input, init)
            }
        }
    } catch (e) {
        console.warn('Tauri init failed or store plugin not available:', e)
    }
}
