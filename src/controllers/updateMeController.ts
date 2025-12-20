
import { sendError, sendSuccess } from "../utils/response"
import { HttpStatus } from "../utils/httpStatus"
import { Request, Response } from "express"
import { updateMyProfile } from "../service/profile"

export const updateMeController = async (req: Request, res: Response) => {
    const { firstName, lastName, email, address, phoneNumber, birthDate } = req.body;

    try {
        const updatedUser = await updateMyProfile(parseInt(req.user?.userId!), req.user?.role!, { firstName, lastName, email, address, phoneNumber, birthDate });
        if (!updatedUser) {
            return sendError(res, "User not found", HttpStatus.NOT_FOUND)
        }
        return sendSuccess(res, { updatedUser })
    } catch (error) {
        return sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}