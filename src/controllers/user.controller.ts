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

export const createUserHandler = async (req: Request, res: Response) => {
  const data: TCreateUserSchema["body"] = req.body;

  const { confirmPassword, ...dataFinal } = data;

  try {
    const resPost = await postUser(dataFinal);
    log.info(resPost, "respost");

    const { data, error } = await resend.emails.send({
      from: "jul <example@dzulfikar2403.my.id>",
      to: [resPost.data.email],
      subject: "Verify Your Email!",
      html: `<p>id: ${resPost.data.id} <br> Verification Code: ${resPost.data.verificationCode}</p>`,
    });

    if (error) {
      return res.status(400).send(error);
    }

    return res.send({msg:"successfully regist",data:null});
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

  if (user.data.verificationCode === verificationCode) {
    await prisma.user.update({
      where: { id: id },
      data: { isVerified: true },
    });

    return res.send({ msg: "sucessfully verify", data: null });
  }

  return res.status(400).send({ msg: "could not verify user", data: null });
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
    const resPut = await prisma.user.update({
      where: { email: email },
      data: { passwordResetCode: nanoid() },
    });

    const { data, error } = await resend.emails.send({
      from: "jul <noreply@dzulfikar2403.my.id>",
      to: [resPut.email],
      subject: "forgot password code!",
      html: `<p>id: ${resPut.id} <br> Password Reset Code: ${resPut.passwordResetCode}</p>`,
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

  const { password, confirmPassword }: TResetPasswordSchema["body"] = req.body;

  const user = await getUserById({ id });
  
  if (!user.data) {
    return res.status(400).send({ msg: "email not found!", data: null });
  }

  if (!user.data.isVerified) {
    return res.status(400).send({ msg: "email not verified!", data: null });
  }

  if (
    !user.data.passwordResetCode ||
    user.data.passwordResetCode !== passwordResetCode
  ) {
    return res.status(400).send({ msg: "invalid reset code!", data: null });
  }

  try {
    const hashPw = await argon2.hash(password);

    const resPut = await prisma.user.update({
      where: { email: user.data.email },
      data: { password: hashPw, passwordResetCode: null },
    });


    return res.send({ msg: "successfully reset password", data: null });
  } catch (error) {
    log.error(error);
    return res.status(500).send({ msg: error, data: null });
  }
};
