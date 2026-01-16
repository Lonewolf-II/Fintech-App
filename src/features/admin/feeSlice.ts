import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { feeApi } from '../../api/feeApi';
import type { Fee } from '../../types/business.types';

interface FeeState {
    fees: Fee[];
    stats: any | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: FeeState = {
    fees: [],
    stats: null,
    isLoading: false,
    error: null,
};

// Async Thunks
export const fetchFees = createAsyncThunk(
    'fees/fetchAll',
    async (filters: any, { rejectWithValue }) => {
        try {
            return await feeApi.getAll(filters);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch fees');
        }
    }
);

export const createFee = createAsyncThunk(
    'fees/create',
    async (data: any, { rejectWithValue }) => {
        try {
            return await feeApi.create(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create fee');
        }
    }
);

export const payFee = createAsyncThunk(
    'fees/pay',
    async (id: number, { rejectWithValue }) => {
        try {
            return await feeApi.markAsPaid(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to pay fee');
        }
    }
);

export const waiveFee = createAsyncThunk(
    'fees/waive',
    async (id: number, { rejectWithValue }) => {
        try {
            return await feeApi.waive(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to waive fee');
        }
    }
);

export const bulkCreateAnnualFees = createAsyncThunk(
    'fees/bulkCreate',
    async (data: { amount: number; dueDate: string }, { rejectWithValue }) => {
        try {
            return await feeApi.bulkCreateAnnual(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create bulk fees');
        }
    }
);

export const fetchFeeStats = createAsyncThunk(
    'fees/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            return await feeApi.getStats();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch fee stats');
        }
    }
);

const feeSlice = createSlice({
    name: 'fees',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Fees
            .addCase(fetchFees.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchFees.fulfilled, (state, action) => {
                state.isLoading = false;
                state.fees = action.payload;
            })
            .addCase(fetchFees.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create Fee
            .addCase(createFee.fulfilled, (state, action) => {
                state.fees.unshift(action.payload);
            })
            // Pay Fee
            .addCase(payFee.fulfilled, (state, action) => {
                const index = state.fees.findIndex(f => f.id === action.payload.id);
                if (index !== -1) {
                    state.fees[index] = action.payload;
                }
            })
            // Waive Fee
            .addCase(waiveFee.fulfilled, (state, action) => {
                const index = state.fees.findIndex(f => f.id === action.payload.id);
                if (index !== -1) {
                    state.fees[index] = action.payload;
                }
            })
            // Fetch Stats
            .addCase(fetchFeeStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            });
    },
});

export const { clearError } = feeSlice.actions;
export default feeSlice.reducer;
