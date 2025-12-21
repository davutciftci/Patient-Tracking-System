import { createClinic, deleteClinic, findAllClinics, findClinicById, updateClinic } from "../repository/clinic"

export const getAllClinics = async () => {
    const clinics = await findAllClinics()
    return clinics
}
export const getClinicById = async (clinicId: number) => {
    const clinic = await findClinicById(clinicId)
    return clinic
}
export const createNewClinic = async (data: any, role: string) => {
    if (role !== "secretary") {
        throw new Error("Bu işlem için yetkiniz yok")
    }
    const clinic = await createClinic(data)
    return clinic
}

export const updateExistingClinic = async (clinicId: number, data: any, role: string) => {
    if (role !== "secretary") {
        throw new Error("Bu işlem için yetkiniz yok")
    }
    const clinic = await updateClinic(clinicId, data);
    return clinic
}

export const deleteClinicById = async (clinicId: number, role: string) => {
    if (role !== "secretary") {
        throw new Error("Bu işlem için yetkiniz yok")
    }
    const clinic = await deleteClinic(clinicId)
    return clinic
}
