import express, { Request, Response } from "express"
import validateResource from "../middlewares/validateResource.js";
import { createSessionSchema } from "../schemas/auth.schema.js";
import { createSessionHandler, refreshHandler } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/healthcheck/auth",(req:Request,res:Response) => {
    res.status(200).send({ok:"ok"});
})

router.post("/api/session", validateResource(createSessionSchema), createSessionHandler)
router.post("/api/refresh",refreshHandler)

export default router;