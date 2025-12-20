import prisma from "../config/prisma"

export const findUserById = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        throw new Error("Kullanıcı bulunamadı")
    }


    return user
}

export const findUserWithRoleData = async (userId: number, includeOptions: { Doctor: boolean, Patient: boolean, Secretary: boolean }) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        },
        include: {
            Doctor: includeOptions.Doctor,
            Patient: includeOptions.Patient,
            Secretary: includeOptions.Secretary
        }
    })

    return user
}

export const updateUserById = async (userId: number, data: any) => {
    const user = await prisma.user.update({
        where: {
            id: userId
        },
        data: data
    })
    return user
}