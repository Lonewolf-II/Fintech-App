import { createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from '../../api/userApi';

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
