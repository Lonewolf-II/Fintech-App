import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export const CheckerDashboard: React.FC = () => {
    const pendingVerifications = [
        { id: 1, customer: 'Ram Sharma', ipo: 'ABC Company', units: 10, amount: 'NPR 10,000', maker: 'Maker Staff', date: '2026-01-10' },
        { id: 2, customer: 'Sita Thapa', ipo: 'XYZ Bank', units: 20, amount: 'NPR 20,000', maker: 'Maker Staff', date: '2026-01-10' },
        { id: 3, customer: 'Hari Prasad', ipo: 'DEF Finance', units: 15, amount: 'NPR 15,000', maker: 'Maker Staff', date: '2026-01-09' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Checker Dashboard</h2>
                <p className="text-slate-600">Verify and approve applications</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">45</h3>
                                <p className="text-sm text-slate-600">Verified Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-red-500 p-3 rounded-lg text-white">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">3</h3>
                                <p className="text-sm text-slate-600">Rejected Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Verification Queue */}
            <Card>
                <CardHeader>
                    <CardTitle>Verification Queue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {pendingVerifications.map((app) => (
                            <div key={app.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{app.customer}</h4>
                                        <p className="text-sm text-slate-600">{app.ipo} • {app.units} units • {app.amount}</p>
                                        <p className="text-xs text-slate-500 mt-1">Submitted by {app.maker} on {app.date}</p>
                                    </div>
                                    <Badge variant="warning">Pending</Badge>
                                </div>
                                <div className="flex space-x-2">
                                    <Button variant="secondary" size="sm" className="flex items-center space-x-1">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Verify</span>
                                    </Button>
                                    <Button variant="danger" size="sm" className="flex items-center space-x-1">
                                        <XCircle className="w-4 h-4" />
                                        <span>Reject</span>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
