import apiClient from './apiClient';

export interface HoldingSummary {
    scripName: string;
    companyName: string;
    totalQuantity: number;
    lastClosingPrice: number;
    lastTransactionPrice: number;
    valueAtClosing: number;
    valueAtLTP: number;
    totalInvestment: number;
    customerHoldings: any[];
}

export interface GrandTotal {
    totalValueAtClosing: number;
    totalValueAtLTP: number;
    totalInvestment: number;
}

export interface HoldingsResponse {
    summary: HoldingSummary[];
    grandTotal: GrandTotal;
    holdings: any[];
}

export const investmentApi = {
    // Get all holdings summary (grouped by scrip)
    getAllHoldings: async (): Promise<HoldingsResponse> => {
        const response = await apiClient.get('/api/holdings/summary');
        return response.data;
    },

    // Update stock prices for a scrip
    updateScripPrices: async (scripName: string, prices: {
        lastClosingPrice?: number;
        lastTransactionPrice?: number;
    }): Promise<{ message: string; updatedCount: number }> => {
        const response = await apiClient.put('/api/scrip-prices', {
            scripName,
            ...prices
        });
        return response.data;
    }
};
