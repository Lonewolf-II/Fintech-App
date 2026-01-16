import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchIPOStats } from '../ipo/ipoSlice';
import { fetchProfitStats } from '../investor/profitSlice';
import { fetchFeeStats } from './feeSlice';
import { Card, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TrendingUp, DollarSign, Activity, FileText } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const ipoStats = useAppSelector((state) => state.ipo.stats);
    const profitStats = useAppSelector((state) => state.profit.stats);
    const feeStats = useAppSelector((state) => state.fees.stats);

    useEffect(() => {
        dispatch(fetchIPOStats());
        dispatch(fetchProfitStats());
        dispatch(fetchFeeStats());
    }, [dispatch]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>

            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card variant="elevated" className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Office Profit</p>
                                <h3 className="text-3xl font-bold mt-1">
                                    NPR {(profitStats?.totalOfficeShare || 0).toLocaleString()}
                                </h3>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Fees Collected</p>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    NPR {(feeStats?.collected || 0).toLocaleString()}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Activity className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Funds Blocked (IPO)</p>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    NPR {(Number(ipoStats?.totalFundsBlocked || 0)).toLocaleString()}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Active IPOs</p>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {ipoStats?.pendingApplications ? 'Active' : '0'}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Sections - Placeholders for now */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Urgent Actions</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded text-sm">
                                <span className="text-yellow-800">{ipoStats?.pendingApplications || 0} IPO Applications to Verify</span>
                                <Button size="sm" variant="outline">View</Button>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-50 rounded text-sm">
                                <span className="text-red-800">{feeStats?.pending || 0} Pending Fees Overdue</span>
                                <Button size="sm" variant="outline">View</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-bold text-slate-800 mb-4">System Health</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Database Status</span>
                                <span className="text-green-600 font-medium">Connected</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Last Backup</span>
                                <span className="text-slate-900 font-medium">Today, 04:00 AM</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
