import prisma from "../config/prisma";
import { Gender } from "../../generated/prisma/client";
import { UserCreateDto } from "../types/type";
import { hashPassword } from "../utils/util";

export class UserModel {
    static async create(body: UserCreateDto) {
        if (!body.role || !body.email) {
            return Promise.reject("Role ve email zorunlu alanlardır.");
        }
        if (body.role !== "doctor" && body.role !== "patient" && body.role !== "secretary") {
            return Promise.reject("Geçersiz role");
        }
        const hashedPassword = await hashPassword(body.password);
        try {
            const existingTcNo = await prisma.user.findUnique({ where: { tc_no: body.tc_no } })
            if (existingTcNo) {
                return Promise.reject("Bu Tc No kullanılıyor");
            }
            const user = await prisma.user.create({
                data: {
                    email: body.email,
                    firstName: body.firstName,
                    lastName: body.lastName,
                    password: hashedPassword,
                    role: body.role,
                    gender: body.gender as Gender,
                    tc_no: body.tc_no,
                    address: body.address,
                    phoneNumber: body.phoneNumber,
                    birthDate: new Date(body.birthDate),
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    gender: true,
                    tc_no: true,
                    address: true,
                    phoneNumber: true,
                    birthDate: true,
                }
            })

            if (user.role === "doctor") {
                const academica = body.specialty || "";
                const experience = body.experience || "";
                const clinicId = body.clinicId || 0;

                if (!academica || !experience || !clinicId) {
                    throw new Error("Akademik ve deneyim bilgileri zorunlu alanlardır.");
                }

                const doctor = await prisma.doctor.create({
                    data: {
                        userId: user.id,
                        speciality: body.specialty,
                        clinicId: Number(body.clinicId)
                    }
                });
                return { ...user, doctor };
            }
            return Promise.resolve(user);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}