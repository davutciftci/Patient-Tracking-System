
import { findUserWithRoleData, updateUserById } from "../repostory/profile";

export const getMyProfile = async (userId: number, role: string) => {
    const includeOptions = {
        Doctor: role === "doctor",
        Patient: role === "patient",
        Secretary: role === "secretary"
    }
    const user = await findUserWithRoleData(userId, includeOptions);
    const profile = {
        id: user.id,
        name: user.firstName + " " + user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.joined_at,
        updatedAt: user.joined_at,
        roleData: user.Doctor || user.Patient || user.Secretary || null
    }

    return profile
}
export const updateMyProfile = async (userId: number, role: string, data: any) => {
    const user = await updateUserById(userId, data);
    const { password, ...profile } = user;
    return profile
}
