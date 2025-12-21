import prisma from "../config/prisma";

export const findAllExaminations = async () => {
    const examinations = await prisma.examination.findMany();
    return examinations;
}

export const findExaminationById = async (id: number) => {
    const examinations = await prisma.examination.findUniqueOrThrow({
        where: { id }
    })
    return examinations;
}
export const findExaminationsByDoctorId = async (doctorId: number) => {
    const examinations = await prisma.examination.findMany({
        where: { doctorId }
    });
    return examinations
}

export const findExaminationsByPatientId = async (patientId: number) => {
    const examinations = await prisma.examination.findMany({
        where: {
            appointment: {
                some: {
                    patientId: patientId
                }
            }
        },
        include: {
            appointment: true,
            doctor: {
                include: {
                    user: true
                }
            }
        }
    });
    return examinations;
}

export const findExaminationsByAppointmentId = async (appointmentId: number) => {
    const examinations = await prisma.examination.findMany({
        where: { appointmentId }
    })
    return examinations
}
export const createExamination = async (data: any) => {
    const examinations = await prisma.examination.create({
        data: data
    })
    return examinations
}
export const updateExamination = async (id: number, data: any) => {
    const examinations = await prisma.examination.update({
        where: { id },
        data: data
    })
    return examinations
}
export const deleteExamination = async (id: number) => {
    const examinations = await prisma.examination.delete({
        where: { id }
    })
    return examinations
}