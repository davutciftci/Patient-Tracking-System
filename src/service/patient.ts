import { findAllPatients, findPatientsByDoctorId } from "../repository/patient";

export const getAllPatients = async () => {
    const patients = await findAllPatients();
    return patients;
};

export const getPatientsByDoctor = async (doctorId: number) => {
    const patients = await findPatientsByDoctorId(doctorId);
    return patients;
};
