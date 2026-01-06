import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

const validateResource = (schema:ZodTypeAny) => (req:Request,res:Response,next:NextFunction) =>{
    const parsed = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
    })

    if(!parsed.success){
        res.status(400).send({
            message: "validation error",
            errors: parsed.error.flatten().fieldErrors
        })
    }

    next()
}

export default validateResource;