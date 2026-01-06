import express, { Request, Response } from "express"
import authRoutes from "./auth.routes.js"
import userRoutes from "./user.routes.js"
import bookRoutes from "./book.routes.js"

const router = express.Router();

router.get("/healthcheck",(req:Request,res:Response) => {
    res.status(200).send({ok:"ok"});
})

router.use(authRoutes)
router.use(userRoutes)
router.use(bookRoutes)

export default router;