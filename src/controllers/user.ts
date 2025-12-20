import prisma from "../config/prisma";
import { Gender } from "../../generated/prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { generateToken } from "../model/auth";
import { comparePassword, hashPassword } from "../utils/password";



export const registerController = async (req: Request, res: Response) => {
    try {
        const { email, firstName, lastName, password, role, gender, tc_no, address, phoneNumber, birthDate } = req.body;

        // Email kontrolü
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: "Bu email kullanılıyor" });
        }

        // TC No kontrolü
        const existingTc = await prisma.user.findUnique({
            where: { tc_no }
        });

        if (existingTc) {
            return res.status(400).json({ message: "Bu TC No zaten kayıtlı" });
        }

        // TC No format kontrolü
        if (!tc_no || tc_no.length !== 11 || !/^[0-9]+$/.test(tc_no)) {
            return res.status(400).json({ message: "TC No 11 haneli ve sadece rakamlardan oluşmalıdır" });
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

        return res.status(201).json({ message: "Kullanıcı oluşturuldu", userId: newUser.id, role: newUser.role });
    } catch (error: any) {
        console.error("Register Error:", error);
        return res.status(500).json({ message: "Bir hata oluştu", error: error?.message || error });
    }
};


export const loginController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email: email } })

        if (!user) {
            return res.status(400).json({ message: "Email veya şifre hatalı" })
        }

        const isPasswordValid = await comparePassword(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Email veya şifre hatalı" })
        }

        const token = generateToken({ userId: user.id.toString() })

        return res.status(200).json({ message: "Giriş başarılı", token, role: user.role, firstName: user.firstName, gender: user.gender })

    } catch {
        return res.status(500).json({ message: "Bir hata oluştu" })
    }
}