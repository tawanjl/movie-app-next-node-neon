import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.ts";
import type { Request, Response, NextFunction } from "express";


// Read the token from the request
// Check if token is valid
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error("JWT_SECRET is not defined!");
    }
    interface CustomJwtPayload extends jwt.JwtPayload {
      id: string;
    }

    const decoded = jwt.verify(token, secret) as CustomJwtPayload;

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ message: "Not authorized, no user" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
}