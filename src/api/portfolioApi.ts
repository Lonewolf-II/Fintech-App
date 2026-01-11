import apiClient from './apiClient';
import type { Portfolio, Holding } from '../types/business.types';

export const portfolioApi = {
    // Portfolios
    getAllPortfolios: async (): Promise<Portfolio[]> => {
        const response = await apiClient.get('/portfolio/portfolios');
        return response.data;
    },

    createPortfolio: async (portfolioData: { customerId: string }): Promise<Portfolio> => {
        const response = await apiClient.post('/portfolio/portfolios', portfolioData);
        return response.data;
    },

    // Holdings
    getPortfolioHoldings: async (portfolioId: string): Promise<Holding[]> => {
        const response = await apiClient.get(`/portfolio/portfolios/${portfolioId}/holdings`);
        return response.data;
    },

    addHolding: async (holdingData: {
        portfolioId: string;
        stockSymbol: string;
        companyName: string;
        quantity: number;
        purchasePrice: number;
    }): Promise<Holding> => {
        const response = await apiClient.post('/portfolio/holdings', holdingData);
        return response.data;
    },

    updateHoldingPrice: async (id: string, currentPrice: number): Promise<Holding> => {
        const response = await apiClient.put(`/portfolio/holdings/${id}/price`, { currentPrice });
        return response.data;
    },
};
