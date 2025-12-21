import { findAllDoctors, updateDoctor } from "../repository/doctor";

export const getAllDoctors = async () => {
    const doctors = await findAllDoctors();
    return doctors;
};

export const updateExistingDoctor = async (doctorId: number, data: any) => {
    const doctor = await updateDoctor(doctorId, data);
    return doctor;
};
