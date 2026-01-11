import apiClient from './apiClient';
import type { User } from '../types/auth.types';

export const userApi = {
    getAll: async (): Promise<User[]> => {
        const response = await apiClient.get('/users');
        return response.data;
    },

    getById: async (id: string): Promise<User> => {
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    },

    create: async (userData: Omit<User, 'id' | 'userId' | 'createdAt'>): Promise<User> => {
        const response = await apiClient.post('/users', userData);
        return response.data;
    },

    update: async (id: string, userData: Partial<User>): Promise<User> => {
        const response = await apiClient.put(`/users/${id}`, userData);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },

    resetPassword: async (id: string, password: string): Promise<void> => {
        await apiClient.post(`/users/${id}/reset-password`, { password });
    },
};
