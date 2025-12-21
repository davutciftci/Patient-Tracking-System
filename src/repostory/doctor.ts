import prisma from "../config/prisma";

export const findAllDoctors = async () => {
    const doctors = await prisma.doctor.findMany({
        include: {
            user: true
        }
    });
    return doctors;
};
