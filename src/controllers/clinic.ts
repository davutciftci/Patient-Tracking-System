import { Request, Response } from "express";
import { createNewClinic, getAllClinics, getClinicById, updateExistingClinic, deleteClinicById } from "../service/clinic";
import { sendError, sendSuccess } from "../utils/response";
import { HttpStatus } from "../utils/httpStatus";


export const getCliniccontroller = async (req: Request, res: Response) => {
    try {
        const clinics = await getAllClinics();
        sendSuccess(res, { clinics })
    } catch (error) {
        sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}

export const getClinicByIdController = async (req: Request, res: Response) => {
    try {
        const clinic = await getClinicById(parseInt(req.params.id))
        sendSuccess(res, { clinic })
    } catch (error) {
        sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
};

export const createNewClinicController = async (req: Request, res: Response) => {
    try {
        const clinic = await createNewClinic(req.body, req.user?.role!);
        sendSuccess(res, { clinic })
    } catch (error) {
        sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
};

export const updateExistingClinicController = async (req: Request, res: Response) => {
    try {
        const clinic = await updateExistingClinic(parseInt(req.params.id), req.body, req.user?.role!)
        sendSuccess(res, { clinic })
    } catch (error) {
        sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}
export const deleteClinicController = async (req: Request, res: Response) => {
    try {
        const clinic = await deleteClinicById(parseInt(req.params.id), req.user?.role!)
        sendSuccess(res, { clinic })
    } catch (error) {
        sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}