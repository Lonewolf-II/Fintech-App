import apiClient from './apiClient';

export interface ModificationRequest {
    id: string;
    targetModel: string;
    targetId: string;
    changeType: string;
    requestedChanges: any;
    status: 'pending' | 'approved' | 'rejected';
    requestedBy: string;
    reviewedBy?: string;
    reviewNotes?: string;
    createdAt: string;
    updatedAt: string;
    requester?: {
        name: string;
        email: string;
    };
}

export const checkerApi = {
    getPendingRequests: async (): Promise<ModificationRequest[]> => {
        const response = await apiClient.get('/checker/requests');
        return response.data;
    },

    actionRequest: async (id: string, action: 'approve' | 'reject', notes?: string) => {
        const response = await apiClient.post(`/checker/requests/${id}/action`, { action, notes });
        return response.data;
    }
};
