import {
    findAllAppointments,
    findAppointmentById,
    findAppointmentsByPatientId,
    findAppointmentsByDoctorId,
    createAppointment,
    updateAppointmentStatus,
    updateAppointmentData
} from "../repository/appointment";
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

export const getMyAppointmentsAsDoctor = async (doctorId: number, filters?: any) => {
    const appointments = await findAppointmentsByDoctorId(doctorId, filters)
    return appointments
};

import prisma from "../config/prisma"; 

export const createNewAppointment = async (data: any, role: string) => {
    if (role !== "secretary" && role !== "patient" && role !== "doctor") { 
        throw new Error("Bu işlem için yetkiniz yok")
    }

    
    if (data.type === 'standard' || !data.type) {
        const doctor = await prisma.doctor.findUnique({
            where: { id: data.doctorId }
        });

        if (doctor) {
            const appointmentDate = new Date(data.date);
            const dayOfWeek = appointmentDate.getDay(); 
            
            

            
            if (doctor.workingDays) {
                const workingDays = doctor.workingDays.split(',').map(Number);
                if (!workingDays.includes(dayOfWeek)) {
                    throw new Error("Doktor bu gün çalışmıyor.");
                }
            }

            const appointmentTimeStr = appointmentDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

            
            if (doctor.dailySlots && doctor.dailySlots.length > 0) {
                const availableSlots = doctor.dailySlots.split(',');
                if (!availableSlots.includes(appointmentTimeStr)) {
                    throw new Error(`Seçilen saat (${appointmentTimeStr}) doktorun müsaitlik listesinde yok.`);
                }
            }
            
            else if (doctor.workingHourStart && doctor.workingHourEnd) {
                const [startHour, startMinute] = doctor.workingHourStart.split(':').map(Number);
                const [endHour, endMinute] = doctor.workingHourEnd.split(':').map(Number);

                const appointmentHour = appointmentDate.getHours();
                const appointmentMinute = appointmentDate.getMinutes();

                const appointmentTime = appointmentHour * 60 + appointmentMinute;
                const startTime = startHour * 60 + startMinute;
                const endTime = endHour * 60 + endMinute;

                const duration = doctor.appointmentDuration || 15;
                if (appointmentTime < startTime || (appointmentTime + duration) > endTime) {
                    throw new Error(`Doktorun çalışma saatleri: ${doctor.workingHourStart} - ${doctor.workingHourEnd}`);
                }
            }
        }
    }

    const appointment = await createAppointment(data)
    return appointment
}

export const updateAppointment = async (
    appointmentId: number,
    data: { status?: AppointmenStatus; doctorId?: number; date?: string; notes?: string },
    role: string,
    userId?: number
) => {
    
    
    if (role === "patient") {
        const existingAppointment = await findAppointmentById(appointmentId);
        if (existingAppointment.status !== "pending") {
            throw new Error("Sadece bekleyen randevuları düzenleyebilirsiniz")
        }
        
        const updateData: any = {};
        if (data.doctorId) updateData.doctorId = data.doctorId;
        if (data.date) updateData.date = new Date(data.date);
        if (data.notes !== undefined) updateData.notes = data.notes;
        if (data.status === "cancelled") updateData.status = "cancelled";

        const appointment = await updateAppointmentData(appointmentId, updateData);
        return appointment;
    }

    if (role !== "doctor" && role !== "secretary") {
        throw new Error("Bu işlem için yetkiniz yok")
    }

    
    if (data.status) {
        const appointment = await updateAppointmentStatus(appointmentId, data.status)
        return appointment
    }

    throw new Error("Güncellenecek veri bulunamadı")
}