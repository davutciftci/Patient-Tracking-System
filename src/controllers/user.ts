import { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response";
import { HttpStatus } from "../utils/httpStatus";
import { getMyProfile, changePassword } from "../service/profile";

export const getMeController = async (req: Request, res: Response) => {
    try {
        const user = await getMyProfile(req.user?.userId!, req.user?.role!)
        if (!user) {
            return sendError(res, "User not found", HttpStatus.NOT_FOUND)
        }
        return sendSuccess(res, { user })
    } catch (error) {
        return sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}

export const changePasswordController = async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return sendError(res, "Mevcut ve yeni şifre gereklidir", HttpStatus.BAD_REQUEST);
        }

        if (newPassword.length < 6) {
            return sendError(res, "Yeni şifre en az 6 karakter olmalıdır", HttpStatus.BAD_REQUEST);
        }

        const result = await changePassword(req.user?.userId!, currentPassword, newPassword);
        return sendSuccess(res, result);
    } catch (error: any) {
        return sendError(res, error.message || "Şifre değiştirilemedi", HttpStatus.BAD_REQUEST);
    }
}