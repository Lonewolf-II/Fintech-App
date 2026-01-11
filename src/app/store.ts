import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/admin/userSlice';
import customerReducer from '../features/customers/customerSlice';
import bankingReducer from '../features/banking/bankingSlice';
import portfolioReducer from '../features/portfolio/portfolioSlice';
import checkerReducer from '../features/checker/checkerSlice';
import adminReducer from '../features/admin/adminSlice';
import investorReducer from '../features/investor/investorSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        customers: customerReducer,
        banking: bankingReducer,
        portfolio: portfolioReducer,
        checker: checkerReducer,
        admin: adminReducer,
        investor: investorReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
