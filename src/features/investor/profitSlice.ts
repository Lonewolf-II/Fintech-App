import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profitApi } from '../../api/profitApi';
import type { ProfitDistribution } from '../../types/business.types';

interface ProfitState {
    distributions: ProfitDistribution[];
    stats: any | null;
    isLoading: boolean;
    error: string | null;
    calculationResult: ProfitDistribution | null;
}

const initialState: ProfitState = {
    distributions: [],
    stats: null,
    isLoading: false,
    error: null,
    calculationResult: null,
};

// Async thunks
export const calculateProfit = createAsyncThunk(
    'profit/calculate',
    async (data: { investmentId: number; saleQuantity: number; salePrice: number; saleDate: string }, { rejectWithValue }) => {
        try {
            return await profitApi.calculate(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to calculate profit');
        }
    }
);

export const fetchDistributions = createAsyncThunk(
    'profit/fetchAll',
    async (filters: any, { rejectWithValue }) => {
        try {
            return await profitApi.getAll(filters);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch distributions');
        }
    }
);

export const fetchProfitStats = createAsyncThunk(
    'profit/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            return await profitApi.getStats();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch profit statistics');
        }
    }
);

const profitSlice = createSlice({
    name: 'profit',
    initialState,
    reducers: {
        clearCalculation: (state) => {
            state.calculationResult = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Calculate Profit
            .addCase(calculateProfit.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(calculateProfit.fulfilled, (state, action) => {
                state.isLoading = false;
                state.calculationResult = action.payload; // Store result for review/confirmation
                state.distributions.unshift(action.payload); // Assuming it saves immediately or we add a confirm step
            })
            .addCase(calculateProfit.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Distributions
            .addCase(fetchDistributions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDistributions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.distributions = action.payload;
            })
            .addCase(fetchDistributions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Stats
            .addCase(fetchProfitStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            });
    },
});

export const { clearCalculation, clearError } = profitSlice.actions;
export default profitSlice.reducer;
