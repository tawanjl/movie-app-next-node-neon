import jwt from "jsonwebtoken"
import type { Response } from "express"

export const generateToken = (userId: string, res: Response) => {
  const payload = { id: userId }
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error("JWT_SECRET is not defined!")
  }

  const token = jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN as any,
  })

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7
  })
  return token
}