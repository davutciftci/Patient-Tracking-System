import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { TokenPayload } from "../types/type";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = "12h";

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET!, { expiresIn: TOKEN_EXPIRY })
}

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_SECRET!) as TokenPayload
}