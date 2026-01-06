import express, { Request, Response } from "express"
import { createUserHandler, forgotPasswordHandler, resetPasswordHandler, verifyUserHandler } from "../controllers/user.controller.js";
import validateResource from "../middlewares/validateResource.js";
import { createUserSchema, forgotPasswordSchema, resetPasswordSchema, verifyUserSchema } from "../schemas/user.schema.js";

const router = express.Router();

router.get("/healthcheck/user",(req:Request,res:Response) => {
    res.status(200).send({ok:"ok"});
})

router.post("/api/users",validateResource(createUserSchema),createUserHandler)
router.post("/api/users/verify/:id/:verificationCode",validateResource(verifyUserSchema),verifyUserHandler)
router.post("/api/users/forgot-password",validateResource(forgotPasswordSchema),forgotPasswordHandler)
router.post("/api/users/reset-password/:id/:passwordResetCode",validateResource(resetPasswordSchema),resetPasswordHandler)

export default router;