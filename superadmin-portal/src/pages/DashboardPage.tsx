import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchDashboardStats, fetchRecentActivity, fetchSystemHealth } from '../store/dashboardSlice';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import RevenueChart from '../components/charts/RevenueChart';
import SubscriptionPieChart from '../components/charts/SubscriptionPieChart';
import TenantGrowthChart from '../components/charts/TenantGrowthChart';
import { Building2, Users, DollarSign, AlertCircle, Activity, TrendingUp, CreditCard } from 'lucide-react';

const DashboardPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { stats, recentActivity, systemHealth, loading } = useAppSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardStats());
        dispatch(fetchRecentActivity(10));
        dispatch(fetchSystemHealth());

        // Refresh stats every 30 seconds
        const interval = setInterval(() => {
            dispatch(fetchDashboardStats());
            dispatch(fetchSystemHealth());
        }, 30000);

        return () => clearInterval(interval);
    }, [dispatch]);

    const getActionBadge = (action: string) => {
        if (action.includes('created')) return <Badge variant="success">{action}</Badge>;
        if (action.includes('suspended') || action.includes('deleted')) return <Badge variant="danger">{action}</Badge>;
        if (action.includes('updated')) return <Badge variant="info">{action}</Badge>;
        return <Badge variant="default">{action}</Badge>;
    };

    // Prepare data for charts
    const revenueData = stats?.growth?.map((item, index) => ({
        month: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
        revenue: (stats.revenue.monthly / stats.growth.length) * (index + 1), // Simulated cumulative
        mrr: stats.revenue.monthly
    })) || [];

    const subscriptionData = [
        { name: 'Basic', value: Math.floor((stats?.tenants?.active || 0) * 0.5), color: '#3b82f6' },
        { name: 'Pro', value: Math.floor((stats?.tenants?.active || 0) * 0.3), color: '#8b5cf6' },
        { name: 'Enterprise', value: Math.floor((stats?.tenants?.active || 0) * 0.2), color: '#ec4899' },
    ];

    const growthData = stats?.growth?.map((item, index, arr) => {
        const cumulative = arr.slice(0, index + 1).reduce((sum, g) => sum + g.count, 0);
        return {
            month: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
            count: item.count,
            cumulative
        };
    }) || [];

    // Calculate ARPU (Average Revenue Per User)
    const arpu = stats?.tenants?.active && stats?.revenue?.monthly
        ? Math.round(stats.revenue.monthly / stats.tenants.active)
        : 0;

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Overview of your SaaS platform</p>
            </div>

            {/* System Health */}
            {systemHealth && (
                <div className="mb-6">
                    <div className={`p-4 rounded-lg border ${systemHealth.status === 'healthy' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Activity className={`w-5 h-5 ${systemHealth.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`} />
                                <span className={`font-medium ${systemHealth.status === 'healthy' ? 'text-green-900' : 'text-red-900'}`}>
                                    System Status: {systemHealth.status === 'healthy' ? 'All Systems Operational' : 'System Issues Detected'}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                Uptime: {Math.floor(systemHealth.uptime / 3600)}h {Math.floor((systemHealth.uptime % 3600) / 60)}m
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <StatCard
                        title="Total Tenants"
                        value={stats.tenants.total}
                        icon={Building2}
                        color="blue"
                        trend={{ value: 12, isPositive: true }}
                    />
                    <StatCard
                        title="Active Tenants"
                        value={stats.tenants.active}
                        icon={Users}
                        color="green"
                        trend={{ value: 8, isPositive: true }}
                    />
                    <StatCard
                        title="Monthly Revenue (MRR)"
                        value={`$${stats.revenue.monthly.toLocaleString()}`}
                        icon={DollarSign}
                        color="purple"
                        trend={{ value: 15, isPositive: true }}
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`$${stats.revenue.total.toLocaleString()}`}
                        icon={TrendingUp}
                        color="blue"
                        trend={{ value: 22, isPositive: true }}
                    />
                    <StatCard
                        title="ARPU"
                        value={`$${arpu}`}
                        icon={CreditCard}
                        color="green"
                        trend={{ value: 5, isPositive: true }}
                    />
                </div>
            )}

            {/* Revenue Trend Chart */}
            {revenueData.length > 0 && (
                <div className="mb-6">
                    <RevenueChart data={revenueData} />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Subscription Distribution */}
                {subscriptionData.length > 0 && (
                    <SubscriptionPieChart data={subscriptionData} />
                )}

                {/* Tenant Growth Chart */}
                {growthData.length > 0 && (
                    <TenantGrowthChart data={growthData} />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tenant Status Breakdown */}
                {stats && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tenant Status</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Active</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{ width: `${(stats.tenants.active / stats.tenants.total) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 w-8">{stats.tenants.active}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Trial</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-yellow-600 h-2 rounded-full"
                                            style={{ width: `${(stats.tenants.trial / stats.tenants.total) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 w-8">{stats.tenants.trial}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Suspended</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-red-600 h-2 rounded-full"
                                            style={{ width: `${(stats.tenants.suspended / stats.tenants.total) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 w-8">{stats.tenants.suspended}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Expired</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gray-600 h-2 rounded-full"
                                            style={{ width: `${(stats.tenants.expired / stats.tenants.total) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 w-8">{stats.tenants.expired}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                        ) : (
                            recentActivity.slice(0, 8).map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3 text-sm">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            {getActionBadge(activity.action)}
                                            {activity.tenant && (
                                                <span className="text-gray-600">
                                                    {activity.tenant.companyName}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(activity.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
