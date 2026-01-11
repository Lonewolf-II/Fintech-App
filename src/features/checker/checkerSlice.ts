import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkerApi } from '../../api/checkerApi';
import type { CheckerData } from '../../api/checkerApi';

interface CheckerState {
    pendingData: CheckerData | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: CheckerState = {
    pendingData: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchPendingRequests = createAsyncThunk(
    'checker/fetchPendingRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await checkerApi.getPendingRequests();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending requests');
        }
    }
);

export const actionRequest = createAsyncThunk(
    'checker/actionRequest',
    async (payload: { id: string; action: 'approve' | 'reject'; notes?: string; type?: 'modification' | 'kyc' | 'ipo' }, { rejectWithValue }) => {
        try {
            const response = await checkerApi.actionRequest(payload);
            return { id: payload.id, type: payload.type || 'modification', data: response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to process request');
        }
    }
);

export const bulkActionRequest = createAsyncThunk(
    'checker/bulkActionRequest',
    async (payload: { ids: string[]; action: 'approve' | 'reject'; type: string }, { rejectWithValue }) => {
        try {
            await checkerApi.bulkActionRequest(payload);
            return payload;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to process bulk request');
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
                state.pendingData = action.payload;
            })
            .addCase(fetchPendingRequests.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(actionRequest.fulfilled, (state, action) => {
                if (state.pendingData) {
                    const { id, type } = action.payload;
                    if (type === 'modification') {
                        state.pendingData.modifications = state.pendingData.modifications.filter(req => req.id !== id);
                    } else if (type === 'kyc') {
                        // ID from payload is string, but KYC ID is number
                        state.pendingData.kyc = state.pendingData.kyc.filter(req => String(req.id) !== id);
                    } else if (type === 'ipo') {
                        // ID from payload is string, but IPO ID is number
                        state.pendingData.ipo = state.pendingData.ipo.filter(req => String(req.id) !== id);
                    }
                }
            })
            .addCase(bulkActionRequest.fulfilled, (state, action) => {
                if (state.pendingData) {
                    const { ids, type } = action.payload;
                    if (type === 'ipo') {
                        state.pendingData.ipo = state.pendingData.ipo.filter(req => !ids.includes(String(req.id)));
                    }
                }
            });
    },
});

export const { clearError } = checkerSlice.actions;
export default checkerSlice.reducer;
