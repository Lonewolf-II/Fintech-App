import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector, useAppDispatch } from './hooks/useRedux';
import { fetchMe } from './store/authSlice';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import TenantsPage from './pages/TenantsPage';
import TenantDetailsPage from './pages/TenantDetailsPage';
import PaymentsPage from './pages/PaymentsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import InactiveTenantsPage from './pages/InactiveTenantsPage';

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
                                <Route path="/" element={<Navigate to="/dashboard" />} />
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/tenants" element={<TenantsPage />} />
                                <Route path="/tenants/inactive" element={<InactiveTenantsPage />} />
                                <Route path="/tenants/:id" element={<TenantDetailsPage />} />
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
