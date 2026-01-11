import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/apiClient';

interface AuthState {
    superadmin: any | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    superadmin: null,
    token: localStorage.getItem('superadmin_token'),
    isLoading: false,
    error: null
};

export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const data = await authApi.login(email, password);
            localStorage.setItem('superadmin_token', data.token);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Login failed');
        }
    }
);

export const fetchMe = createAsyncThunk(
    'auth/fetchMe',
    async (_, { rejectWithValue }) => {
        try {
            return await authApi.getMe();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch profile');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.superadmin = null;
            state.token = null;
            localStorage.removeItem('superadmin_token');
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.superadmin = action.payload.superadmin;
                state.token = action.payload.token;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.superadmin = action.payload;
            });
    }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
