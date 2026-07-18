import { Redis } from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "./config";
export const redis = new Redis({
    host: REDIS_HOST, // your Redis LXC IP
    port: REDIS_PORT,
    family: 4,
});
