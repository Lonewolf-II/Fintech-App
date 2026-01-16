import apiClient from './apiClient';
import type { ProfitDistribution } from '../types/business.types';

export const profitApi = {
    // Calculate and distribute profit
    calculate: async (data: {
        investmentId: number;
        saleQuantity: number;
        salePrice: number;
        saleDate: string;
    }): Promise<ProfitDistribution> => {
        const response = await apiClient.post('/profit-distribution/calculate', data);
        return response.data;
    },

    // Get all distributions
    getAll: async (filters?: {
        customerId?: number;
        investorId?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<ProfitDistribution[]> => {
        const response = await apiClient.get('/profit-distribution', { params: filters });
        return response.data;
    },

    // Get statistics
    getStats: async (): Promise<any> => {
        const response = await apiClient.get('/profit-distribution/stats');
        return response.data;
    },
};
