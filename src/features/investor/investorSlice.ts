import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { investorApi } from '../../api/investorApi';
import type { Investor, InvestorAccountAssignment, Investment } from '../../types/business.types';

interface InvestorState {
    investors: Investor[];
    selectedInvestor: Investor | null;
    assignments: InvestorAccountAssignment[];
    portfolio: any | null;
    categories: any[]; // Legacy support
    investments: Investment[]; // Legacy support
    isLoading: boolean;
    error: string | null;
}

const initialState: InvestorState = {
    investors: [],
    selectedInvestor: null,
    assignments: [],
    portfolio: null,
    categories: [],
    investments: [],
    isLoading: false,
    error: null,
};

// Async thunks - Investors
export const fetchInvestors = createAsyncThunk(
    'investors/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await investorApi.getAllInvestors();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch investors');
        }
    }
);

export const fetchInvestorById = createAsyncThunk(
    'investors/fetchOne',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await investorApi.getInvestorById(id);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch investor details');
        }
    }
);

export const createInvestor = createAsyncThunk(
    'investors/create',
    async (data: { name: string; email: string; phone: string; totalCapital: number }, { rejectWithValue }) => {
        try {
            const response = await investorApi.createInvestor(data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create investor');
        }
    }
);

export const addCapital = createAsyncThunk(
    'investors/addCapital',
    async ({ id, amount }: { id: number; amount: number }, { rejectWithValue }) => {
        try {
            const response = await investorApi.addCapital(id, amount);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to add capital');
        }
    }
);

export const assignAccount = createAsyncThunk(
    'investors/assignAccount',
    async ({ investorId, data }: { investorId: number; data: { customerId: number; accountId: number } }, { rejectWithValue }) => {
        try {
            // Note: This endpoint doesn't exist in the current API
            return { investorId, ...data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to assign account');
        }
    }
);

export const fetchInvestorAssignments = createAsyncThunk(
    'investors/fetchAssignments',
    async (_investorId: number, { rejectWithValue }) => {
        try {
            // Note: This endpoint doesn't exist in the current API
            return [];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch assignments');
        }
    }
);

export const fetchInvestorPortfolio = createAsyncThunk(
    'investors/fetchPortfolio',
    async (investorId: number, { rejectWithValue }) => {
        try {
            const response = await investorApi.getInvestorPortfolio(investorId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch portfolio');
        }
    }
);

// --- Category Thunks (Restored for Legacy Support) ---

export const fetchCategories = createAsyncThunk(
    'investors/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await investorApi.getAllCategories();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch categories');
        }
    }
);

export const createCategory = createAsyncThunk(
    'investors/createCategory',
    async (data: { categoryName: string; investorId?: number; description?: string }, { rejectWithValue }) => {
        try {
            const response = await investorApi.createCategory(data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create category');
        }
    }
);

export const assignAccounts = createAsyncThunk(
    'investors/assignAccounts',
    async ({ categoryId, accountIds }: { categoryId: number; accountIds: number[] }, { rejectWithValue }) => {
        try {
            await investorApi.assignAccountsToCategory(categoryId, accountIds);
            return { categoryId, accountIds };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to assign accounts');
        }
    }
);

// --- Investment Thunks (Restored for Legacy Support) ---

export const fetchInvestments = createAsyncThunk(
    'investors/fetchInvestments',
    async (status: string | undefined = undefined, { rejectWithValue }) => {
        try {
            const response = await investorApi.getAllInvestments(status);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch investments');
        }
    }
);

export const updateMarketPrice = createAsyncThunk(
    'investors/updateMarketPrice',
    async ({ id, price }: { id: number; price: number }, { rejectWithValue }) => {
        try {
            await investorApi.updateMarketPrice(id, price);
            return { id, currentMarketPrice: price };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update market price');
        }
    }
);

export const sellShares = createAsyncThunk(
    'investors/sellShares',
    async ({ id, data }: { id: number; data: { sharesSold: number; salePricePerShare: number; adminFeePerAccount?: number } }, { rejectWithValue }) => {
        try {
            await investorApi.sellShares(id, data);
            return { id, ...data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to sell shares');
        }
    }
);

const investorSlice = createSlice({
    name: 'investors',
    initialState,
    reducers: {
        setSelectedInvestor: (state, action: PayloadAction<Investor | null>) => {
            state.selectedInvestor = action.payload;
            state.assignments = [];
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
                state.investors = action.payload as any;
            })
            .addCase(fetchInvestors.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch One
            .addCase(fetchInvestorById.fulfilled, (state, action) => {
                state.selectedInvestor = action.payload as any;
            })
            // Create
            .addCase(createInvestor.fulfilled, (state, action) => {
                state.investors.unshift(action.payload as any);
            })
            // Add Capital
            .addCase(addCapital.fulfilled, (state, action) => {
                const index = state.investors.findIndex(i => i.id === action.payload.id);
                if (index !== -1) {
                    state.investors[index] = action.payload as any;
                }
                if (state.selectedInvestor?.id === action.payload.id) {
                    state.selectedInvestor = action.payload as any;
                }
            })
            // Assign Account (Legacy/Workaround)
            .addCase(assignAccount.fulfilled, (state, action) => {
                state.assignments.unshift(action.payload as any);
            })
            // Fetch Assignments (Legacy/Workaround)
            .addCase(fetchInvestorAssignments.fulfilled, (state, action) => {
                state.assignments = action.payload as any;
            })
            // Fetch Portfolio
            .addCase(fetchInvestorPortfolio.fulfilled, (state, action) => {
                state.portfolio = action.payload;
            })
            // Categories
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload as any;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categories.unshift(action.payload as any);
            })
            // Investments
            .addCase(fetchInvestments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchInvestments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.investments = action.payload as any;
            })
            .addCase(fetchInvestments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updateMarketPrice.fulfilled, (state, action) => {
                const index = state.investments.findIndex((i: any) => i.id === action.payload.id);
                if (index !== -1) {
                    state.investments[index].currentMarketPrice = action.payload.currentMarketPrice;
                    state.investments[index].currentValue =
                        state.investments[index].sharesHeld * action.payload.currentMarketPrice;
                }
            })
            .addCase(sellShares.fulfilled, (state, _action) => {
                // No-op, handled by UI refresh
            });
    },
});

export const { setSelectedInvestor, clearError } = investorSlice.actions;
export default investorSlice.reducer;
