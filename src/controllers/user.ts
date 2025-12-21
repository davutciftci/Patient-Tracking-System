import prisma from "../config/prisma";
import { Gender } from "../../generated/prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { generateToken } from "../model/auth";
import { comparePassword, hashPassword } from "../utils/password";
import { sendError, sendSuccess } from "../utils/response";
import { HttpStatus } from "../utils/httpStatus";
import { checkTcNo } from "../middlewares/user";



export const registerController = async (req: Request, res: Response) => {
    try {
        const { email, firstName, lastName, password, role, gender, tc_no, address, phoneNumber, birthDate } = req.body;

        // Email kontrolü
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return sendError(res, "Bu email kullanılıyor", HttpStatus.BAD_REQUEST);
        }

        // TC No kontrolü
        const existingTc = await prisma.user.findUnique({
            where: { tc_no }
        });

        if (existingTc) {
            return sendError(res, "Bu TC No zaten kayıtlı", HttpStatus.BAD_REQUEST);
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await prisma.user.create({
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
                birthDate: new Date(birthDate)
            }
        });

        // Rol tabanlı kayıt oluşturma
        if (role === 'doctor') {
            await prisma.doctor.create({
                data: {
                    userId: newUser.id,
                    speciality: 'Genel Pratisyen' // Default, daha sonra güncellenebilir
                }
            });
        } else if (role === 'patient') {
            await prisma.patient.create({
                data: {
                    userId: newUser.id
                }
            });
        } else if (role === 'secretary') {
            await prisma.secretary.create({
                data: {
                    userId: newUser.id
                }
            });
        }
        sendSuccess(res, { message: "Kullanıcı oluşturuldu", userId: newUser.id, role: newUser.role });
    } catch (error: any) {
        console.error("Register Error:", error);
        return sendError(res, "Bir hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR);
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