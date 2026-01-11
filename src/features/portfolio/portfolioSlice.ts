import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { portfolioApi } from '../../api/portfolioApi';
import type { Portfolio, Holding } from '../../types/business.types';

interface PortfolioState {
    portfolios: Portfolio[];
    holdings: Holding[];
    selectedPortfolio: Portfolio | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: PortfolioState = {
    portfolios: [],
    holdings: [],
    selectedPortfolio: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchPortfolios = createAsyncThunk(
    'portfolio/fetchPortfolios',
    async (_, { rejectWithValue }) => {
        try {
            return await portfolioApi.getAllPortfolios();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch portfolios');
        }
    }
);

export const createPortfolio = createAsyncThunk(
    'portfolio/createPortfolio',
    async (portfolioData: { customerId: string }, { rejectWithValue }) => {
        try {
            return await portfolioApi.createPortfolio(portfolioData);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create portfolio');
        }
    }
);

export const fetchHoldings = createAsyncThunk(
    'portfolio/fetchHoldings',
    async (portfolioId: string, { rejectWithValue }) => {
        try {
            return await portfolioApi.getPortfolioHoldings(portfolioId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch holdings');
        }
    }
);

export const addHolding = createAsyncThunk(
    'portfolio/addHolding',
    async (holdingData: any, { rejectWithValue }) => {
        try {
            return await portfolioApi.addHolding(holdingData);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to add holding');
        }
    }
);

export const updateHolding = createAsyncThunk(
    'portfolio/updateHolding',
    async ({ id, data }: { id: string; data: Partial<any> }, { rejectWithValue }) => {
        try {
            return await portfolioApi.updateHolding(id, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update holding');
        }
    }
);

export const deleteHolding = createAsyncThunk(
    'portfolio/deleteHolding',
    async (id: string, { rejectWithValue }) => {
        try {
            return await portfolioApi.deleteHolding(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete holding');
        }
    }
);

const portfolioSlice = createSlice({
    name: 'portfolio',
    initialState,
    reducers: {
        setSelectedPortfolio: (state, action: PayloadAction<Portfolio | null>) => {
            state.selectedPortfolio = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPortfolios.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPortfolios.fulfilled, (state, action) => {
                state.isLoading = false;
                state.portfolios = action.payload;
            })
            .addCase(fetchPortfolios.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createPortfolio.fulfilled, (state, action) => {
                state.portfolios.unshift(action.payload);
            })
            .addCase(fetchHoldings.fulfilled, (state, action) => {
                state.holdings = action.payload;
            })
            .addCase(addHolding.fulfilled, (state, action) => {
                state.holdings.unshift(action.payload);
            });
    },
});

export const { setSelectedPortfolio, clearError } = portfolioSlice.actions;
export default portfolioSlice.reducer;
