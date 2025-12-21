import prisma from "../config/prisma"
import { AppointmenStatus } from "../../generated/prisma/client"

export const findAllAppointments = async () => {
    const appointments = await prisma.appointment.findMany({
        include: {
            patient: true,
            doctor: true,
            secretary: true,
            examinations: true
        }
    });
    return appointments
}
export const findAppointmentById = async (id: number) => {
    const appointments = await prisma.appointment.findUniqueOrThrow({
        where: { id },
        include: {
            patient: true,
            doctor: true,
            secretary: true,
            examinations: true
        }
    })
    return appointments
}
export const findAppointmentsByPatientId = async (patientId: number) => {
    const appointments = await prisma.appointment.findMany({
        where: { patientId },
        include: {
            patient: true,
            doctor: true,
            secretary: true,
            examinations: true
        }
    })
    return appointments
}
export const findAppointmentsByDoctorId = async (doctorId: number) => {
    const appointments = await prisma.appointment.findMany({
        where: { doctorId },
        include: {
            patient: true,
            doctor: true,
            secretary: true,
            examinations: true
        }
    })
    return appointments
}
export const createAppointment = async (data: any) => {
    const appointments = await prisma.appointment.create({
        data: data
    })
    return appointments
}
export const updateAppointmentStatus = async (id: number, status: AppointmenStatus) => {
    const appointments = await prisma.appointment.update({
        where: { id },
        data: { status: status }
    })
    return appointments
}