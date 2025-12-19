import { NextFunction, Request, Response } from "express";

export const checkTcNo = (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { tcNo } = req.body.tcNo;
    if (!tcNo) {
        return Promise.resolve()
        res.status(400).json({ message: "TC No is required" });
    }
    if (tcNo.length !== 11) {
        return Promise.resolve()
        res.status(400).json({ message: "TC No must be 11 characters long" });
    }
    if (!/^[0-9]+$/.test(tcNo)) {
        return Promise.resolve()
        res.status(400).json({ message: "TC No must be a number" });
    }
    next();
    return Promise.resolve();
}