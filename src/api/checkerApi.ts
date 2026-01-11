import apiClient from './apiClient';

export interface ModificationRequest {
    id: string;
    targetModel: string;
    targetId: string;
    changeType: 'update' | 'create' | 'delete';
    requestedChanges: any;
    currentData?: any;
    status: 'pending' | 'approved' | 'rejected';
    requestedBy: string;
    reviewedBy?: string;
    reviewNotes?: string;
    createdAt?: string;
    updatedAt?: string;
    created_at?: string;
    updated_at?: string;
    requester?: {
        name: string;
        email: string;
    };
}

export interface KYCPending {
    id: number;
    fullName: string;
    email: string;
    kycStatus: string;
    createdAt: string;
    created_at?: string;
    creator?: {
        name: string;
        email: string;
    };
}

export interface IPOPending {
    id: number;
    companyName: string;
    quantity: number;
    totalAmount: string;
    status: string;
    createdAt: string;
    customer?: {
        fullName: string;
        customerId: string;
    };
}

export interface CheckerData {
    modifications: ModificationRequest[];
    kyc: KYCPending[];
    ipo: IPOPending[];
}

export interface ActionRequestPayload {
    id: string;
    action: 'approve' | 'reject';
    notes?: string;
    type?: 'modification' | 'kyc' | 'ipo';
}

export const checkerApi = {
    getPendingRequests: async (): Promise<CheckerData> => {
        const response = await apiClient.get<CheckerData>('/checker/requests');
        return response.data;
    },

    actionRequest: async (data: ActionRequestPayload) => {
        const response = await apiClient.post(`/checker/requests/${data.id}/action`, {
            action: data.action,
            notes: data.notes,
            type: data.type
        });
        return response;
    },

    bulkActionRequest: async (data: { ids: string[]; action: 'approve' | 'reject'; type: string }) => {
        const response = await apiClient.post('/checker/bulk-action', data);
        return response.data;
    }
};
