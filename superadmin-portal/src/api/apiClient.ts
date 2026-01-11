import axios from 'axios';

const API_URL = import.meta.env.VITE_SUPERADMIN_API_URL || 'http://localhost:4000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('superadmin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('superadmin_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;

// API methods
export const authApi = {
    login: async (email: string, password: string) => {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    },
    getMe: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    }
};

export const tenantsApi = {
    getAll: async (params?: { status?: string; search?: string }) => {
        const response = await apiClient.get('/tenants', { params });
        return response.data;
    },
    getById: async (id: number) => {
        const response = await apiClient.get(`/tenants/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await apiClient.post('/tenants', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await apiClient.patch(`/tenants/${id}`, data);
        return response.data;
    },
    suspend: async (id: number, reason?: string) => {
        const response = await apiClient.post(`/tenants/${id}/suspend`, { reason });
        return response.data;
    },
    activate: async (id: number) => {
        const response = await apiClient.post(`/tenants/${id}/activate`);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await apiClient.delete(`/tenants/${id}`);
        return response.data;
    }
};

export const subscriptionsApi = {
    getAll: async () => {
        const response = await apiClient.get('/subscriptions');
        return response.data;
    },
    create: async (data: any) => {
        const response = await apiClient.post('/subscriptions', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await apiClient.patch(`/subscriptions/${id}`, data);
        return response.data;
    }
};

export const licensesApi = {
    getAll: async () => {
        const response = await apiClient.get('/licenses');
        return response.data;
    },
    generate: async (data: any) => {
        const response = await apiClient.post('/licenses', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await apiClient.patch(`/licenses/${id}`, data);
        return response.data;
    }
};

export const paymentsApi = {
    getPending: async () => {
        const response = await apiClient.get('/payments/pending');
        return response.data;
    },
    approve: async (id: number, notes?: string) => {
        const response = await apiClient.post(`/payments/${id}/approve`, { notes });
        return response.data;
    },
    reject: async (id: number, reason: string) => {
        const response = await apiClient.post(`/payments/${id}/reject`, { reason });
        return response.data;
    }
};

export const auditApi = {
    getLogs: async (params?: { tenantId?: number; superadminId?: number; action?: string; limit?: number }) => {
        const response = await apiClient.get('/audit', { params });
        return response.data;
    }
};
