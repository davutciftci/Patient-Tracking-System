import { createExamination, deleteExamination, findAllExaminations, findExaminationById, findExaminationsByAppointmentId, findExaminationsByDoctorId, findExaminationsByPatientId, updateExamination } from "../repository/examination";

export const getAllExaminations = async () => {
    const examinations = await findAllExaminations();
    return examinations
}
export const getExaminationsById = async (examinationsId: number) => {
    const examinations = await findExaminationById(examinationsId)
    return examinations
}
export const getExaminationsByDoctorId = async (doctorId: number) => {
    const examinations = await findExaminationsByDoctorId(doctorId)
    return examinations
}
export const getExaminationsByPatientId = async (patientId: number) => {
    const examinations = await findExaminationsByPatientId(patientId)
    return examinations
}
export const createNewExaminations = async (data: any, role: string) => {
    if (role !== "doctor") {
        throw new Error("Bu işlem için yetkiniz yok")
    }
    const examinations = await createExamination(data)
    return examinations
}

export const updateExistingExaminations = async (examinationsId: number, data: any, role: string) => {
    if (role !== "doctor") {
        throw new Error("Bu işlem için yetkiniz yok")
    }
    const examinations = await updateExamination(examinationsId, data)
    return examinations
}

export const deleteExaminationsById = async (examinationsId: number, role: string) => {
    if (role !== "doctor") {
        throw new Error("Bu işlem için yetkiniz yok")
    }
    const examinations = await deleteExamination(examinationsId)
    return examinations
}
