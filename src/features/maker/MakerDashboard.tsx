import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PlusCircle, FileText, Clock } from 'lucide-react';

export const MakerDashboard: React.FC = () => {
    const pendingApplications = [
        { id: 1, customer: 'Ram Sharma', ipo: 'ABC Company', units: 10, amount: 'NPR 10,000', status: 'pending' },
        { id: 2, customer: 'Sita Thapa', ipo: 'XYZ Bank', units: 20, amount: 'NPR 20,000', status: 'pending' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Maker Dashboard</h2>
                    <p className="text-slate-600">Manage customer applications</p>
                </div>
                <Button variant="primary" className="flex items-center space-x-2">
                    <PlusCircle className="w-4 h-4" />
                    <span>New Application</span>
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-500 p-3 rounded-lg text-white">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">24</h3>
                                <p className="text-sm text-slate-600">Applications Submitted</p>
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
                                <h3 className="text-2xl font-bold text-slate-900">12</h3>
                                <p className="text-sm text-slate-600">Pending Verification</p>
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
                                <h3 className="text-2xl font-bold text-slate-900">12</h3>
                                <p className="text-sm text-slate-600">Verified Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Submissions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Customer</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">IPO</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Units</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingApplications.map((app) => (
                                    <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4 text-sm text-slate-900">{app.customer}</td>
                                        <td className="py-3 px-4 text-sm text-slate-900">{app.ipo}</td>
                                        <td className="py-3 px-4 text-sm text-slate-900">{app.units}</td>
                                        <td className="py-3 px-4 text-sm text-slate-900">{app.amount}</td>
                                        <td className="py-3 px-4">
                                            <Badge variant="warning">{app.status}</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
