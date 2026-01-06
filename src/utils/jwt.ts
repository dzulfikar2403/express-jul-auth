import jwt from "jsonwebtoken";
import config from "./config.js";

type TSignJwt = {
  payload: {
    userId: string;
  };
  key: "access" | "refresh";
};

type TVerifyJwt = {
  token: string;
  key: "access" | "refresh";
};

export const signJwt = ({ payload, key }: TSignJwt) => {
  const secretKey =
    key === "access" ? config.env.JWT_ACCESS_KEY : config.env.JWT_REFRESH_KEY;

  const expiresTime = key === "access" ? "1h" : "14d";

  const sign = jwt.sign(payload, secretKey, {
    expiresIn: expiresTime,
  });

  return sign;
};

export const verifyJwt = ({ token, key }: TVerifyJwt) => {
  const secretKey =
    key === "access" ? config.env.JWT_ACCESS_KEY : config.env.JWT_REFRESH_KEY;

  try {
    const verify = jwt.verify(token, secretKey);
    return verify;
  } catch (error) {
    return null;
  }
};
