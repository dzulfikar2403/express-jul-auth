import dotenv from "dotenv"
dotenv.config();

const config = {
    env: {
        PORT: process.env.PORT!,
        DATABASE_URL: process.env.DATABASE_URL!,
        RESEND_API_KEY: process.env.RESEND_API_KEY!,
        JWT_ACCESS_KEY: process.env.JWT_ACCESS_KEY!,
        JWT_REFRESH_KEY: process.env.JWT_REFRESH_KEY!,
        JWT_ACCESS_TIME: process.env.JWT_ACCESS_TIME!,
        JWT_REFRESH_TIME: process.env.JWT_REFRESH_TIME!,
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL!,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN!,
        TTL_TOKEN_VERIFY_EMAIL: process.env.TTL_TOKEN_VERIFY_EMAIL!,
        TTL_TOKEN_FORGOT_PASSWORD: process.env.TTL_TOKEN_FORGOT_PASSWORD!,
    }
}

export default config;