import {
    findAllAppointments,
    findAppointmentById,
    findAppointmentsByPatientId,
    findAppointmentsByDoctorId,
    createAppointment,
    updateAppointmentStatus
} from "../repostory/appointment";
import { AppointmenStatus } from "../../generated/prisma/client"

export const getAllAppointments = async (role: string) => {
    if (role !== "secretary" && role !== "doctor") {
        throw new Error("Bu işlem için yetkiniz yok")
    }
    const appointments = await findAllAppointments()
    return appointments
}

export const getAppointmentById = async (appointmentId: number) => {
    const appointment = await findAppointmentById(appointmentId)
    return appointment
}

export const getMyAppointmentsAsPatient = async (patientId: number) => {
    const appointments = await findAppointmentsByPatientId(patientId)
    return appointments
}

export const getMyAppointmentsAsDoctor = async (doctorId: number) => {
    const appointments = await findAppointmentsByDoctorId(doctorId)
    return appointments
};

export const createNewAppointment = async (data: any, role: string) => {
    if (role !== "secretary" && role !== "doctor") {
        throw new Error("Bu işlem için yetkiniz yok")
    }
    const appointment = await createAppointment(data)
    return appointment
}
export const updateAppointment = async (appointmenId: number, status: AppointmenStatus, role: string) => {
    if (role !== "doctor") {
        throw new Error("Bu işlem için yetkiniz yok")
    }
    const appointment = await updateAppointmentStatus(appointmenId, status)
    return appointment
}