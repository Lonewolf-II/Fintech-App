import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { ipoApi } from '../../api/ipoApi';
import type { IPOListing, IPOApplication, IPOStats } from '../../types/business.types';

interface IPOState {
    listings: IPOListing[];
    applications: IPOApplication[];
    stats: IPOStats | null;
    selectedListing: IPOListing | null;
    selectedApplication: IPOApplication | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: IPOState = {
    listings: [],
    applications: [],
    stats: null,
    selectedListing: null,
    selectedApplication: null,
    isLoading: false,
    error: null,
};

// Async thunks for IPO Listings
export const fetchListings = createAsyncThunk(
    'ipo/fetchListings',
    async (_, { rejectWithValue }) => {
        try {
            return await ipoApi.getListings();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch IPO listings');
        }
    }
);

export const fetchOpenListings = createAsyncThunk(
    'ipo/fetchOpenListings',
    async (_, { rejectWithValue }) => {
        try {
            return await ipoApi.getOpenListings();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch open IPO listings');
        }
    }
);

export const createListing = createAsyncThunk(
    'ipo/createListing',
    async (data: Partial<IPOListing>, { rejectWithValue }) => {
        try {
            return await ipoApi.createListing(data as any);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create IPO listing');
        }
    }
);

export const updateListingStatus = createAsyncThunk(
    'ipo/updateListingStatus',
    async ({ id, status }: { id: number; status: string }, { rejectWithValue }) => {
        try {
            return await ipoApi.updateStatus(id, status);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update IPO status');
        }
    }
);

export const updateListing = createAsyncThunk(
    'ipo/updateListing',
    async ({ id, data }: { id: number; data: Partial<IPOListing> }, { rejectWithValue }) => {
        try {
            return await ipoApi.updateListing(id, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update IPO listing');
        }
    }
);

// Async thunks for IPO Applications
export const deleteListing = createAsyncThunk(
    'ipo/deleteListing',
    async (id: number, { rejectWithValue }) => {
        try {
            await ipoApi.deleteListing(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete IPO listing');
        }
    }
);

export const fetchApplications = createAsyncThunk(
    'ipo/fetchApplications',
    async (customerId: string | undefined = undefined, { rejectWithValue }) => {
        try {
            return await ipoApi.getApplications(customerId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch applications');
        }
    }
);

export const applyForIPO = createAsyncThunk(
    'ipo/apply',
    async (data: { customerId: number; accountId: number; companyName: string; quantity: number; pricePerShare: number }, { rejectWithValue }) => {
        try {
            return await ipoApi.apply(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to apply for IPO');
        }
    }
);

export const verifyApplication = createAsyncThunk(
    'ipo/verify',
    async ({ id, status }: { id: number; status: 'verified' | 'rejected' }, { rejectWithValue }) => {
        try {
            return await ipoApi.verify(id, status);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to verify application');
        }
    }
);

export const allotApplication = createAsyncThunk(
    'ipo/allot',
    async ({ id, data }: { id: number; data: { allotmentQuantity: number; allotmentStatus: 'allotted' | 'not_allotted' } }, { rejectWithValue }) => {
        try {
            return await ipoApi.allotApplication(id, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to allot application');
        }
    }
);

export const updateApplication = createAsyncThunk(
    'ipo/updateApplication',
    async ({ id, data }: { id: number; data: Partial<IPOApplication> }, { rejectWithValue }) => {
        try {
            return await ipoApi.updateApplication(id.toString(), data as any);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update application');
        }
    }
);

export const deleteApplication = createAsyncThunk(
    'ipo/deleteApplication',
    async (id: number, { rejectWithValue }) => {
        try {
            await ipoApi.deleteApplication(id.toString());
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete application');
        }
    }
);

export const bulkApplyIPO = createAsyncThunk(
    'ipo/bulkApply',
    async ({ ipoListingId, applications }: { ipoListingId: number; applications: { customerId: number; quantity: number }[] }, { rejectWithValue }) => {
        try {
            return await ipoApi.bulkApply(ipoListingId, applications);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to bulk apply');
        }
    }
);

// Statistics
export const fetchIPOStats = createAsyncThunk(
    'ipo/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            return await ipoApi.getStats();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch IPO statistics');
        }
    }
);

const ipoSlice = createSlice({
    name: 'ipo',
    initialState,
    reducers: {
        setSelectedListing: (state, action: PayloadAction<IPOListing | null>) => {
            state.selectedListing = action.payload;
        },
        setSelectedApplication: (state, action: PayloadAction<IPOApplication | null>) => {
            state.selectedApplication = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch listings
            .addCase(fetchListings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchListings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.listings = action.payload as any;
            })
            .addCase(fetchListings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch open listings
            .addCase(fetchOpenListings.fulfilled, (state, action) => {
                state.listings = action.payload as any;
            })
            // Create listing
            .addCase(createListing.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createListing.fulfilled, (state, action) => {
                state.isLoading = false;
                state.listings.unshift(action.payload as any);
            })
            .addCase(createListing.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update listing status
            .addCase(updateListingStatus.fulfilled, (state, action) => {
                const index = state.listings.findIndex(l => l.id === action.payload.id);
                if (index !== -1) {
                    state.listings[index] = action.payload as any;
                }
            })
            // Update Full Listing
            .addCase(updateListing.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateListing.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.listings.findIndex(l => l.id === action.payload.id);
                if (index !== -1) {
                    state.listings[index] = action.payload as any;
                }
            })
            .addCase(updateListing.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch applications
            .addCase(fetchApplications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchApplications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.applications = action.payload as any;
            })
            .addCase(fetchApplications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Apply for IPO
            .addCase(applyForIPO.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(applyForIPO.fulfilled, (state, action) => {
                state.isLoading = false;
                state.applications.unshift(action.payload as any);
            })
            .addCase(applyForIPO.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Verify application
            .addCase(verifyApplication.fulfilled, (state, action) => {
                const index = state.applications.findIndex(a => Number(a.id) === Number((action.payload as any).id));
                if (index !== -1) {
                    state.applications[index] = action.payload as any;
                }
            })
            // Allot application
            .addCase(allotApplication.fulfilled, (state, action) => {
                const index = state.applications.findIndex(a => Number(a.id) === Number((action.payload as any).id));
                if (index !== -1) {
                    state.applications[index] = action.payload as any;
                }
            })
            // Update application
            .addCase(updateApplication.fulfilled, (state, action) => {
                const index = state.applications.findIndex(a => Number(a.id) === Number((action.payload as any).id));
                if (index !== -1) {
                    state.applications[index] = action.payload as any;
                }
            })
            // Delete application
            .addCase(deleteApplication.fulfilled, (state, action) => {
                state.applications = state.applications.filter(a => Number(a.id) !== action.payload);
            })
            // Delete Listing
            .addCase(deleteListing.fulfilled, (state, action) => {
                state.listings = state.listings.filter(l => l.id !== action.payload);
            })
            // Fetch stats
            .addCase(fetchIPOStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            });
    },
});

export const { setSelectedListing, setSelectedApplication, clearError } = ipoSlice.actions;
export default ipoSlice.reducer;
