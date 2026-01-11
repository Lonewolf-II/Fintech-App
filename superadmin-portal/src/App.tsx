import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector, useAppDispatch } from './hooks/useRedux';
import { fetchMe } from './store/authSlice';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import TenantsPage from './pages/TenantsPage';
import PaymentsPage from './pages/PaymentsPage';
import AuditLogsPage from './pages/AuditLogsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAppSelector((state) => state.auth);
    return token ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
    const dispatch = useAppDispatch();
    const { token } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (token) {
            dispatch(fetchMe());
        }
    }, [token, dispatch]);

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Routes>
                                <Route path="/" element={<Navigate to="/tenants" />} />
                                <Route path="/tenants" element={<TenantsPage />} />
                                <Route path="/payments" element={<PaymentsPage />} />
                                <Route path="/audit" element={<AuditLogsPage />} />
                            </Routes>
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </Provider>
    );
}

export default App;
