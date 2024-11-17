const dev = process.env.NODE_ENV !== 'production';

export const server = dev ? 'http://192.168.1.110:3000/' : 'https://sailviz.com';