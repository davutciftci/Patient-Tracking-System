import axios from 'axios';

const API_BASE_URL = 'http://localhost:3005';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth endpoints
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

export default api;
