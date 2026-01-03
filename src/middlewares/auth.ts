import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/response";
import { HttpStatus } from "../utils/httpStatus";
import { verifyToken } from "../utils/auth";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendError(res, "Invalid token format", HttpStatus.UNAUTHORIZED)
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return sendError(res, "Invalid token format", HttpStatus.UNAUTHORIZED)
        }

        const decodedToken = verifyToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        return sendError(res, "Unauthorized", HttpStatus.UNAUTHORIZED)
    }
}
