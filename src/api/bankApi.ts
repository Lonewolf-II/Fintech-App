import axios from './apiClient';

export interface BankConfig {
    id: number;
    bankName: string;
    chargesCasba: boolean;
    casbaAmount: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export const bankApi = {
    getAll: async () => {
        const response = await axios.get('/api/admin/banks');
        return response.data;
    },

    create: async (data: Partial<BankConfig>) => {
        const response = await axios.post('/api/admin/banks', data);
        return response.data;
    },

    update: async (id: number, data: Partial<BankConfig>) => {
        const response = await axios.put(`/api/admin/banks/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await axios.delete(`/api/admin/banks/${id}`);
        return response.data;
    }
};
