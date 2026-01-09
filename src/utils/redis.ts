import { Redis } from "@upstash/redis";
import config from "./config.js";

const redis = new Redis({
    url: config.env.UPSTASH_REDIS_REST_URL,
    token: config.env.UPSTASH_REDIS_REST_TOKEN,
})

export default redis;