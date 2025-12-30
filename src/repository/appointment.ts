import prisma from "../config/prisma"
import { AppointmenStatus } from "../../generated/prisma/client"

export const findAllAppointments = async () => {
    const appointments = await prisma.appointment.findMany({
        include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true, clinic: true } },
            secretary: { include: { user: true } },
            examination: true
        }
    });
    return appointments
}
export const findAppointmentById = async (id: number) => {
    const appointments = await prisma.appointment.findUniqueOrThrow({
        where: { id },
        include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true, clinic: true } },
            secretary: { include: { user: true } },
            examination: true
        }
    })
    return appointments
}
export const findAppointmentsByPatientId = async (patientId: number) => {
    const appointments = await prisma.appointment.findMany({
        where: { patientId },
        include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true, clinic: true } },
            secretary: { include: { user: true } },
            examination: true
        }
    })
    return appointments
}
export const findAppointmentsByDoctorId = async (doctorId: number, filters?: { date?: Date, status?: AppointmenStatus, patientName?: string }) => {
    const whereClause: any = { doctorId };

    if (filters?.date) {
        
        const startOfDay = new Date(filters.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filters.date);
        endOfDay.setHours(23, 59, 59, 999);

        whereClause.date = {
            gte: startOfDay,
            lte: endOfDay
        };
    }

    if (filters?.status) {
        whereClause.status = filters.status;
    }

    if (filters?.patientName) {
        whereClause.patient = {
            user: {
                OR: [
                    { firstName: { contains: filters.patientName } },
                    { lastName: { contains: filters.patientName } }
                ]
            }
        };
    }

    const appointments = await prisma.appointment.findMany({
        where: whereClause,
        include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true, clinic: true } },
            secretary: { include: { user: true } },
            examination: true
        },
        orderBy: {
            date: 'asc'
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

export const updateAppointmentData = async (id: number, data: { doctorId?: number; date?: Date; notes?: string; status?: AppointmenStatus }) => {
    const appointment = await prisma.appointment.update({
        where: { id },
        data: data
    })
    return appointment
}