import { Response } from "express";
import { HttpStatus } from "./httpStatus";

export const sendSuccess = <T>(res: Response, data?: T, statusCode: number = HttpStatus.OK) => {
    return res.status(statusCode).json({
        status: "success",
        ...data
    });
};

export const sendError = (res: Response, message: string, statusCode: number = HttpStatus.BAD_REQUEST) => {
    return res.status(statusCode).json({
        status: "error",
        message
    });
};