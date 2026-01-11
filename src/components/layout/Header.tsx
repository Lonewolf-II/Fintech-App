import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { mockNotifications } from '../../services/mockData';
import { formatDateTime } from '../../utils/formatters';

export const Header: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const unreadCount = mockNotifications.filter((n) => !n.read).length;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            {/* Page Title */}
            <div>
                <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500">Welcome back, {user.name}</p>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <Bell className="w-5 h-5 text-slate-600" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-soft border border-slate-200 z-50 animate-fade-in">
                            <div className="p-4 border-b border-slate-200">
                                <h3 className="font-semibold text-slate-900">Notifications</h3>
                                <p className="text-xs text-slate-500">{unreadCount} unread</p>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {mockNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-primary-50/30' : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <h4 className="font-medium text-sm text-slate-900">{notification.title}</h4>
                                            <Badge variant={notification.type === 'success' ? 'success' : notification.type === 'warning' ? 'warning' : 'info'} className="text-xs">
                                                {notification.type}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-600">{notification.message}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {formatDateTime(notification.createdAt)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <Avatar name={user.name} size="sm" />
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-medium text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-soft border border-slate-200 z-50 animate-fade-in">
                            <div className="p-2">
                                <button className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left">
                                    <User className="w-4 h-4 text-slate-600" />
                                    <span className="text-sm text-slate-700">Profile</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm">Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
