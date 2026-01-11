import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { investorApi, type Investor, type InvestorCategory, type Investment } from '../../api/investorApi';

interface InvestorState {
    investors: Investor[];
    categories: InvestorCategory[];
    investments: Investment[];
    selectedInvestor: Investor | null;
    selectedCategory: InvestorCategory | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: InvestorState = {
    investors: [],
    categories: [],
    investments: [],
    selectedInvestor: null,
    selectedCategory: null,
    isLoading: false,
    error: null
};

// Investor thunks
export const fetchInvestors = createAsyncThunk(
    'investor/fetchInvestors',
    async () => {
        const response = await investorApi.getAllInvestors();
        return response.data;
    }
);

export const createInvestor = createAsyncThunk(
    'investor/createInvestor',
    async (data: { name: string; email?: string; phone?: string; totalCapital?: number }) => {
        const response = await investorApi.createInvestor(data);
        return response.data;
    }
);

export const fetchInvestorById = createAsyncThunk(
    'investor/fetchInvestorById',
    async (id: number) => {
        const response = await investorApi.getInvestorById(id);
        return response.data;
    }
);

export const addCapital = createAsyncThunk(
    'investor/addCapital',
    async ({ id, amount }: { id: number; amount: number }) => {
        const response = await investorApi.addCapital(id, amount);
        return response.data;
    }
);

// Category thunks
export const fetchCategories = createAsyncThunk(
    'investor/fetchCategories',
    async () => {
        const response = await investorApi.getAllCategories();
        return response.data;
    }
);

export const createCategory = createAsyncThunk(
    'investor/createCategory',
    async (data: { categoryName: string; investorId?: number; description?: string }) => {
        const response = await investorApi.createCategory(data);
        return response.data;
    }
);

export const assignAccounts = createAsyncThunk(
    'investor/assignAccounts',
    async ({ categoryId, accountIds }: { categoryId: number; accountIds: number[] }) => {
        const response = await investorApi.assignAccountsToCategory(categoryId, accountIds);
        return response.data;
    }
);

// Investment thunks
export const fetchInvestments = createAsyncThunk(
    'investor/fetchInvestments',
    async (status?: string) => {
        const response = await investorApi.getAllInvestments(status);
        return response.data;
    }
);

export const updateMarketPrice = createAsyncThunk(
    'investor/updateMarketPrice',
    async ({ id, price }: { id: number; price: number }) => {
        const response = await investorApi.updateMarketPrice(id, price);
        return response.data;
    }
);

export const sellShares = createAsyncThunk(
    'investor/sellShares',
    async ({ id, data }: { id: number; data: { sharesSold: number; salePricePerShare: number; adminFeePerAccount?: number } }) => {
        const response = await investorApi.sellShares(id, data);
        return response.data;
    }
);

const investorSlice = createSlice({
    name: 'investor',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setSelectedInvestor: (state, action) => {
            state.selectedInvestor = action.payload;
        },
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch investors
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
                state.error = action.error.message || 'Failed to fetch investors';
            })
            // Create investor
            .addCase(createInvestor.fulfilled, (state, action) => {
                state.investors.push(action.payload);
            })
            // Fetch investor by ID
            .addCase(fetchInvestorById.fulfilled, (state, action) => {
                state.selectedInvestor = action.payload;
            })
            // Add capital
            .addCase(addCapital.fulfilled, (state, action) => {
                const index = state.investors.findIndex(i => i.id === action.payload.id);
                if (index !== -1) {
                    state.investors[index] = action.payload;
                }
                if (state.selectedInvestor?.id === action.payload.id) {
                    state.selectedInvestor = action.payload;
                }
            })
            // Fetch categories
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            })
            // Create category
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categories.push(action.payload);
            })
            // Fetch investments
            .addCase(fetchInvestments.fulfilled, (state, action) => {
                state.investments = action.payload;
            })
            // Update market price
            .addCase(updateMarketPrice.fulfilled, (state, action) => {
                const index = state.investments.findIndex(i => i.id === action.payload.id);
                if (index !== -1) {
                    state.investments[index] = action.payload;
                }
            });
    }
});

export const { clearError, setSelectedInvestor, setSelectedCategory } = investorSlice.actions;
export default investorSlice.reducer;
