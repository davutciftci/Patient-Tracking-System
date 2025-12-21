export interface TokenPayload {
    userId: number;
    role: string;
}

export interface UserRole {
    doctor: string;
    patient: string;
    secretary: string;
}

export interface AppointmentStatus {
    pending: string;
    completed: string;
    cancelled: string;
}

export interface UserCreateDto {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: string;
    gender: string;
    tc_no: string;
    address: string;
    phoneNumber: string;
    birthDate: string;
    clinicId: string;
    specialty: string;
    experience: string;
}

export interface UserUpdateDto {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    address?: string;
    phoneNumber?: string;
    birthDate?: string;
}

export interface CreateAppointmentDto {
    patientId: string;
    doctorId: string;
    date: string;
    time: string;
    status: string;
    description: string;
    secretaryId: string;
}

export interface UpdateAppointmentDto {
    date?: string;
    time?: string;
    status?: string;
    description?: string;
}

export interface CreateExaminationDto {
    appointmentId: string;
    diagnosis: string;
    treatment: string;
    notes: string;
}

export interface UpdateExaminationDto {
    diagnosis?: string;
    treatment?: string;
    notes?: string;
}

export interface CreateClinicDto {
    name: string;
}

export interface UpdateClinicDto {
    name?: string;
}