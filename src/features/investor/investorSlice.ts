import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { investorApi } from '../../api/investorApi';
import type { Investor, InvestorAccountAssignment } from '../../types/business.types';

interface InvestorState {
    investors: Investor[];
    selectedInvestor: Investor | null;
    assignments: InvestorAccountAssignment[];
    portfolio: any | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: InvestorState = {
    investors: [],
    selectedInvestor: null,
    assignments: [],
    portfolio: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchInvestors = createAsyncThunk(
    'investors/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await investorApi.getAll();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch investors');
        }
    }
);

export const fetchInvestorById = createAsyncThunk(
    'investors/fetchOne',
    async (id: number, { rejectWithValue }) => {
        try {
            return await investorApi.getById(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch investor details');
        }
    }
);

export const createInvestor = createAsyncThunk(
    'investors/create',
    async (data: { name: string; email: string; phone: string; totalCapital: number }, { rejectWithValue }) => {
        try {
            return await investorApi.create(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create investor');
        }
    }
);

export const addCapital = createAsyncThunk(
    'investors/addCapital',
    async ({ id, amount }: { id: number; amount: number }, { rejectWithValue }) => {
        try {
            return await investorApi.addCapital(id, amount);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to add capital');
        }
    }
);

export const assignAccount = createAsyncThunk(
    'investors/assignAccount',
    async ({ investorId, data }: { investorId: number; data: { customerId: number; accountId: number } }, { rejectWithValue }) => {
        try {
            return await investorApi.assignAccount(investorId, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to assign account');
        }
    }
);

export const fetchInvestorAssignments = createAsyncThunk(
    'investors/fetchAssignments',
    async (investorId: number, { rejectWithValue }) => {
        try {
            return await investorApi.getAssignedAccounts(investorId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch assignments');
        }
    }
);

export const fetchInvestorPortfolio = createAsyncThunk(
    'investors/fetchPortfolio',
    async (investorId: number, { rejectWithValue }) => {
        try {
            return await investorApi.getPortfolio(investorId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch portfolio');
        }
    }
);

const investorSlice = createSlice({
    name: 'investors',
    initialState,
    reducers: {
        setSelectedInvestor: (state, action: PayloadAction<Investor | null>) => {
            state.selectedInvestor = action.payload;
            state.assignments = []; // Clear assignments when switching
            state.portfolio = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchInvestors.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchInvestors.fulfilled, (state, action) => {
                state.isLoading = false;
                state.investors = action.payload;
            })
            .addCase(fetchInvestors.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch One
            .addCase(fetchInvestorById.fulfilled, (state, action) => {
                state.selectedInvestor = action.payload;
            })
            // Create
            .addCase(createInvestor.fulfilled, (state, action) => {
                state.investors.unshift(action.payload);
            })
            // Add Capital
            .addCase(addCapital.fulfilled, (state, action) => {
                const index = state.investors.findIndex(i => i.id === action.payload.id);
                if (index !== -1) {
                    state.investors[index] = action.payload;
                }
                if (state.selectedInvestor?.id === action.payload.id) {
                    state.selectedInvestor = action.payload;
                }
            })
            // Assign Account
            .addCase(assignAccount.fulfilled, (state, action) => {
                state.assignments.unshift(action.payload);
            })
            // Fetch Assignments
            .addCase(fetchInvestorAssignments.fulfilled, (state, action) => {
                state.assignments = action.payload;
            })
            // Fetch Portfolio
            .addCase(fetchInvestorPortfolio.fulfilled, (state, action) => {
                state.portfolio = action.payload;
            });
    },
});

export const { setSelectedInvestor, clearError } = investorSlice.actions;
export default investorSlice.reducer;
