import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { userApi } from '../../api/userApi';
import type { User } from '../../types/auth.types';

interface UserManagementState {
    users: User[];
    selectedUser: User | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: UserManagementState = {
    users: [],
    selectedUser: null,
    isLoading: false,
    error: null,
};

// Async Thunks
export const fetchUsers = createAsyncThunk(
    'userManagement/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            return await userApi.getAll();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch users');
        }
    }
);

export const createUser = createAsyncThunk(
    'userManagement/createUser',
    async (userData: Omit<User, 'id' | 'userId' | 'createdAt'>, { rejectWithValue }) => {
        try {
            return await userApi.create(userData);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create user');
        }
    }
);

export const updateUser = createAsyncThunk(
    'userManagement/updateUser',
    async ({ id, data }: { id: string; data: Partial<User> }, { rejectWithValue }) => {
        try {
            return await userApi.update(id, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update user');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'userManagement/deleteUser',
    async (id: string, { rejectWithValue }) => {
        try {
            await userApi.delete(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete user');
        }
    }
);

export const resetUserPassword = createAsyncThunk(
    'userManagement/resetPassword',
    async ({ userId, password }: { userId: string; password: string }, { rejectWithValue }) => {
        try {
            await userApi.resetPassword(userId, password);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to reset password');
        }
    }
);

const userSlice = createSlice({
    name: 'userManagement',
    initialState,
    reducers: {
        setSelectedUser: (state, action: PayloadAction<User | null>) => {
            state.selectedUser = action.payload;
        },
        setUsers: (state, action: PayloadAction<User[]>) => {
            state.users = action.payload;
        },
        addUser: (state, action: PayloadAction<User>) => {
            state.users.unshift(action.payload);
        },
        updateUserLocal: (state, action: PayloadAction<User>) => {
            const index = state.users.findIndex((u) => u.id === action.payload.id);
            if (index !== -1) {
                state.users[index] = action.payload;
            }
        },
        removeUser: (state, action: PayloadAction<string>) => {
            state.users = state.users.filter((u) => u.id !== action.payload);
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create User
            .addCase(createUser.fulfilled, (state, action) => {
                state.users.unshift(action.payload);
            })
            // Update User
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.users.findIndex((u) => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                state.selectedUser = null;
            })
            // Delete User
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter((u) => u.id !== action.payload);
            });
    },
});

export const {
    setSelectedUser,
    clearError,
    setUsers,
    addUser,
    updateUserLocal,
    removeUser
} = userSlice.actions;
export default userSlice.reducer;
