// src/api/userAPI.ts
import apiClient from '../api/api';

export interface Credentials {
    email: string;
    password: string;
}

export interface UserData extends Credentials {
    name: string;
    phone: string;
}

export const userAPI = {
    login: (credentials: Credentials) => apiClient.post('/auth/login', credentials),
    signup: (userData: UserData) => apiClient.post('/auth/signup', userData),
    logout: () => apiClient.post('/auth/logout'),
};
