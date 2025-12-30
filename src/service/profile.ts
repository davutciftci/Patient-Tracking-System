
import prisma from "../config/prisma";
import { findUserWithRoleData, updateUserById } from "../repository/profile";
import { hashPassword, comparePassword } from "../utils/password";

export const getMyProfile = async (userId: number, role: string) => {
    const includeOptions = {
        Doctor: role === "doctor",
        Patient: role === "patient",
        Secretary: role === "secretary"
    }
    const user = await findUserWithRoleData(userId, includeOptions);
    const profile: any = {
        id: user.id,
        name: user.firstName + " " + user.lastName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        birthDate: user.birthDate,
        role: user.role,
        gender: user.gender,
        createdAt: user.joined_at,
        updatedAt: user.joined_at,
        
        notifySms: user.notifySms,
        notifyEmail: user.notifyEmail,
        notifyApp: user.notifyApp,
        
        emergencyName: user.emergencyName,
        emergencyPhone: user.emergencyPhone,
        emergencyRelation: user.emergencyRelation,
        roleData: user.Doctor || user.Patient || user.Secretary || null
    }

    if (role === 'doctor' && user.Doctor) {
        profile.doctorSettings = {
            speciality: user.Doctor.speciality,
            workingDays: user.Doctor.workingDays,
            workingHourStart: user.Doctor.workingHourStart,
            workingHourEnd: user.Doctor.workingHourEnd,
            appointmentDuration: user.Doctor.appointmentDuration,
            dailySlots: user.Doctor.dailySlots
        };
    }

    return profile
}

export const updateMyProfile = async (userId: number, role: string, data: any) => {
    const { Doctor, Patient, Secretary, dailySlots, workingDays, workingHourStart, workingHourEnd, appointmentDuration, ...userData } = data;

    const user = await updateUserById(userId, userData);

    
    const doctorUpdateData: any = {};
    if (dailySlots !== undefined) doctorUpdateData.dailySlots = dailySlots;
    if (workingDays !== undefined) doctorUpdateData.workingDays = workingDays;
    if (workingHourStart !== undefined) doctorUpdateData.workingHourStart = workingHourStart;
    if (workingHourEnd !== undefined) doctorUpdateData.workingHourEnd = workingHourEnd;
    if (appointmentDuration !== undefined) doctorUpdateData.appointmentDuration = appointmentDuration;

    
    if (Doctor?.update) {
        Object.assign(doctorUpdateData, Doctor.update);
    }

    if (role === 'doctor' && Object.keys(doctorUpdateData).length > 0) {
        await prisma.doctor.update({
            where: { userId: userId },
            data: doctorUpdateData
        });
    }

    return getMyProfile(userId, role);
}

export const changePassword = async (userId: number, currentPassword: string, newPassword: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new Error("Kullanıcı bulunamadı");
    }

    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
        throw new Error("Mevcut şifre yanlış");
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });

    return { success: true, message: "Şifre başarıyla değiştirildi" };
}
