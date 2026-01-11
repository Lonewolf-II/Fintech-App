import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkerApi } from '../../api/checkerApi';
import type { ModificationRequest } from '../../api/checkerApi';

interface CheckerState {
    pendingRequests: ModificationRequest[];
    isLoading: boolean;
    error: string | null;
}

const initialState: CheckerState = {
    pendingRequests: [],
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchPendingRequests = createAsyncThunk(
    'checker/fetchPendingRequests',
    async (_, { rejectWithValue }) => {
        try {
            return await checkerApi.getPendingRequests();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch requests');
        }
    }
);

export const actionRequest = createAsyncThunk(
    'checker/actionRequest',
    async ({ id, action, notes }: { id: string; action: 'approve' | 'reject'; notes?: string }, { rejectWithValue }) => {
        try {
            return await checkerApi.actionRequest(id, action, notes);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to process request');
        }
    }
);

const checkerSlice = createSlice({
    name: 'checker',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPendingRequests.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPendingRequests.fulfilled, (state, action) => {
                state.isLoading = false;
                state.pendingRequests = action.payload;
            })
            .addCase(fetchPendingRequests.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(actionRequest.fulfilled, (state, action) => {
                // Remove processed request from list
                // The API returns the updated request (with status approved/rejected)
                const processedId = (action.payload as ModificationRequest).id;
                state.pendingRequests = state.pendingRequests.filter(req => req.id !== processedId);
            });
    },
});

export const { clearError } = checkerSlice.actions;
export default checkerSlice.reducer;
