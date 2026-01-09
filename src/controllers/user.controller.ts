import { Request, Response } from "express";
import {
  TCreateUserSchema,
  TForgotPasswordSchema,
  TResetPasswordSchema,
  TVerifyUserSchema,
} from "../schemas/user.schema.js";
// import log from "../utils/logger.js";
import {
  getUserByEmail,
  getUserById,
  postUser,
} from "../services/user.service.js";
import resend from "../utils/mailer.js";
import log from "../utils/logger.js";
import prisma from "../utils/prisma.js";
import { nanoid } from "nanoid";
import argon2 from "argon2";
import redis from "../utils/redis.js";
import config from "../utils/config.js";

export const createUserHandler = async (req: Request, res: Response) => {
  const data: TCreateUserSchema["body"] = req.body;

  const { confirmPassword, ...dataFinal } = data;

  try {
    const resPost = await postUser(dataFinal);

    const verifToken = nanoid();

    await redis.set(`verifToken:${resPost.data.id}`, verifToken, {
      ex: Number(config.env.TTL_TOKEN_VERIFY_EMAIL),
    });

    const { data, error } = await resend.emails.send({
      from: "jul <example@dzulfikar2403.my.id>",
      to: [resPost.data.email],
      subject: "Verify Your Email!",
      html: `<div><small>expired in 5min</small> <p>id: ${resPost.data.id} <br> Verification Code: ${verifToken}</p></div>`,
    });

    if (error) {
      return res.status(400).send(error);
    }

    return res.send({ msg: "successfully regist", data: null });
  } catch (error) {
    return res.status(500).send(error);
  }
};

export const verifyUserHandler = async (
  req: Request<TVerifyUserSchema["params"]>,
  res: Response
) => {
  const { id, verificationCode }: TVerifyUserSchema["params"] = req.params;

  const user = await getUserById({ id: id });

  if (!user.data) {
    return res.status(400).send({ msg: "could not verify user", data: null });
  }

  if (user.data.isVerified) {
    return res.send({ msg: "user is already verified", data: null });
  }

  const verifTokenRedis = await redis.get(`verifToken:${id}`);

  if (!verifTokenRedis) {
    return res.status(400).send({ msg: "verif token expired", data: null });
  }

  if (verifTokenRedis !== verificationCode) {
    return res.status(400).send({ msg: "invalid verif token", data: null });
  }

  try {
    await prisma.user.update({
      where: { id: id },
      data: { isVerified: true },
    });

    await redis.del(`verifToken:${id}`);

    return res.send({ msg: "sucessfully verify", data: null });
  } catch (error) {
    log.error(error);
    return res.status(500).send({ msg: error, data: null });
  }
};

export const forgotPasswordHandler = async (req: Request, res: Response) => {
  const { email }: TForgotPasswordSchema["body"] = req.body;

  const user = await getUserByEmail({ email });

  if (!user) {
    return res.status(400).send({ msg: "email not found!", data: null });
  }

  if (!user.data?.isVerified) {
    return res.status(400).send({ msg: "email is not verified!", data: null });
  }

  try {
    const resetPwCode = nanoid();

    await redis.set(`resetPwCode:${user.data.id}`, resetPwCode, {
      ex: Number(config.env.TTL_TOKEN_FORGOT_PASSWORD),
    });

    const { data, error } = await resend.emails.send({
      from: "jul <noreply@dzulfikar2403.my.id>",
      to: [user.data.email],
      subject: "forgot password code!",
      html: `<div><small>expired in 5min</small> <p>id: ${user.data.id} <br> Password Reset Code: ${resetPwCode}</p></div>`,
    });

    if (error) {
      return res.status(400).send(error);
    }

    return res.send({
      message: "Email ResetCode was successfully send",
      data: null,
    });
  } catch (error) {
    return res.status(500).send({ message: error, data: null });
  }
};

export const resetPasswordHandler = async (
  req: Request<TResetPasswordSchema["params"]>,
  res: Response
) => {
  const { id, passwordResetCode }: TResetPasswordSchema["params"] = req.params;

  const { password }: TResetPasswordSchema["body"] = req.body;

  const user = await getUserById({ id });

  if (!user.data) {
    return res.status(400).send({ msg: "email not found!", data: null });
  }

  if (!user.data.isVerified) {
    return res.status(400).send({ msg: "email not verified!", data: null });
  }

  const resetPwCodeRedis = await redis.get(`resetPwCode:${user.data.id}`);

  if (!resetPwCodeRedis) {
    return res.status(400).send({ msg: "expired reset code", data: null });
  }
  
  if(resetPwCodeRedis !== passwordResetCode){
    return res.status(400).send({ msg: "invalid reset code", data: null });
  }

  try {
    const hashPw = await argon2.hash(password);

    await prisma.user.update({
      where: { email: user.data.email },
      data: { password: hashPw },
    });

    return res.send({ msg: "successfully reset password", data: null });
  } catch (error) {
    log.error(error);
    return res.status(500).send({ msg: error, data: null });
  }
};
