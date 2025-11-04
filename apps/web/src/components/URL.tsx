if (!import.meta.env.VITE_BASE_URL) {
    throw new Error('BASE_URL is not defined in environment variables')
}

export const server = import.meta.env.VITE_BASE_URL
