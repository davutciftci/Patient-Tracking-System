import prisma from "../config/prisma";

export const findAllDoctors = async () => {
    const doctors = await prisma.doctor.findMany({
        include: {
            user: true,
            clinic: true
        }
    });
    return doctors;
};

export const updateDoctor = async (id: number, data: any) => {
    const doctor = await prisma.doctor.update({
        where: { id },
        data: data,
        include: {
            user: true,
            clinic: true
        }
    });
    return doctor;
};
