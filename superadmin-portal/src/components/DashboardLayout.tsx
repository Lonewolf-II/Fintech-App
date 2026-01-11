import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { logout } from '../store/authSlice';
import { Building2, CreditCard, FileText, LogOut, Shield } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { superadmin } = useAppSelector((state) => state.auth);

    const navigation = [
        { name: 'Tenants', path: '/tenants', icon: Building2 },
        { name: 'Payments', path: '/payments', icon: CreditCard },
        { name: 'Audit Logs', path: '/audit', icon: FileText }
    ];

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="bg-primary-600 p-2 rounded-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Superadmin</h1>
                            <p className="text-xs text-gray-500">SaaS Management</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary-50 text-primary-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {superadmin?.name || 'Admin'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {superadmin?.email}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="ml-2 p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;
