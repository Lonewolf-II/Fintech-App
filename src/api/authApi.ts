import apiClient from './apiClient';
import type { User } from '../types/auth.types';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    register: async (userData: any): Promise<{ message: string; user: User }> => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },
};
