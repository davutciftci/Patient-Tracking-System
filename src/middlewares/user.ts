import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../utils/httpStatus";
import { sendError } from "../utils/response";

export const checkTcNo = (req: Request, res: Response, next: NextFunction): void => {
    const { tc_no } = req.body;

    if (!tc_no) {
        sendError(res, "TC No is required", HttpStatus.BAD_REQUEST);
        return;
    }
    if (tc_no.length !== 11) {
        sendError(res, "TC No must be 11 characters long", HttpStatus.BAD_REQUEST);
        return;
    }
    if (!/^[0-9]+$/.test(tc_no)) {
        sendError(res, "TC No must be a number", HttpStatus.BAD_REQUEST);
        return;
    }
    next();
}