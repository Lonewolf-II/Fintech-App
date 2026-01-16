import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from '../api/apiClient';

interface DashboardStats {
    tenants: {
        total: number;
        active: number;
        trial: number;
        suspended: number;
        expired: number;
    };
    subscriptions: {
        active: number;
        expiring: number;
    };
    payments: {
        pending: number;
    };
    revenue: {
        total: number;
        monthly: number;
    };
    growth: Array<{
        month: string;
        count: number;
    }>;
}

interface Activity {
    id: number;
    superadminId: number;
    tenantId: number;
    action: string;
    details: any;
    ipAddress: string;
    createdAt: string;
    tenant?: {
        id: number;
        companyName: string;
        subdomain: string;
    };
}

interface SystemHealth {
    status: 'healthy' | 'unhealthy';
    database: string;
    uptime: number;
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    timestamp: string;
}

interface DashboardState {
    stats: DashboardStats | null;
    recentActivity: Activity[];
    systemHealth: SystemHealth | null;
    loading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    stats: null,
    recentActivity: [],
    systemHealth: null,
    loading: false,
    error: null
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async () => {
        const data = await dashboardApi.getStats();
        return data;
    }
);

export const fetchRecentActivity = createAsyncThunk(
    'dashboard/fetchRecentActivity',
    async (limit: number = 20) => {
        const data = await dashboardApi.getRecentActivity(limit);
        return data;
    }
);

export const fetchSystemHealth = createAsyncThunk(
    'dashboard/fetchSystemHealth',
    async () => {
        const data = await dashboardApi.getSystemHealth();
        return data;
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch dashboard stats
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch dashboard stats';
            })
            // Fetch recent activity
            .addCase(fetchRecentActivity.fulfilled, (state, action) => {
                state.recentActivity = action.payload;
            })
            // Fetch system health
            .addCase(fetchSystemHealth.fulfilled, (state, action) => {
                state.systemHealth = action.payload;
            });
    }
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
