const dev = process.env.NODE_ENV !== 'production';

export const server = dev ? 'http://192.168.1.220:3308' : 'http://race.whitefriarssc.org';