import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tenantsApi } from '../api/apiClient';

interface Tenant {
    id: number;
    tenantKey: string;
    companyName: string;
    subdomain: string;
    databaseHost: string;
    databasePort: number;
    databaseName: string;
    status: 'active' | 'suspended' | 'trial' | 'expired' | 'inactive';
    createdAt: string;
    suspendedAt?: string;
    notes?: string;
    subscriptions?: any[];
    licenses?: any[];
}

interface TenantStats {
    databaseSize: string;
    databaseSizeBytes: number;
    tableCount: number;
    totalRows: number;
    activeConnections: number;
    topTables: any[];
    lastChecked: string;
}

interface TenantHealth {
    status: 'healthy' | 'unhealthy';
    responseTime: number | null;
    message: string;
    timestamp: string;
}

interface TenantsState {
    tenants: Tenant[];
    selectedTenant: Tenant | null;
    tenantStats: TenantStats | null;
    tenantHealth: TenantHealth | null;
    tenantUsers: any[]; // Add this
    loading: boolean;
    error: string | null;
    searchTerm: string;
    statusFilter: string;
}

const initialState: TenantsState = {
    tenants: [],
    selectedTenant: null,
    tenantStats: null,
    tenantHealth: null,
    tenantUsers: [], // Add this initialization
    loading: false,
    error: null,
    searchTerm: '',
    statusFilter: ''
};

// Async thunks
export const fetchTenants = createAsyncThunk(
    'tenants/fetchAll',
    async (params: { status?: string; search?: string } = {}) => {
        const data = await tenantsApi.getAll(params);
        return data;
    }
);

export const fetchTenantById = createAsyncThunk(
    'tenants/fetchById',
    async (id: number) => {
        const data = await tenantsApi.getById(id);
        return data;
    }
);

export const createTenant = createAsyncThunk(
    'tenants/create',
    async (tenantData: {
        companyName: string;
        subdomain: string;
        autoProvision?: boolean;
        databaseHost?: string;
        databaseName?: string;
        databaseUser?: string;
        databasePassword?: string;
    }) => {
        const data = await tenantsApi.create(tenantData);
        return data;
    }
);

export const updateTenant = createAsyncThunk(
    'tenants/update',
    async ({ id, updates }: { id: number; updates: Partial<Tenant> }) => {
        const data = await tenantsApi.update(id, updates);
        return data;
    }
);

export const suspendTenant = createAsyncThunk(
    'tenants/suspend',
    async ({ id, reason }: { id: number; reason: string }) => {
        const data = await tenantsApi.suspend(id, reason);
        return data;
    }
);

export const activateTenant = createAsyncThunk(
    'tenants/activate',
    async (id: number) => {
        const data = await tenantsApi.activate(id);
        return data;
    }
);

export const deleteTenant = createAsyncThunk(
    'tenants/delete',
    async (id: number) => {
        await tenantsApi.delete(id);
        return id;
    }
);

export const fetchTenantStats = createAsyncThunk(
    'tenants/fetchStats',
    async (id: number) => {
        const data = await tenantsApi.getStats(id);
        return data;
    }
);

export const fetchTenantHealth = createAsyncThunk(
    'tenants/fetchHealth',
    async (id: number) => {
        const data = await tenantsApi.getHealth(id);
        return data;
    }
);

export const fetchTenantUsers = createAsyncThunk(
    'tenants/fetchUsers',
    async (id: number) => {
        const data = await tenantsApi.getUsers(id);
        return data;
    }
);

export const addTenantUser = createAsyncThunk(
    'tenants/addUser',
    async ({ id, userData }: { id: number; userData: any }) => {
        const data = await tenantsApi.addUser(id, userData);
        return data;
    }
);

export const removeTenantUser = createAsyncThunk(
    'tenants/removeUser',
    async ({ id, userId }: { id: number; userId: number }) => {
        await tenantsApi.removeUser(id, userId);
        return userId;
    }
);

const tenantsSlice = createSlice({
    name: 'tenants',
    initialState: {
        ...initialState,
        tenantUsers: [] as any[], // Add to initial state
    },
    reducers: {
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload;
        },
        setStatusFilter: (state, action: PayloadAction<string>) => {
            state.statusFilter = action.payload;
        },
        clearSelectedTenant: (state) => {
            state.selectedTenant = null;
            state.tenantStats = null;
            state.tenantHealth = null;
            state.tenantUsers = []; // Clear users
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all tenants
            .addCase(fetchTenants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenants.fulfilled, (state, action) => {
                state.loading = false;
                state.tenants = action.payload;
            })
            .addCase(fetchTenants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch tenants';
            })
            // Fetch tenant by ID
            .addCase(fetchTenantById.fulfilled, (state, action) => {
                state.selectedTenant = action.payload;
            })
            // Create tenant
            .addCase(createTenant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTenant.fulfilled, (state, action) => {
                state.loading = false;
                state.tenants.unshift(action.payload);
            })
            .addCase(createTenant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create tenant';
            })
            // Update tenant
            .addCase(updateTenant.fulfilled, (state, action) => {
                const index = state.tenants.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.tenants[index] = action.payload;
                }
                if (state.selectedTenant?.id === action.payload.id) {
                    state.selectedTenant = action.payload;
                }
            })
            // Suspend tenant
            .addCase(suspendTenant.fulfilled, (state, action) => {
                const index = state.tenants.findIndex(t => t.id === action.payload.tenant.id);
                if (index !== -1) {
                    state.tenants[index] = action.payload.tenant;
                }
            })
            // Activate tenant
            .addCase(activateTenant.fulfilled, (state, action) => {
                const index = state.tenants.findIndex(t => t.id === action.payload.tenant.id);
                if (index !== -1) {
                    state.tenants[index] = action.payload.tenant;
                }
            })
            // Delete tenant
            .addCase(deleteTenant.fulfilled, (state, action) => {
                state.tenants = state.tenants.filter(t => t.id !== action.payload);
            })
            // Fetch tenant stats
            .addCase(fetchTenantStats.fulfilled, (state, action) => {
                state.tenantStats = action.payload;
            })
            // Fetch tenant health
            .addCase(fetchTenantHealth.fulfilled, (state, action) => {
                state.tenantHealth = action.payload;
            })
            // Tenant Users
            .addCase(fetchTenantUsers.fulfilled, (state, action) => {
                // @ts-ignore
                state.tenantUsers = action.payload;
            })
            .addCase(addTenantUser.fulfilled, (state, action) => {
                // @ts-ignore
                state.tenantUsers.unshift(action.payload.user);
            })
            .addCase(removeTenantUser.fulfilled, (state, action) => {
                // @ts-ignore
                state.tenantUsers = state.tenantUsers.filter(u => u.id !== action.payload);
            });
    }
});

export const { setSearchTerm, setStatusFilter, clearSelectedTenant, clearError } = tenantsSlice.actions;
export default tenantsSlice.reducer;
