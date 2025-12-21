import prisma from "../config/prisma";

export const findAllPatients = async () => {
    const patients = await prisma.patient.findMany({
        include: {
            user: true
        }
    });
    return patients;
};
export const findPatientsByDoctorId = async (doctorId: number) => {
    const patients = await prisma.patient.findMany({
        where: { doctorId },
        include: {
            user: true
        }
    });
    return patients;
};
