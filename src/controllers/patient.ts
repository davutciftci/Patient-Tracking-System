import { Request, Response } from "express";
import { getAllPatients, getPatientsByDoctor } from "../service/patient";
import { sendSuccess, sendError } from "../utils/response";
import { HttpStatus } from "../utils/httpStatus";

export const getAllPatientsController = async (req: Request, res: Response) => {
    try {
        const patients = await getAllPatients();
        sendSuccess(res, { patients });
    } catch (error) {
        sendError(res, "Hastalar getirilemedi", HttpStatus.INTERNAL_SERVER_ERROR);
    }
};
export const getPatientsByDoctorController = async (req: Request, res: Response) => {
    try {
        const patients = await getPatientsByDoctor(parseInt(req.params.doctorId));
        sendSuccess(res, { patients });
    } catch (error) {
        sendError(res, "Hastalar getirilemedi", HttpStatus.INTERNAL_SERVER_ERROR);
    }
};

export const updatePatientController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { updatePatient } = require("../service/patient");
        const patient = await updatePatient(id, req.body);
        sendSuccess(res, { patient });
    } catch (error) {
        sendError(res, "Hasta güncellenemedi", HttpStatus.INTERNAL_SERVER_ERROR);
    }
};
