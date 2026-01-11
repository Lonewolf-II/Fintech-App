import React, { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCustomers } from '../customers/customerSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PlusCircle, FileText, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MakerDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { customers } = useAppSelector((state) => state.customers);

    // In a real app we'd likely have a dashboard stats endpoint.
    // Here we calculate from loaded customers.

    useEffect(() => {
        dispatch(fetchCustomers());
    }, [dispatch]);

    const stats = useMemo(() => {
        const total = customers.length;
        const pending = customers.filter(c => c.kycStatus === 'pending').length;
        const verified = customers.filter(c => c.kycStatus === 'verified').length;

        // Just an example of "Recent" - last 5
        const recent = [...customers]
            .sort((a, b) => (new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()))
            .slice(0, 5);

        return { total, pending, verified, recent };
    }, [customers]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Maker Dashboard</h2>
                    <p className="text-slate-600">Overview of customer activities</p>
                </div>
                <div className="flex space-x-2">
                    <Link to="/maker/customers">
                        <Button variant="primary" className="flex items-center space-x-2">
                            <PlusCircle className="w-4 h-4" />
                            <span>Manage Customers</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-500 p-3 rounded-lg text-white">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
                                <p className="text-sm text-slate-600">Total Customers</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-amber-500 p-3 rounded-lg text-white">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">{stats.pending}</h3>
                                <p className="text-sm text-slate-600">Pending KYC</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-500 p-3 rounded-lg text-white">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">{stats.verified}</h3>
                                <p className="text-sm text-slate-600">Verified Customers</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Customers */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Customers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Phone</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Account Type</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">KYC Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-4 text-center text-slate-500">No customers found.</td>
                                    </tr>
                                ) : (
                                    stats.recent.map((customer) => (
                                        <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4 text-sm text-slate-900">{customer.fullName}</td>
                                            <td className="py-3 px-4 text-sm text-slate-900">{customer.email}</td>
                                            <td className="py-3 px-4 text-sm text-slate-900">{customer.phone}</td>
                                            <td className="py-3 px-4 text-sm text-slate-900 capitalize">{customer.accountType}</td>
                                            <td className="py-3 px-4">
                                                <Badge
                                                    variant={
                                                        customer.kycStatus === 'verified' ? 'success' :
                                                            customer.kycStatus === 'rejected' ? 'error' : 'warning'
                                                    }
                                                >
                                                    {customer.kycStatus}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
