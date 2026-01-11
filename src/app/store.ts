import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userManagementReducer from '../features/admin/userSlice';
import customerReducer from '../features/customers/customerSlice';
import bankingReducer from '../features/banking/bankingSlice';
import portfolioReducer from '../features/portfolio/portfolioSlice';
import checkerReducer from '../features/checker/checkerSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        userManagement: userManagementReducer,
        customers: customerReducer,
        banking: bankingReducer,
        portfolio: portfolioReducer,
        checker: checkerReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
