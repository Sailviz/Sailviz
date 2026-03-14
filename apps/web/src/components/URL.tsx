if (!import.meta.env.VITE_BASE_URL) {
    throw new Error('BASE_URL is not defined in environment variables')
}

export const server = import.meta.env.VITE_BASE_URL

export const api_server = import.meta.env.VITE_API_URL

export const ws_server = import.meta.env.VITE_WS_URL

export const trackable_ws_server = import.meta.env.VITE_TRACKABLE_WS_URL
