
import { sendError, sendSuccess } from "../utils/response"
import { HttpStatus } from "../utils/httpStatus"
import { Request, Response } from "express"
import { updateMyProfile } from "../service/profile"

export const updateMeController = async (req: Request, res: Response) => {
    const {
        firstName, lastName, email, address, phoneNumber, birthDate, speciality,
        notifySms, notifyEmail, notifyApp,
        emergencyName, emergencyPhone, emergencyRelation
    } = req.body;

    try {
        const updateData: any = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (email) updateData.email = email;
        if (address) updateData.address = address;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (birthDate) updateData.birthDate = new Date(birthDate);

        
        if (notifySms !== undefined) updateData.notifySms = notifySms;
        if (notifyEmail !== undefined) updateData.notifyEmail = notifyEmail;
        if (notifyApp !== undefined) updateData.notifyApp = notifyApp;

        
        if (emergencyName !== undefined) updateData.emergencyName = emergencyName || null;
        if (emergencyPhone !== undefined) updateData.emergencyPhone = emergencyPhone || null;
        if (emergencyRelation !== undefined) updateData.emergencyRelation = emergencyRelation || null;

        if (req.user?.role === 'doctor') {
            const doctorUpdate: any = {};
            if (speciality) doctorUpdate.speciality = speciality;
            if (req.body.workingDays) doctorUpdate.workingDays = req.body.workingDays;
            if (req.body.workingHourStart) doctorUpdate.workingHourStart = req.body.workingHourStart;
            if (req.body.workingHourEnd) doctorUpdate.workingHourEnd = req.body.workingHourEnd;
            if (req.body.appointmentDuration) doctorUpdate.appointmentDuration = parseInt(req.body.appointmentDuration);
            if (req.body.dailySlots !== undefined) doctorUpdate.dailySlots = req.body.dailySlots;

            if (Object.keys(doctorUpdate).length > 0) {
                updateData.Doctor = {
                    update: doctorUpdate
                };
            }
        }

        console.log('Update request:', { userId: req.user?.userId, data: updateData });
        const updatedUser = await updateMyProfile(req.user?.userId!, req.user?.role!, updateData);
        if (!updatedUser) {
            return sendError(res, "User not found", HttpStatus.NOT_FOUND)
        }
        return sendSuccess(res, { updatedUser })
    } catch (error: any) {
        console.error('Update error:', error.message, error);
        return sendError(res, error.message || "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}