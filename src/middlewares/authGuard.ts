import { NextFunction, Request, Response } from "express";
import { signJwt, verifyJwt } from "../utils/jwt.js";
import log from "../utils/logger.js";
import prisma from "../utils/prisma.js";
import { JwtPayload } from "jsonwebtoken";
import argon2 from "argon2";

export const authGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).send({ msg: "unauthenticated", data: null });
    }

    if (accessToken) {
      try {
        const verifAccessToken = verifyJwt({
          token: accessToken,
          key: "access",
        });

        if (!verifAccessToken) {
          return res.status(401).send({ msg: "unauthorized", data: null });
        }

        return next();
      } catch (error) {
        return res
          .status(401)
          .send({ msg: "invalid access token", data: null });
      }
    }

    const verifyRefreshToken = verifyJwt({
      token: refreshToken,
      key: "refresh",
    }) as JwtPayload;

    if (!verifyRefreshToken) {
      return res
        .status(401)
        .send({ msg: "unauthorized refresh token not valid", data: null });
    }

    const existTokenRefresh = await prisma.refreshToken.findMany({
      where: {
        userId: verifyRefreshToken.userId,
        revokeAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    let isRefreshTokenMatch;
    for (const etr of existTokenRefresh) {
      if (await argon2.verify(etr.tokenHash, refreshToken)) {
        isRefreshTokenMatch = etr;
        break;
      }
    }

    if (!isRefreshTokenMatch) {
      return res.status(403).send({ msg: "forbiden", data: null });
    }

    const newAccessToken = signJwt({
      payload: { userId: isRefreshTokenMatch.userId },
      key: "access",
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    next();
  } catch (error) {
    return res.status(401).send({ msg: "unauthenticated", data: null });
  }
};
