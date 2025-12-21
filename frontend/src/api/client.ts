import axios from 'axios';

const API_BASE_URL = 'http://localhost:3005';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const login = async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data;
};

export const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'patient' | 'doctor' | 'secretary';
    tc_no: string;
    address: string;
    phoneNumber: string;
    birthDate: string;
}) => {
    const response = await api.post('/register', userData);
    return response.data;
};

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllPatients = async () => {
    const response = await api.get('/patients', { headers: getAuthHeader() });
    return response.data;
};

export const getAllDoctors = async () => {
    const response = await api.get('/doctors', { headers: getAuthHeader() });
    return response.data;
};

export const updateDoctor = async (id: number, data: { clinicId?: number }) => {
    const response = await api.put(`/doctors/${id}`, data, { headers: getAuthHeader() });
    return response.data;
};

export const getMe = async () => {
    const response = await api.get('/users/me', { headers: getAuthHeader() });
    return response.data;
};

export const updateMe = async (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    address?: string;
    phoneNumber?: string;
    birthDate?: string;
}) => {
    const response = await api.put('/users/me', data, { headers: getAuthHeader() });
    return response.data;
};

export const getAllExaminations = async () => {
    const response = await api.get('/examinations', { headers: getAuthHeader() });
    return response.data;
};

export const getExaminationById = async (id: number) => {
    const response = await api.get(`/examinations/${id}`, { headers: getAuthHeader() });
    return response.data;
};

export const getExaminationsByDoctor = async (doctorId: number) => {
    const response = await api.get(`/examinations/doctor/${doctorId}`, { headers: getAuthHeader() });
    return response.data;
};

export const getExaminationsByPatient = async (patientId: number) => {
    const response = await api.get(`/examinations/patient/${patientId}`, { headers: getAuthHeader() });
    return response.data;
};

export const createExamination = async (data: {
    appointmentId: number;
    doctorId?: number;
    diagnosis: string;
    treatment: string;
    notes?: string;
}) => {
    const response = await api.post('/examinations', data, { headers: getAuthHeader() });
    return response.data;
};

export const updateExamination = async (id: number, data: {
    diagnosis?: string;
    treatment?: string;
    notes?: string;
}) => {
    const response = await api.put(`/examinations/${id}`, data, { headers: getAuthHeader() });
    return response.data;
};

export const deleteExamination = async (id: number) => {
    const response = await api.delete(`/examinations/${id}`, { headers: getAuthHeader() });
    return response.data;
};

export const getAllAppointments = async () => {
    const response = await api.get('/appointments', { headers: getAuthHeader() });
    return response.data;
};

export const getAppointmentById = async (id: number) => {
    const response = await api.get(`/appointments/${id}`, { headers: getAuthHeader() });
    return response.data;
};

export const getMyAppointmentsAsDoctor = async (doctorId: number) => {
    const response = await api.get(`/appointments/doctor/${doctorId}`, { headers: getAuthHeader() });
    return response.data;
};

export const getMyAppointmentsAsPatient = async (patientId: number) => {
    const response = await api.get(`/appointments/patient/${patientId}`, { headers: getAuthHeader() });
    return response.data;
};

export const createAppointment = async (data: {
    patientId: number;
    doctorId: number;
    date: string;
    notes?: string;
}) => {
    const response = await api.post('/appointments', data, { headers: getAuthHeader() });
    return response.data;
};


export const getPatientsByDoctor = async (doctorId: number) => {
    const response = await api.get(`/patients/doctor/${doctorId}`, { headers: getAuthHeader() });
    return response.data;
};

export const updateAppointment = async (id: number, data: { status?: string }) => {
    const response = await api.put(`/appointments/${id}`, data, { headers: getAuthHeader() });
    return response.data;
};

export const getAllClinics = async () => {
    const response = await api.get('/clinics');
    return response.data;
};

export const getClinicById = async (id: number) => {
    const response = await api.get(`/clinics/${id}`);
    return response.data;
};

export const createClinic = async (data: { name: string; address: string }) => {
    const response = await api.post('/clinics', data, { headers: getAuthHeader() });
    return response.data;
};

export const updateClinic = async (id: number, data: { name?: string; address?: string }) => {
    const response = await api.put(`/clinics/${id}`, data, { headers: getAuthHeader() });
    return response.data;
};

export const deleteClinic = async (id: number) => {
    const response = await api.delete(`/clinics/${id}`, { headers: getAuthHeader() });
    return response.data;
};



export const getAiSuggestions = async (symptoms: string) => {
    const response = await api.post('/ai/diagnosis', { symptoms }, { headers: getAuthHeader() });
    return response.data;
};

export default api;
