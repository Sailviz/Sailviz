const dev = process.env.NODE_ENV !== 'production'

export const server = dev ? 'http://localhost:5173' : 'https://sailviz.com'
