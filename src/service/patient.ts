import { findAllPatients } from "../repostory/patient";

export const getAllPatients = async () => {
    const patients = await findAllPatients();
    return patients;
};
