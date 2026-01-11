import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Wallet, TrendingUp, Building2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const InvestorDashboard: React.FC = () => {
    const accountBalance = {
        total: 150000,
        hold: 20000,
        available: 130000,
    };

    const ipoApplications = [
        { id: 1, ipo: 'ABC Company', units: 10, amount: 10000, status: 'verified', date: '2026-01-08' },
        { id: 2, ipo: 'XYZ Bank', units: 20, amount: 20000, status: 'pending', date: '2026-01-10' },
    ];

    const portfolio = [
        { symbol: 'ABC', company: 'ABC Company', quantity: 50, avgPrice: 200, currentPrice: 250 },
        { symbol: 'XYZ', company: 'XYZ Bank', quantity: 30, avgPrice: 300, currentPrice: 320 },
    ];

    const totalPortfolioValue = portfolio.reduce((sum, holding) => sum + (holding.quantity * holding.currentPrice), 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Investor Dashboard</h2>
                <p className="text-slate-600">Your investment overview</p>
            </div>

            {/* Account Balance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-500 p-3 rounded-lg text-white">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Balance</p>
                                <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(accountBalance.total)}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-amber-500 p-3 rounded-lg text-white">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Hold Balance</p>
                                <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(accountBalance.hold)}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-500 p-3 rounded-lg text-white">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Portfolio Value</p>
                                <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalPortfolioValue)}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* IPO Applications */}
            <Card>
                <CardHeader>
                    <CardTitle>My IPO Applications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {ipoApplications.map((app) => (
                            <div key={app.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                <div>
                                    <h4 className="font-semibold text-slate-900">{app.ipo}</h4>
                                    <p className="text-sm text-slate-600">{app.units} units • {formatCurrency(app.amount)}</p>
                                    <p className="text-xs text-slate-500 mt-1">Applied on {app.date}</p>
                                </div>
                                <Badge variant={app.status === 'verified' ? 'success' : 'warning'}>
                                    {app.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Portfolio Holdings */}
            <Card>
                <CardHeader>
                    <CardTitle>Portfolio Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Symbol</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Company</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Quantity</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Avg Price</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Current Price</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {portfolio.map((holding) => (
                                    <tr key={holding.symbol} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4 text-sm font-medium text-slate-900">{holding.symbol}</td>
                                        <td className="py-3 px-4 text-sm text-slate-900">{holding.company}</td>
                                        <td className="py-3 px-4 text-sm text-right text-slate-900">{holding.quantity}</td>
                                        <td className="py-3 px-4 text-sm text-right text-slate-900">{formatCurrency(holding.avgPrice)}</td>
                                        <td className="py-3 px-4 text-sm text-right text-slate-900">{formatCurrency(holding.currentPrice)}</td>
                                        <td className="py-3 px-4 text-sm text-right font-medium text-slate-900">
                                            {formatCurrency(holding.quantity * holding.currentPrice)}
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
