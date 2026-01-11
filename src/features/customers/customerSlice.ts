import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { customerApi } from '../../api/customerApi';
import { bankingApi } from '../../api/bankingApi';
import { ipoApi, type ApplyIPOPayload } from '../../api/ipoApi';
import type { Customer } from '../../types/business.types';

interface CustomerState {
    customers: Customer[];
    selectedCustomer: Customer | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: CustomerState = {
    customers: [],
    selectedCustomer: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchCustomers = createAsyncThunk(
    'customers/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await customerApi.getAll();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch customers');
        }
    }
);

export const fetchCustomer = createAsyncThunk(
    'customers/fetchOne',
    async (id: string, { rejectWithValue }) => {
        try {
            return await customerApi.getById(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch customer');
        }
    }
);

export const createCustomer = createAsyncThunk(
    'customers/create',
    async (customerData: Omit<Customer, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
        try {
            return await customerApi.create(customerData);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create customer');
        }
    }
);

export const uploadBulkCustomers = createAsyncThunk(
    'customers/bulkUpload',
    async (file: File, { rejectWithValue }) => {
        try {
            return await customerApi.bulkUpload(file);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to upload customers');
        }
    }
);

export const updateCustomer = createAsyncThunk(
    'customers/update',
    async ({ id, data }: { id: string; data: Partial<Customer> }, { rejectWithValue }) => {
        try {
            return await customerApi.update(id, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update customer');
        }
    }
);

export const deleteCustomer = createAsyncThunk(
    'customers/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await customerApi.delete(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete customer');
        }
    }
);

export const applyIPO = createAsyncThunk(
    'customers/applyIPO',
    async (data: ApplyIPOPayload, { rejectWithValue }) => {
        try {
            return await ipoApi.apply(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to apply for IPO');
        }
    }
);

export const addBankAccount = createAsyncThunk(
    'customers/addBankAccount',
    async (data: {
        customerId: string;
        accountType: string;
        accountNumber: string;
        bankName: string;
        branch: string;
        accountName: string;
        status: string;
    }, { rejectWithValue }) => {
        try {
            return await bankingApi.createAccount(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to add bank account');
        }
    }
);

export const addCustomerCredential = createAsyncThunk(
    'customers/addCredential',
    async ({ customerId, credentialData }: { customerId: string; credentialData: any }, { rejectWithValue }) => {
        try {
            return await customerApi.addCredential(customerId, credentialData);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to add credential');
        }
    }
);

const customerSlice = createSlice({
    name: 'customers',
    initialState,
    reducers: {
        setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
            state.selectedCustomer = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch customers
            .addCase(fetchCustomers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.customers = action.payload;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch single customer
            .addCase(fetchCustomer.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCustomer.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedCustomer = action.payload;
            })
            .addCase(fetchCustomer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create customer
            .addCase(createCustomer.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createCustomer.fulfilled, (state, action) => {
                state.isLoading = false;
                state.customers.unshift(action.payload);
            })
            .addCase(createCustomer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Bulk Upload
            .addCase(uploadBulkCustomers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .addCase(uploadBulkCustomers.fulfilled, (state, _action) => {
                state.isLoading = false;
                // Ideally refresh customers list or add returned customers
            })
            .addCase(uploadBulkCustomers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update customer
            .addCase(updateCustomer.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCustomer.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.customers.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) {
                    state.customers[index] = action.payload;
                }
                if (state.selectedCustomer?.id === action.payload.id) {
                    state.selectedCustomer = action.payload;
                }
            })
            .addCase(updateCustomer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Delete customer
            .addCase(deleteCustomer.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCustomer.fulfilled, (state, action) => {
                state.isLoading = false;
                state.customers = state.customers.filter((c) => c.id !== action.payload);
                if (state.selectedCustomer?.id === action.payload) {
                    state.selectedCustomer = null;
                }
            })
            .addCase(deleteCustomer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Apply IPO
            .addCase(applyIPO.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(applyIPO.fulfilled, (state, action) => {
                state.isLoading = false;
                // Add to selectedCustomer applications if loaded
                if (state.selectedCustomer && state.selectedCustomer.ipoApplications) {
                    state.selectedCustomer.ipoApplications.unshift(action.payload); // Response is the application
                }
            })
            .addCase(applyIPO.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Add Bank Account
            .addCase(addBankAccount.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addBankAccount.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.selectedCustomer) {
                    // Initialize accounts array if it doesn't exist
                    if (!state.selectedCustomer.accounts) {
                        state.selectedCustomer.accounts = [];
                    }
                    state.selectedCustomer.accounts.unshift(action.payload);
                }
            })
            .addCase(addBankAccount.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Add Credential
            .addCase(addCustomerCredential.fulfilled, (state, action) => {
                if (state.selectedCustomer) {
                    if (!state.selectedCustomer.credentials) {
                        state.selectedCustomer.credentials = [];
                    }
                    state.selectedCustomer.credentials.push(action.payload);
                }
            });
    },
});

export const { setSelectedCustomer, clearError } = customerSlice.actions;
export default customerSlice.reducer;
