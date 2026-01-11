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
    async ({ accountId, params }: { accountId: string; params?: any }, { rejectWithValue }) => {
        try {
            return await bankingApi.getAccountTransactions(accountId, params);
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

export const updateAccount = createAsyncThunk(
    'banking/updateAccount',
    async ({ id, updates }: { id: string; updates: Partial<Account> }, { rejectWithValue }) => {
        try {
            return await bankingApi.updateAccount(id, updates);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update account');
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
            })
            .addCase(updateAccount.fulfilled, (state, action) => {
                const result = action.payload as any;
                // If it's a modification request response (has pending: true)
                if (result.pending) {
                    // Maybe set a global notification/message state?
                    // For now, we don't update the account in list because it's pending
                    return;
                }

                // If it's a direct update
                const updatedAccount = action.payload as Account;
                const index = state.accounts.findIndex(a => a.id === updatedAccount.id);
                if (index !== -1) {
                    state.accounts[index] = updatedAccount;
                }
                if (state.selectedAccount?.id === updatedAccount.id) {
                    state.selectedAccount = updatedAccount;
                }
            });
    },
});

export const { setSelectedAccount, clearError } = bankingSlice.actions;
export default bankingSlice.reducer;
