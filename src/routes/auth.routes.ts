import express, { Request, Response } from "express"
import validateResource from "../middlewares/validateResource.js";
import { createSessionSchema } from "../schemas/auth.schema.js";
import { createSessionHandler, refreshHandler } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/healthcheck/auth",(req:Request,res:Response) => {
    res.status(200).send({ok:"ok"});
})

/**
 * @swagger
 * /api/session:
 *   post:
 *     summary: api session for login
 *     tags: [session]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: successfully create session
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  msg: 
 *                    type: string
 *                  data: 
 *                    type: object | null
 */
router.post("/api/session", validateResource(createSessionSchema), createSessionHandler)
router.post("/api/refresh",refreshHandler)

export default router;