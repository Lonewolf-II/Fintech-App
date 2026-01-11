import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Users, Building2, TrendingUp, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const AdminDashboard: React.FC = () => {
    const stats = [
        {
            label: 'Total Customers',
            value: '1,234',
            change: '+12%',
            trend: 'up',
            icon: <Users className="w-6 h-6" />,
            color: 'bg-blue-500',
        },
        {
            label: 'Total Deposits',
            value: formatCurrency(45678900),
            change: '+8.2%',
            trend: 'up',
            icon: <Building2 className="w-6 h-6" />,
            color: 'bg-green-500',
        },
        {
            label: 'Active IPOs',
            value: '8',
            change: '+2',
            trend: 'up',
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'bg-purple-500',
        },
        {
            label: 'Pending Applications',
            value: '156',
            change: '-5%',
            trend: 'down',
            icon: <FileText className="w-6 h-6" />,
            color: 'bg-amber-500',
        },
    ];

    const recentActivities = [
        { id: 1, type: 'Customer Created', user: 'Maker Staff', time: '5 min ago', status: 'success' },
        { id: 2, type: 'IPO Application', user: 'Investor User', time: '12 min ago', status: 'pending' },
        { id: 3, type: 'Application Verified', user: 'Checker Staff', time: '25 min ago', status: 'success' },
        { id: 4, type: 'Deposit Transaction', user: 'System', time: '1 hour ago', status: 'success' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
                <p className="text-slate-600">System overview and monitoring</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} variant="elevated">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                                    {stat.icon}
                                </div>
                                <div className="flex items-center space-x-1 text-sm">
                                    {stat.trend === 'up' ? (
                                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                                    )}
                                    <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                                        {stat.change}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                            <p className="text-sm text-slate-600">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="font-medium text-slate-900">{activity.type}</p>
                                    <p className="text-sm text-slate-500">{activity.user} • {activity.time}</p>
                                </div>
                                <Badge variant={activity.status === 'success' ? 'success' : 'warning'}>
                                    {activity.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
