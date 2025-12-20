import prisma from "../config/prisma";

export const findAllClinics = async () => {
    const clinics = await prisma.clinic.findMany();
    return clinics;
}

export const findClinicById = async (clinicId: number) => {
    const clinic = await prisma.clinic.findUniqueOrThrow({
        where: { id: clinicId }
    })
    return clinic;
}

export const createClinic = async (data: any) => {
    const clinic = await prisma.clinic.create({
        data: data
    })
    return clinic
}

export const updateClinic = async (clinicId: number, data: any) => {
    const clinic = await prisma.clinic.update({
        where: { id: clinicId },
        data: data
    })
    return clinic
}

