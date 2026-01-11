import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPortfolios, fetchHoldings } from './portfolioSlice';
import { formatCurrency } from '../../utils/formatters';

import { TrendingUp, PieChart, DollarSign } from 'lucide-react';
import type { Portfolio } from '../../types/business.types';

export const PortfolioDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { portfolios, holdings, isLoading } = useAppSelector((state) => state.portfolio);
    const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

    useEffect(() => {
        dispatch(fetchPortfolios());
    }, [dispatch]);

    useEffect(() => {
        if (selectedPortfolio) {
            dispatch(fetchHoldings(selectedPortfolio.id));
        }
    }, [selectedPortfolio, dispatch]);

    const totalValue = portfolios.reduce((sum, p) => sum + parseFloat(p.totalValue.toString()), 0);
    const totalInvestment = portfolios.reduce((sum, p) => sum + parseFloat(p.totalInvestment.toString()), 0);
    const totalProfitLoss = totalValue - totalInvestment;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Portfolio Dashboard</h1>
                    <p className="text-slate-600">Manage investment portfolios</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Total Value</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {formatCurrency(totalValue)}
                            </p>
                        </div>
                        <DollarSign className="w-10 h-10 text-green-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Total Investment</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {formatCurrency(totalInvestment)}
                            </p>
                        </div>
                        <PieChart className="w-10 h-10 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Profit/Loss</p>
                            <p className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(totalProfitLoss)}
                            </p>
                        </div>
                        <TrendingUp className={`w-10 h-10 ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                </div>
            </div>

            {/* Portfolios List */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Portfolios</h2>
                </div>
                <div className="p-4">
                    {isLoading ? (
                        <p className="text-center py-4">Loading portfolios...</p>
                    ) : portfolios.length === 0 ? (
                        <p className="text-center py-4 text-slate-500">No portfolios found</p>
                    ) : (
                        <div className="space-y-3">
                            {portfolios.map((portfolio) => {
                                const pl = parseFloat(portfolio.profitLoss.toString());
                                return (
                                    <div
                                        key={portfolio.id}
                                        className="flex justify-between items-center p-4 border rounded-lg hover:bg-slate-50 cursor-pointer"
                                        onClick={() => setSelectedPortfolio(portfolio)}
                                    >
                                        <div>
                                            <p className="font-semibold">{portfolio.portfolioId}</p>
                                            <p className="text-sm text-slate-600">
                                                Investment: {formatCurrency(parseFloat(portfolio.totalInvestment.toString()))}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">
                                                {formatCurrency(parseFloat(portfolio.totalValue.toString()))}
                                            </p>
                                            <p className={`text-sm ${pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {pl >= 0 ? '+' : ''} {formatCurrency(pl).replace('NPR', '').trim()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Holdings */}
            {selectedPortfolio && (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">
                            Holdings - {selectedPortfolio.portfolioId}
                        </h2>
                    </div>
                    <div className="p-4">
                        {holdings.length === 0 ? (
                            <p className="text-center py-4 text-slate-500">No holdings</p>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Symbol</th>
                                        <th className="text-left py-2">Company</th>
                                        <th className="text-right py-2">Quantity</th>
                                        <th className="text-right py-2">Purchase Price</th>
                                        <th className="text-right py-2">Current Price</th>
                                        <th className="text-right py-2">Total Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {holdings.map((holding) => (
                                        <tr key={holding.id} className="border-b">
                                            <td className="py-3 font-semibold">{holding.stockSymbol}</td>
                                            <td className="py-3">{holding.companyName}</td>
                                            <td className="py-3 text-right">{holding.quantity}</td>
                                            <td className="py-3 text-right">{formatCurrency(parseFloat(holding.purchasePrice.toString()))}</td>
                                            <td className="py-3 text-right">{formatCurrency(parseFloat(holding.currentPrice.toString()))}</td>
                                            <td className="py-3 text-right font-bold">
                                                {formatCurrency(parseFloat(holding.totalValue.toString()))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
