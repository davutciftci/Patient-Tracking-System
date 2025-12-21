import { Request, Response } from "express"
import { sendError, sendSuccess } from "../utils/response"
import { HttpStatus } from "../utils/httpStatus"
import {
    getAllAppointments,
    getAppointmentById,
    getMyAppointmentsAsPatient,
    getMyAppointmentsAsDoctor,
    createNewAppointment,
    updateAppointment
} from "../service/appointment"

export const getAllAppointmentController = async (req: Request, res: Response) => {
    try {
        const appointments = await getAllAppointments(req.user?.role!)
        sendSuccess(res, { appointments })
    } catch (error) {
        sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}

export const getAppointmentByIdController = async (req: Request, res: Response) => {
    try {
        const appointment = await getAppointmentById(parseInt(req.params.id))
        sendSuccess(res, { appointment })
    } catch (error) {
        sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}

export const getMyAppointmentsAsPatientController = async (req: Request, res: Response) => {
    try {
        const appointments = await getMyAppointmentsAsPatient(parseInt(req.params.patientId))
        sendSuccess(res, { appointments })
    } catch (error) {
        sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}
export const getMyAppointmentsAsDoctorController = async (req: Request, res: Response) => {
    try {
        const appointments = await getMyAppointmentsAsDoctor(parseInt(req.params.doctorId))
        sendSuccess(res, { appointments })
    } catch (error) {
        sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}
export const createAppointmentController = async (req: Request, res: Response) => {
    try {
        const appointmentData = {
            ...req.body,
            status: req.body.status || 'pending'
        };
        console.log('Creating appointment with data:', JSON.stringify(appointmentData, null, 2));
        const appointments = await createNewAppointment(appointmentData, req.user?.role!)
        sendSuccess(res, appointments)
    } catch (error: any) {
        console.error('Appointment creation error:', error.message, error);
        sendError(res, error.message || "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}
export const updateAppointmentController = async (req: Request, res: Response) => {
    try {
        const appointments = await updateAppointment(parseInt(req.params.id), req.body.status, req.user?.role!)
        sendSuccess(res, appointments)
    } catch (error: any) {
        console.error("Update appointment error:", error);
        sendError(res, error.message || "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}

