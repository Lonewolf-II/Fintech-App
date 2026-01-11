import apiClient from './apiClient';
import type { Customer } from '../types/business.types';

export const customerApi = {
    getAll: async (): Promise<Customer[]> => {
        const response = await apiClient.get('/customers');
        return response.data;
    },

    getById: async (id: string): Promise<Customer> => {
        const response = await apiClient.get(`/customers/${id}`);
        return response.data;
    },

    create: async (customerData: Omit<Customer, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
        const response = await apiClient.post('/customers', customerData);
        return response.data;
    },

    update: async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
        const response = await apiClient.put(`/customers/${id}`, customerData);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/customers/${id}`);
    },

    bulkUpload: async (file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post('/customers/bulk-upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
