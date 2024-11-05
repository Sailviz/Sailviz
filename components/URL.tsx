const dev = process.env.NODE_ENV !== 'production';

export const server = dev ? 'http://10.167.143.79:3000/' : 'https://sailviz.com';