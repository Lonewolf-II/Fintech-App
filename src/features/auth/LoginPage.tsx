import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { login } from './authSlice';
import { Button } from '../../components/common/Button';
import { Building2, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

    // Navigate to dashboard after successful login
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(`/${user.role}`, { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(login({ email, password }) as any);
    };

    // Quick login buttons for demo
    const quickLogin = (role: string) => {
        const emails = {
            admin: 'admin@fintech.com',
            maker: 'maker@fintech.com',
            checker: 'checker@fintech.com',
            investor: 'investor@fintech.com',
        };
        setEmail(emails[role as keyof typeof emails]);
        setPassword('password');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-soft mb-4">
                        <Building2 className="w-8 h-8 text-primary-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">FinTech Portal</h1>
                    <p className="text-primary-100">Secure Banking & Investment Platform</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-6">Sign In</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email or Staff ID Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                Email or Staff ID
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="email"
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="you@example.com or STAFF-100"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Sign In
                        </Button>
                    </form>

                    {/* Demo Quick Login */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <p className="text-xs text-slate-500 text-center mb-3">Quick Demo Login</p>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => quickLogin('admin')}
                                className="text-xs"
                            >
                                Admin
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => quickLogin('maker')}
                                className="text-xs"
                            >
                                Maker
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => quickLogin('checker')}
                                className="text-xs"
                            >
                                Checker
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => quickLogin('investor')}
                                className="text-xs"
                            >
                                Investor
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-primary-100 text-sm mt-6">
                    © 2026 FinTech Portal. All rights reserved.
                </p>
            </div>
        </div>
    );
};
