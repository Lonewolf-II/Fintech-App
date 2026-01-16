import apiClient from './apiClient';
import type { Fee } from '../types/business.types';

export const feeApi = {
    // Get all fees
    getAll: async (filters?: {
        customerId?: number;
        status?: string;
        feeType?: string;
    }): Promise<Fee[]> => {
        const response = await apiClient.get('/fees', { params: filters });
        return response.data;
    },

    // Get fee by ID
    getById: async (id: number): Promise<Fee> => {
        const response = await apiClient.get(`/fees/${id}`);
        return response.data;
    },

    // Create fee
    create: async (data: {
        customerId: number;
        accountId?: number;
        feeType: string;
        amount: number;
        dueDate?: string;
    }): Promise<Fee> => {
        const response = await apiClient.post('/fees', data);
        return response.data;
    },

    // Update fee
    update: async (id: number, data: Partial<Fee>): Promise<Fee> => {
        const response = await apiClient.put(`/fees/${id}`, data);
        return response.data;
    },

    // Mark as paid
    markAsPaid: async (id: number): Promise<Fee> => {
        const response = await apiClient.post(`/fees/${id}/pay`);
        return response.data;
    },

    // Waive fee
    waive: async (id: number): Promise<Fee> => {
        const response = await apiClient.post(`/fees/${id}/waive`);
        return response.data;
    },

    // Bulk create annual fees
    bulkCreateAnnual: async (data: {
        amount: number;
        dueDate: string;
    }): Promise<any> => {
        const response = await apiClient.post('/fees/bulk-annual', data);
        return response.data;
    },

    // Get statistics
    getStats: async (): Promise<any> => {
        const response = await apiClient.get('/fees/stats');
        return response.data;
    },
};
