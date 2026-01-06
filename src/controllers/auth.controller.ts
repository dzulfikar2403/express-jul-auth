import { Request, Response } from "express";
import { TCreateSessionSchema } from "../schemas/auth.schema.js";
import { getUserByEmail } from "../services/user.service.js";
import argon2 from "argon2";
import { signJwt, verifyJwt } from "../utils/jwt.js";
import prisma from "../utils/prisma.js";
import { nanoid } from "nanoid";
import log from "../utils/logger.js";
import dayjs from "dayjs";
import { JwtPayload } from "jsonwebtoken";

export const createSessionHandler = async (req: Request, res: Response) => {
  const { email, password }: TCreateSessionSchema["body"] = req.body;

  const user = await getUserByEmail({ email });

  if (!user.data) {
    return res.status(400).send({ msg: "invalid credential", data: null });
  }

  if (!user.data.isVerified) {
    return res.status(400).send({ msg: "email not verified!", data: null });
  }

  const comparePw = await argon2.verify(user.data.password, password);

  if (!comparePw || user.data?.email !== email) {
    return res.status(400).send({ msg: "invalid credential", data: null });
  }

  const accessToken = signJwt({
    payload: { userId: user.data.id },
    key: "access",
  });

  const refreshToken = signJwt({
    payload: { userId: user.data.id },
    key: "refresh",
  });

  const hashRefreshToken = await argon2.hash(refreshToken);

  try {
    await prisma.refreshToken.create({
      data: {
        id: nanoid(),
        userId: user.data.id,
        tokenHash: hashRefreshToken,
        expiresAt: dayjs().add(14, "day").format(),
      },
    });

    return res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
      })
      .send({ msg: "successfully create session", data: null });
  } catch (error) {
    return res.status(500).send({ msg: error, data: null });
  }
};

export const refreshHandler = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).send({ msg: "unauthenticated", data: null });
  }

  const verifTokenRefresh = verifyJwt({
    token: refreshToken,
    key: "refresh",
  }) as JwtPayload;

  if (!verifTokenRefresh) {
    return res.status(401).send({ msg: "unauthorized", data: null });
  }

  const existsToken = await prisma.refreshToken.findMany({
    where: {
      userId: verifTokenRefresh.userId,
      revokeAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  let matchToken; 
  for (const et of existsToken) {
    if(await argon2.verify(et.tokenHash, refreshToken)){
      matchToken = et;
      break;
    }
  }

  if (!matchToken) {
    return res.status(403).send({ msg: "forbiden", data: null });
  }

  try {
    await prisma.refreshToken.update({
      where: { id: matchToken.id },
      data: {
        revokeAt: new Date(),
      },
    });

    const newAccessToken = signJwt({
      payload: { userId: matchToken.userId },
      key: "access",
    });
    const newRefreshToken = signJwt({
      payload: { userId: matchToken.userId },
      key: "refresh",
    });

    const hashRefreshToken = await argon2.hash(newRefreshToken);

    await prisma.refreshToken.create({
      data: {
        id: nanoid(),
        userId: verifTokenRefresh.userId,
        tokenHash: hashRefreshToken,
        expiresAt: dayjs().add(14, "day").format(),
      },
    });

    return res
      .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
      })
      .send({ msg: "successfully update refresh token", data: null });
  } catch (error) {
    return res.status(500).send({ msg: error, data: null });
  }
};
