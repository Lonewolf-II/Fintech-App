import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import {
    LayoutDashboard,
    Users,
    Building2,
    TrendingUp,
    FileText,
    Settings,
    ChevronLeft,
    ChevronRight,
    Briefcase,
    CheckCircle,
    PlusCircle,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import type { UserRole } from '../../types/auth.types';

interface NavItem {
    label: string;
    icon: React.ReactNode;
    path: string;
    roles: UserRole[];
}

const navigationItems: NavItem[] = [
    {
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
        path: '',
        roles: ['admin', 'maker', 'checker', 'investor'],
    },
    {
        label: 'User Management',
        icon: <Users className="w-5 h-5" />,
        path: '/users',
        roles: ['admin'],
    },
    {
        label: 'Activity Logs',
        icon: <FileText className="w-5 h-5" />,
        path: '/logs',
        roles: ['admin'],
    },
    {
        label: 'Customers',
        icon: <Users className="w-5 h-5" />,
        path: '/customers',
        roles: ['admin', 'maker'],
    },
    {
        label: 'Banking',
        icon: <Building2 className="w-5 h-5" />,
        path: '/banking',
        roles: ['admin', 'maker', 'checker'],
    },
    {
        label: 'Share Portfolio',
        icon: <TrendingUp className="w-5 h-5" />,
        path: '/portfolio',
        roles: ['admin', 'maker', 'checker', 'investor'],
    },
    {
        label: 'IPO Applications',
        icon: <FileText className="w-5 h-5" />,
        path: '/ipo-applications', // Changed to avoid conflict with /ipo listing management
        roles: ['admin', 'maker', 'checker'],
    },
    {
        label: 'IPO Management',
        icon: <TrendingUp className="w-5 h-5" />,
        path: '/ipo', // Admin's /ipo maps to IPOManagement
        roles: ['admin'],
    },
    {
        label: 'Pending Verification',
        icon: <CheckCircle className="w-5 h-5" />,
        path: '/verification',
        roles: ['checker'],
    },
    {
        label: 'Share Approvals',
        icon: <TrendingUp className="w-5 h-5" />,
        path: '/approvals',
        roles: ['checker'],
    },
    {
        label: 'My Investments',
        icon: <Briefcase className="w-5 h-5" />,
        path: '/investments',
        roles: ['investor'],
    },
    {
        label: 'Apply for IPO',
        icon: <PlusCircle className="w-5 h-5" />,
        path: '/ipo/apply',
        roles: ['maker'],
    },
    {
        label: 'Bulk IPO Application',
        icon: <PlusCircle className="w-5 h-5" />,
        path: '/bulk-ipo',
        roles: ['maker'],
    },
    {
        label: 'Transactions',
        icon: <TrendingUp className="w-5 h-5" />, // Or another suitable icon like DollarSign if available
        path: '/transactions',
        roles: ['maker'],
    },
    {
        label: 'Settings',
        icon: <Settings className="w-5 h-5" />,
        path: '/settings',
        roles: ['admin', 'maker', 'checker', 'investor'],
    },
];

export const Sidebar: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useAppSelector((state) => state.auth);

    if (!user) return null;

    const userNavItems = navigationItems.filter((item) =>
        item.roles.includes(user.role)
    );

    const basePath = `/${user.role}`;

    return (
        <aside
            className={cn(
                'bg-white border-r border-slate-200 flex flex-col transition-all duration-300',
                collapsed ? 'w-20' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
                {!collapsed && (
                    <div className="flex items-center space-x-2">
                        <Building2 className="w-6 h-6 text-primary-600" />
                        <span className="font-bold text-lg text-slate-900">FinTech</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    ) : (
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {userNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={`${basePath}${item.path}`}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                                isActive
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            )
                        }
                    >
                        {item.icon}
                        {!collapsed && <span className="text-sm">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-slate-200">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                        {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
