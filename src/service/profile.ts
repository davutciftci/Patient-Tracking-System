
import prisma from "../config/prisma";
import { findUserWithRoleData, updateUserById } from "../repository/profile";

export const getMyProfile = async (userId: number, role: string) => {
    const includeOptions = {
        Doctor: role === "doctor",
        Patient: role === "patient",
        Secretary: role === "secretary"
    }
    const user = await findUserWithRoleData(userId, includeOptions);
    const profile = {
        id: user.id,
        name: user.firstName + " " + user.lastName,
        email: user.email,
        role: user.role,
        gender: user.gender,
        createdAt: user.joined_at,
        updatedAt: user.joined_at,
        roleData: user.Doctor || user.Patient || user.Secretary || null
    }

    return profile
}
export const updateMyProfile = async (userId: number, role: string, data: any) => {
    const { Doctor, Patient, Secretary, ...userData } = data;

    const user = await updateUserById(userId, userData);

    if (role === 'doctor' && Doctor?.update) {
        await prisma.doctor.update({
            where: { userId: userId },
            data: Doctor.update
        });
    }

    return getMyProfile(userId, role);
}
