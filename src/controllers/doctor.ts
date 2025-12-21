import { Request, Response } from "express";
import { getAllDoctors } from "../service/doctor";
import { sendSuccess, sendError } from "../utils/response";
import { HttpStatus } from "../utils/httpStatus";

export const getAllDoctorsController = async (req: Request, res: Response) => {
    try {
        const doctors = await getAllDoctors();
        sendSuccess(res, { doctors });
    } catch (error) {
        sendError(res, "Doktorlar getirilemedi", HttpStatus.INTERNAL_SERVER_ERROR);
    }
};
