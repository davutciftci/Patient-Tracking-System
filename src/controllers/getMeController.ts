import { HttpStatus } from "../utils/httpStatus"
import { sendError, sendSuccess } from "../utils/response"
import { Request, Response } from "express"
import { getMyProfile } from "../service/profile"

export const getMeController = async (req: Request, res: Response) => {
    try {
        const user = await getMyProfile(parseInt(req.user?.userId!), req.user?.role!)
        if (!user) {
            return sendError(res, "User not found", HttpStatus.NOT_FOUND)
        }
        return sendSuccess(res, { user })
    } catch (error) {
        return sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}
