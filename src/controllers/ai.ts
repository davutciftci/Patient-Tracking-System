import { Request, Response } from "express";
import { generateDiagnosisSuggestion } from "../service/ai";
import { sendError, sendSuccess } from "../utils/response";
import { HttpStatus } from "../utils/httpStatus";

export const getDiagnosisSuggestionController = async (req: Request, res: Response) => {
    try {
        const { symptoms } = req.body;

        if (!symptoms) {
            return sendError(res, "Lütfen hasta şikayetlerini giriniz.", HttpStatus.BAD_REQUEST);
        }

        const suggestion = await generateDiagnosisSuggestion(symptoms);
        sendSuccess(res, suggestion);
    } catch (error: any) {
        sendError(res, error.message || "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR);
    }
};
