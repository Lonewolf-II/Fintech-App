import apiClient from './apiClient';

export interface BankConfiguration {
    id: number;
    bankName: string;
    chargesCasba: boolean;
    casbaAmount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const bankConfigApi = {
    // Get all bank configurations
    getAllBanks: async (): Promise<BankConfiguration[]> => {
        const response = await apiClient.get('/admin/banks');
        return response.data;
    },

    // Create new bank configuration
    createBank: async (data: Partial<BankConfiguration>): Promise<BankConfiguration> => {
        const response = await apiClient.post('/admin/banks', data);
        return response.data;
    },

    // Update bank configuration
    updateBank: async (id: number, data: Partial<BankConfiguration>): Promise<BankConfiguration> => {
        const response = await apiClient.put(`/admin/banks/${id}`, data);
        return response.data;
    },

    // Delete bank configuration
    deleteBank: async (id: number): Promise<void> => {
        await apiClient.delete(`/admin/banks/${id}`);
    }
};
