import apiClient from './apiClient';

export interface IPOApplication {
    id: number;
    customerId: number;
    companyName: string;
    quantity: number;
    pricePerShare: number;
    totalAmount: number;
    status: 'pending' | 'verified' | 'allotted' | 'rejected';
    createdAt: string;
    customer?: {
        fullName: string;
        customerId: string;
    };
}

export interface ApplyIPOPayload {
    customerId: number;
    accountId: number;
    companyName: string;
    quantity: number;
    pricePerShare: number;
}

export interface IPOListing {
    id: number;
    companyName: string;
    pricePerShare: string;
    totalShares: number;
    openDate: string;
    closeDate: string;
    status: 'upcoming' | 'open' | 'closed' | 'allotted';
    description?: string;
}

export const ipoApi = {
    apply: async (data: ApplyIPOPayload): Promise<IPOApplication> => {
        const response = await apiClient.post('/ipo/apply', data);
        return response.data;
    },

    updateApplication: async (id: string, data: Partial<IPOApplication>) => {
        const response = await apiClient.put(`/ipo/applications/${id}`, data);
        return response.data;
    },

    deleteApplication: async (id: string) => {
        const response = await apiClient.delete(`/ipo/applications/${id}`);
        return response.data;
    },

    verify: async (id: number, status: 'verified' | 'rejected'): Promise<IPOApplication> => {
        const response = await apiClient.put(`/ipo/${id}/verify`, { status });
        return response.data;
    },

    getApplications: async (customerId?: string): Promise<IPOApplication[]> => {
        const params = customerId ? { customerId } : {};
        const response = await apiClient.get('/ipo/applications', { params });
        return response.data;
    },

    // Listing Management
    createListing: async (data: Partial<IPOListing>): Promise<IPOListing> => {
        const response = await apiClient.post('/ipo/listings', data);
        return response.data;
    },

    getListings: async (): Promise<IPOListing[]> => {
        const response = await apiClient.get('/ipo/listings');
        return response.data;
    },

    getOpenListings: async (): Promise<IPOListing[]> => {
        const response = await apiClient.get('/ipo/listings/open');
        return response.data;
    },

    updateStatus: async (id: number, status: string): Promise<IPOListing> => {
        const response = await apiClient.patch(`/ipo/listings/${id}/status`, { status });
        return response.data;
    },

    bulkApply: async (ipoListingId: number, applications: { customerId: number; quantity: number }[]): Promise<any> => {
        const response = await apiClient.post('/ipo/bulk', { ipoListingId, applications });
        return response.data;
    },

    // Allotment
    allotApplication: async (id: number, data: {
        allotmentQuantity: number;
        allotmentStatus: 'allotted' | 'not_allotted';
    }): Promise<IPOApplication> => {
        const response = await apiClient.post(`/ipo/applications/${id}/allot`, data);
        return response.data;
    },

    // Statistics
    getStats: async (): Promise<any> => {
        const response = await apiClient.get('/ipo/stats');
        return response.data;
    },
};
