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
        const filters = {
            date: req.query.date ? new Date(req.query.date as string) : undefined,
            status: req.query.status as any,
            patientName: req.query.patientName as string
        };
        const appointments = await getMyAppointmentsAsDoctor(parseInt(req.params.doctorId), filters)
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
        const appointmentId = parseInt(req.params.id);
        const updateData = {
            status: req.body.status,
            doctorId: req.body.doctorId,
            date: req.body.date,
            notes: req.body.notes
        };
        const appointment = await updateAppointment(appointmentId, updateData, req.user?.role!, req.user?.userId)
        sendSuccess(res, appointment)
    } catch (error: any) {
        console.error("Update appointment error:", error);
        sendError(res, error.message || "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}

