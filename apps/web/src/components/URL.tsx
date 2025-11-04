if (!process.env.BASE_URL) {
    throw new Error('BASE_URL is not defined in environment variables')
}

export const server = process.env.BASE_URL
