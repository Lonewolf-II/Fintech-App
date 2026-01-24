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
    scripName?: string;
    pricePerShare: number;
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

    verify: async (id: number, status: 'verified' | 'rejected'): Promise<IPOApplication> => {
        const response = await apiClient.put(`/ipo/applications/${id}/verify`, { status });
        return response.data;
    },

    // Allotment
    allotApplication: async (id: string, status: 'allotted' | 'not_allotted', allocatedQuantity?: number): Promise<void> => {
        const payload = { status, allocatedQuantity };
        await apiClient.post(`/ipo/applications/${id}/allot`, payload);
    },

    deleteApplication: async (id: string) => {
        const response = await apiClient.delete(`/ipo/applications/${id}`);
        return response.data;
    },

    getApplications: async (filters?: { customerId?: string; status?: string; ipoListingId?: string }): Promise<IPOApplication[]> => {
        const response = await apiClient.get('/ipo/applications', { params: filters });
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

    closeListing: async (id: number): Promise<IPOListing> => {
        const response = await apiClient.post(`/ipo/listings/${id}/close`);
        return response.data;
    },

    updateListing: async (id: number, data: Partial<IPOListing>): Promise<IPOListing> => {
        const response = await apiClient.put(`/ipo/listings/${id}`, data);
        return response.data;
    },

    deleteListing: async (id: number): Promise<void> => {
        await apiClient.delete(`/ipo/listings/${id}`);
    },

    bulkApply: async (ipoListingId: number, applications: { customerId: number; quantity: number }[]): Promise<any> => {
        const response = await apiClient.post('/ipo/bulk-apply', { ipoListingId, applications });
        return response.data;
    },

    // function removed

    // Statistics
    getStats: async (): Promise<any> => {
        const response = await apiClient.get('/ipo/stats');
        return response.data;
    },
};
