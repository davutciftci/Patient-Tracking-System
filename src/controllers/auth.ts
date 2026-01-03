import { sendError, sendSuccess } from "../utils/response";
import { HttpStatus } from "../utils/httpStatus";
import { generateToken } from "../utils/auth";
import { Request, Response } from "express";
import prisma from "../config/prisma";
import { Gender } from "../../generated/prisma/client";
import { comparePassword, hashPassword } from "../utils/password";



export const registerController = async (req: Request, res: Response) => {
    try {
        const { email, firstName, lastName, password, role, gender, tc_no, address, phoneNumber, birthDate } = req.body;

        const hashedPassword = await hashPassword(password);

        const parsedDate = new Date(birthDate);
        if (isNaN(parsedDate.getTime())) {
            return sendError(res, "Geçersiz doğum tarihi formatı", HttpStatus.BAD_REQUEST);
        }

        const year = parsedDate.getFullYear();
        if (year < 1900 || year > new Date().getFullYear()) {
            return sendError(res, "Lütfen geçerli bir doğum tarihi giriniz", HttpStatus.BAD_REQUEST);
        }

        const result = await prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new Error("Bu email kullanılıyor");
            }

            const existingTc = await tx.user.findUnique({ where: { tc_no } });
            if (existingTc) {
                throw new Error("Bu TC No zaten kayıtlı");
            }

            const newUser = await tx.user.create({
                data: {
                    email,
                    firstName,
                    lastName,
                    password: hashedPassword,
                    role,
                    gender: gender as Gender,
                    tc_no,
                    address,
                    phoneNumber,
                    birthDate: parsedDate
                }
            });

            if (role === 'doctor') {
                await tx.doctor.create({
                    data: {
                        userId: newUser.id,
                        speciality: 'Genel Pratisyen'
                    }
                });
            } else if (role === 'patient') {
                await tx.patient.create({
                    data: {
                        userId: newUser.id
                    }
                });
            } else if (role === 'secretary') {
                await tx.secretary.create({
                    data: {
                        userId: newUser.id
                    }
                });
            }

            return newUser;
        });

        sendSuccess(res, { message: "Kullanıcı oluşturuldu", userId: result.id, role: result.role });
    } catch (error: any) {
        console.error("Register Error:", error);
        const status = error.message === "Bu email kullanılıyor" || error.message === "Bu TC No zaten kayıtlı"
            ? HttpStatus.BAD_REQUEST
            : HttpStatus.INTERNAL_SERVER_ERROR;
        return sendError(res, error.message || "Bir hata oluştu", status);
    }
};

export const loginController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email: email } })

        if (!user) {
            return sendError(res, "Email veya şifre hatalı", HttpStatus.BAD_REQUEST)
        }

        const isPasswordValid = await comparePassword(password, user.password)

        if (!isPasswordValid) {
            return sendError(res, "Email veya şifre hatalı", HttpStatus.BAD_REQUEST)
        }

        const token = generateToken({ userId: user.id, role: user.role })

        return sendSuccess(res, { message: "Giriş başarılı", token, role: user.role, firstName: user.firstName, gender: user.gender })

    } catch {
        return sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR)
    }
}