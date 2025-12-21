import { createNewExaminations, deleteExaminationsById, getAllExaminations, getExaminationsByDoctorId, getExaminationsById, getExaminationsByPatientId, updateExistingExaminations } from "../service/examinations";
import { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response";
import { HttpStatus } from "../utils/httpStatus";

export const getAllExaminationsController = async (req: Request, res: Response) => {
    try {
        const examinations = await getAllExaminations();
        sendSuccess(res, { examinations })
    } catch (error) {
        sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }

}
export const getExaminationsByIdController = async (req: Request, res: Response) => {
    try {
        const examinations = await getExaminationsById(parseInt(req.params.id))
        sendSuccess(res, { examinations })
    } catch (error) {
        sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }

}
export const getExaminationsByDoctorIdController = async (req: Request, res: Response) => {
    try {
        const examinations = await getExaminationsByDoctorId(parseInt(req.params.doctorId))
        sendSuccess(res, { examinations })
    } catch (error) {
        sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }

}
export const getExaminationsByPatientIdController = async (req: Request, res: Response) => {
    try {
        console.log(`Getting examinations for patientId: ${req.params.patientId}`);
        const examinations = await getExaminationsByPatientId(parseInt(req.params.patientId));
        console.log(`Found ${examinations.length} examinations`);
        sendSuccess(res, { examinations })
    } catch (error: any) {
        console.error('Error in getExaminationsByPatientIdController:', error);
        sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}
import prisma from "../config/prisma";

export const createNewExaminationsController = async (req: Request, res: Response) => {
    try {
        console.log('Creating examination request:', req.body);

        const doctor = await prisma.doctor.findUnique({
            where: { userId: req.user?.userId }
        });

        if (!doctor) {
            return sendError(res, "Doktor profili bulunamadı. Lütfen tekrar giriş yapın.", HttpStatus.NOT_FOUND);
        }

        console.log(`Checking appointment existence for ID: ${req.body.appointmentId} (Type: ${typeof req.body.appointmentId})`);

        const existingExam = await prisma.examination.findUnique({
            where: { appointmentId: req.body.appointmentId }
        });

        const appointment = await prisma.appointment.findUnique({
            where: { id: req.body.appointmentId }
        });

        if (!appointment) {
            return sendError(res, "Randevu bulunamadı.", HttpStatus.NOT_FOUND);
        }

        if (existingExam) {
            return sendError(res, "Bu randevu için zaten bir muayene kaydı mevcut.", HttpStatus.BAD_REQUEST);
        }

        const examinationData = {
            ...req.body,
            doctorId: doctor.id
        };

        console.log('Final examination data:', examinationData);
        const examinations = await createNewExaminations(examinationData, req.user?.role!)

        await prisma.appointment.update({
            where: { id: req.body.appointmentId },
            data: { status: 'completed' }
        });

        await prisma.patient.update({
            where: { id: appointment.patientId },
            data: { doctorId: doctor.id }
        });

        sendSuccess(res, { examinations })
    } catch (error: any) {
        console.error('Examination creation error:', error.message, error);
        sendError(res, error.message || "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}

export const updateExistingExaminationsController = async (req: Request, res: Response) => {
    try {
        const examinations = await updateExistingExaminations(parseInt(req.params.id), req.body, req.user?.role!)
        sendSuccess(res, { examinations })
    } catch (error) {
        sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}

export const deleteExaminationsByIdController = async (req: Request, res: Response) => {
    try {
        const examinations = await deleteExaminationsById(parseInt(req.params.id), req.user?.role!)
        sendSuccess(res, { examinations })
    } catch (error) {
        sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}
