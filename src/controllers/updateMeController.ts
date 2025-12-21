
import { sendError, sendSuccess } from "../utils/response"
import { HttpStatus } from "../utils/httpStatus"
import { Request, Response } from "express"
import { updateMyProfile } from "../service/profile"

export const updateMeController = async (req: Request, res: Response) => {
    const { firstName, lastName, email, address, phoneNumber, birthDate, speciality } = req.body;

    try {
        const updateData: any = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (email) updateData.email = email;
        if (address) updateData.address = address;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (birthDate) updateData.birthDate = new Date(birthDate);

        if (req.user?.role === 'doctor' && speciality) {
            updateData.Doctor = {
                update: {
                    speciality: speciality
                }
            };
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