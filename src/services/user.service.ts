import { nanoid } from "nanoid";
import { TCreateUserSchema } from "../schemas/user.schema.js";
import prisma from "../utils/prisma.js";
import argon2 from "argon2"

export const getUserById = async (input:{id:string}) => {
    const resGet = await prisma.user.findUnique({where:{id:input.id}});

    return {msg: "successfully get user",data:resGet}
}

export const getUserByEmail = async (input:{email:string}) => {
    const resGet = await prisma.user.findUnique({where:{email:input.email}});

    return {msg: "successfully get user",data:resGet}
}

// export const putUser = async (input:) => {
//     const resGet = await prisma.user.update({where:{id:input.id}});

//     return {msg: "successfully put user",data:resGet}
// }

export const postUser = async (input: Omit<TCreateUserSchema["body"],"confirmPassword">) => {
    const checkUser = await prisma.user.findUnique({where: {email:input.email}});
    if (checkUser?.email){
        throw {msg: "email already exist",data:null}
    }
    
    const hashPw = await argon2.hash(input.password);
    
    const body = {
        id: nanoid(),
        ...input,  
        password: hashPw,
    }
    
    try {
        const postUser = await prisma.user.create({data:body,select:{id:true,email:true}});
        
        return {msg: "successfully create user",data:postUser}
    } catch (error) { 
        throw {msg: "failed create user" + (error as Error).message ,data:null}
    }
} 