import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { bankingApi } from '../../api/bankingApi';
import type { Account, Transaction } from '../../types/business.types';

interface BankingState {
    accounts: Account[];
    transactions: Transaction[];
    selectedAccount: Account | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: BankingState = {
    accounts: [],
    transactions: [],
    selectedAccount: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchAccounts = createAsyncThunk(
    'banking/fetchAccounts',
    async (_, { rejectWithValue }) => {
        try {
            return await bankingApi.getAllAccounts();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch accounts');
        }
    }
);

export const createAccount = createAsyncThunk(
    'banking/createAccount',
    async (accountData: { customerId: string; accountType: string }, { rejectWithValue }) => {
        try {
            return await bankingApi.createAccount(accountData);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create account');
        }
    }
);

export const fetchTransactions = createAsyncThunk(
    'banking/fetchTransactions',
    async (accountId: string, { rejectWithValue }) => {
        try {
            return await bankingApi.getAccountTransactions(accountId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch transactions');
        }
    }
);

export const createTransaction = createAsyncThunk(
    'banking/createTransaction',
    async (transactionData: any, { rejectWithValue }) => {
        try {
            return await bankingApi.createTransaction(transactionData);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create transaction');
        }
    }
);

const bankingSlice = createSlice({
    name: 'banking',
    initialState,
    reducers: {
        setSelectedAccount: (state, action: PayloadAction<Account | null>) => {
            state.selectedAccount = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAccounts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAccounts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.accounts = action.payload;
            })
            .addCase(fetchAccounts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createAccount.fulfilled, (state, action) => {
                state.accounts.unshift(action.payload);
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.transactions = action.payload;
            })
            .addCase(createTransaction.fulfilled, (state, action) => {
                state.transactions.unshift(action.payload);
            });
    },
});

export const { setSelectedAccount, clearError } = bankingSlice.actions;
export default bankingSlice.reducer;
