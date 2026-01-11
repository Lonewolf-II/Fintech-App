import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { useAppSelector } from './app/hooks';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { UserManagement } from './features/admin/UserManagement';
import { IPOManagement } from './features/admin/IPOManagement';
import { BulkIPO } from './features/maker/BulkIPO';
import { CustomerManagement } from './features/customers/CustomerManagement';
import { CustomerProfile } from './features/customers/CustomerProfile';
import { BankingDashboard } from './features/banking/BankingDashboard';
import { PortfolioDashboard } from './features/portfolio/PortfolioDashboard';
import { MakerDashboard } from './features/maker/MakerDashboard';
import { CheckerDashboard } from './features/checker/CheckerDashboard';
import { InvestorDashboard } from './features/investor/InvestorDashboard';

// Root redirect component
const RootRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}`, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return null;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="customers" element={<CustomerManagement />} />
                <Route path="customers/:id" element={<CustomerProfile />} />
                <Route path="banking" element={<BankingDashboard />} />
                <Route path="portfolio" element={<PortfolioDashboard />} />
                <Route path="ipo-applications" element={<div>IPO Applications List (Coming Soon)</div>} />
                <Route path="ipo" element={<IPOManagement />} />
                <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Maker Routes */}
      <Route
        path="/maker/*"
        element={
          <ProtectedRoute allowedRoles={['maker']}>
            <DashboardLayout>
              <Routes>
                <Route index element={<MakerDashboard />} />
                <Route path="customers" element={<CustomerManagement />} />
                <Route path="customers/:id" element={<CustomerProfile />} />
                <Route path="banking" element={<BankingDashboard />} />
                <Route path="portfolio" element={<PortfolioDashboard />} />
                <Route path="ipo-applications" element={<div>IPO Applications List (Coming Soon)</div>} />
                <Route path="ipo/apply" element={<div>Manual Application Entry (Coming Soon)</div>} />
                <Route path="bulk-ipo" element={<BulkIPO />} />
                <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Checker Routes */}
      <Route
        path="/checker/*"
        element={
          <ProtectedRoute allowedRoles={['checker']}>
            <DashboardLayout>
              <Routes>
                <Route index element={<CheckerDashboard />} />
                <Route path="banking" element={<div>Banking Page (Coming Soon)</div>} />
                <Route path="portfolio" element={<div>Portfolio Page (Coming Soon)</div>} />
                <Route path="ipo" element={<div>IPO Page (Coming Soon)</div>} />
                <Route path="verification" element={<div>Verification Queue (Coming Soon)</div>} />
                <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Investor Routes */}
      <Route
        path="/investor/*"
        element={
          <ProtectedRoute allowedRoles={['investor']}>
            <DashboardLayout>
              <Routes>
                <Route index element={<InvestorDashboard />} />
                <Route path="portfolio" element={<PortfolioDashboard />} />
                <Route path="investments" element={<div>My Investments (Coming Soon)</div>} />
                <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

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
