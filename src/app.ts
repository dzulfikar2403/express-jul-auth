import dotenv from "dotenv"
dotenv.config();

import express, { type Request, type Response } from "express"
import config from "./utils/config.js";
import log from "./utils/logger.js";
import router from "./routes/index.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser())
app.use(express.json())
app.use(router)

app.listen(config.env.PORT,() => {
    log.info("server running at port " + config.env.PORT)
})