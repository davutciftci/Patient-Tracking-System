import { Request, Response } from "express";
import { getAllDoctors, updateExistingDoctor } from "../service/doctor";
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

export const updateExistingDoctorController = async (req: Request, res: Response) => {
    try {
        const doctor = await updateExistingDoctor(parseInt(req.params.id), req.body);
        sendSuccess(res, { doctor });
    } catch (error) {
        sendError(res, "Doktor güncellenemedi", HttpStatus.INTERNAL_SERVER_ERROR);
    }
};
