import prisma from "../config/prisma";

export const findAllPatients = async () => {
    const patients = await prisma.patient.findMany({
        include: {
            user: true
        }
    });
    return patients;
};
