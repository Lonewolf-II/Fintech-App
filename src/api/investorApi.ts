import apiClient from './apiClient';

export interface Investor {
    id: number;
    investorId: string;
    name: string;
    email?: string;
    phone?: string;
    totalCapital: number;
    investedAmount: number;
    availableCapital: number;
    totalProfit: number;
    status: 'active' | 'inactive';
    createdBy?: number;
    createdAt: string;
    updatedAt: string;
}

export interface InvestorCategory {
    id: number;
    categoryName: string;
    investorId?: number;
    description?: string;
    status: 'active' | 'inactive';
    investor?: Investor;
    createdAt: string;
    updatedAt: string;
}

export interface Investment {
    id: number;
    investmentId: string;
    investorId: number;
    customerId: number;
    accountId: number;
    ipoApplicationId?: number;
    principalAmount: number;
    sharesAllocated: number;
    costPerShare: number;
    totalCost: number;
    sharesHeld: number;
    currentMarketPrice: number;
    currentValue: number;
    totalSoldAmount: number;
    investorProfit: number;
    customerProfit: number;
    adminFee: number;
    status: 'active' | 'partially_sold' | 'fully_realized';
    investedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProfitDistribution {
    id: number;
    distributionId: string;
    investmentId: number;
    sharesSold: number;
    salePricePerShare: number;
    totalSaleAmount: number;
    principalReturned: number;
    totalProfit: number;
    investorShare: number;
    customerShare: number;
    adminFee: number;
    distributedAt: string;
    createdBy?: number;
    createdAt: string;
}

export const investorApi = {
    // Investor endpoints
    getAllInvestors: () => apiClient.get<Investor[]>('/investors'),

    createInvestor: (data: { name: string; email?: string; phone?: string; totalCapital?: number }) =>
        apiClient.post<Investor>('/investors', data),

    getInvestorById: (id: number) => apiClient.get<Investor>(`/investors/${id}`),

    updateInvestor: (id: number, data: Partial<Investor>) =>
        apiClient.put<Investor>(`/investors/${id}`, data),

    addCapital: (id: number, amount: number) =>
        apiClient.post<Investor>(`/investors/${id}/add-capital`, { amount }),

    getInvestorPortfolio: (id: number) =>
        apiClient.get<{
            investor: { id: number; investorId: string; name: string };
            summary: {
                totalCapital: number;
                investedAmount: number;
                availableCapital: number;
                totalProfit: number;
                activeInvestments: number;
                totalInvestments: number;
                currentPortfolioValue: number;
            };
            investments: Investment[];
        }>(`/investors/${id}/portfolio`),

    // Category endpoints
    getAllCategories: () => apiClient.get<InvestorCategory[]>('/categories'),

    createCategory: (data: { categoryName: string; investorId?: number; description?: string }) =>
        apiClient.post<InvestorCategory>('/categories', data),

    updateCategory: (id: number, data: Partial<InvestorCategory>) =>
        apiClient.put<InvestorCategory>(`/categories/${id}`, data),

    assignAccountsToCategory: (categoryId: number, accountIds: number[]) =>
        apiClient.post(`/categories/${categoryId}/assign-accounts`, { accountIds }),

    getCategoryAccounts: (categoryId: number) =>
        apiClient.get<InvestorCategory>(`/categories/${categoryId}/accounts`),

    removeAccountFromCategory: (categoryId: number, accountId: number) =>
        apiClient.delete(`/categories/${categoryId}/accounts/${accountId}`),

    // Investment endpoints
    getAllInvestments: (status?: string) =>
        apiClient.get<Investment[]>('/investments', { params: { status } }),

    getInvestmentById: (id: number) => apiClient.get<Investment>(`/investments/${id}`),

    createInvestment: (data: {
        investorId: number;
        customerId: number;
        accountId: number;
        ipoApplicationId?: number;
        principalAmount: number;
        sharesAllocated: number;
        costPerShare: number;
    }) => apiClient.post<Investment>('/investments/create', data),

    updateMarketPrice: (id: number, currentMarketPrice: number) =>
        apiClient.put<Investment>(`/investments/${id}/update-price`, { currentMarketPrice }),

    sellShares: (id: number, data: {
        sharesSold: number;
        salePricePerShare: number;
        adminFeePerAccount?: number;
    }) => apiClient.post(`/investments/${id}/sell`, data),

    getInvestorInvestments: (investorId: number) =>
        apiClient.get<Investment[]>(`/investments/investor/${investorId}`)
};
