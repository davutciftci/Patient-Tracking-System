import { findAllDoctors } from "../repostory/doctor";

export const getAllDoctors = async () => {
    const doctors = await findAllDoctors();
    return doctors;
};
