import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../api/adminApi';
import type { ActivityLog } from '../../api/adminApi';

interface AdminState {
    logs: ActivityLog[];
    total: number;
    totalPages: number;
    currentPage: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: AdminState = {
    logs: [],
    total: 0,
    totalPages: 0,
    currentPage: 1,
    isLoading: false,
    error: null,
};

export const fetchActivityLogs = createAsyncThunk(
    'admin/fetchActivityLogs',
    async (params: { page?: number; limit?: number; userId?: string; action?: string }, { rejectWithValue }) => {
        try {
            return await adminApi.getActivityLogs(params.page, params.limit, params.userId, params.action);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity logs');
        }
    }
);

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchActivityLogs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchActivityLogs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.logs = action.payload.logs;
                state.total = action.payload.total;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchActivityLogs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
