import apiClient from './apiClient';

export interface ActivityLog {
    id: string;
    userId: string;
    action: string;
    entityType?: string;
    entityId?: string;
    details?: any;
    ipAddress?: string;
    createdAt: string;
    user?: {
        name: string;
        email: string;
        role: string;
    };
}

export interface PaginatedLogs {
    logs: ActivityLog[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export const adminApi = {
    getActivityLogs: async (page = 1, limit = 20, userId?: string, action?: string) => {
        const params = { page, limit, userId, action };
        const response = await apiClient.get<PaginatedLogs>('/admin/logs', { params });
        return response.data;
    },

    deleteIPOApplication: async (id: string) => {
        const response = await apiClient.delete(`/admin/ipo-applications/${id}`);
        return response.data;
    }
};
