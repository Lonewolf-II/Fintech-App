import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchDistributions } from './profitSlice';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ProfitCalculator } from './components/ProfitCalculator';
import { DollarSign, PieChart, TrendingUp, History } from 'lucide-react';

export const ProfitDistribution: React.FC = () => {
    const dispatch = useAppDispatch();
    const { distributions, isLoading } = useAppSelector((state) => state.profit);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchDistributions({}));
    }, [dispatch]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Profit Distribution</h1>
                    <p className="text-slate-600">Calculate and view profit distributions</p>
                </div>
                <Button onClick={() => setIsCalculatorOpen(true)}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    New Distribution
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Profit Distributed</p>
                            <h3 className="text-2xl font-bold text-slate-900">
                                NPR {distributions.reduce((acc, curr) => acc + curr.totalProfit, 0).toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <PieChart className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Investor Share (60%)</p>
                            <h3 className="text-2xl font-bold text-slate-900">
                                NPR {distributions.reduce((acc, curr) => acc + curr.investorShare, 0).toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-full">
                            <History className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Office Share (40%)</p>
                            <h3 className="text-2xl font-bold text-slate-900">
                                NPR {distributions.reduce((acc, curr) => acc + curr.adminShare, 0).toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Distribution History Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800">Recent Distributions</h3>
                </div>
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Loading history...</div>
                ) : distributions.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No profit distributions recorded yet.</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-3 text-left">Date</th>
                                <th className="px-6 py-3 text-left">Inv ID</th>
                                <th className="px-6 py-3 text-right">Sale Amount</th>
                                <th className="px-6 py-3 text-right">Net Profit</th>
                                <th className="px-6 py-3 text-right text-blue-600">Investor (60%)</th>
                                <th className="px-6 py-3 text-right text-purple-600">Office (40%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-sm">
                            {distributions.map((dist) => (
                                <tr key={dist.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-slate-900">
                                        {new Date(dist.distributionDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">#{dist.investmentId}</td>
                                    <td className="px-6 py-4 text-right">
                                        {dist.saleAmount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-green-600">
                                        +{dist.totalProfit.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-blue-600">
                                        {dist.investorShare.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-purple-600">
                                        {dist.adminShare.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Calculator Modal */}
            <Modal
                isOpen={isCalculatorOpen}
                onClose={() => setIsCalculatorOpen(false)}
                title="Calculate Profit Distribution"
            >
                <ProfitCalculator
                    onSuccess={() => {
                        setIsCalculatorOpen(false);
                        dispatch(fetchDistributions({})); // Refresh list
                    }}
                />
            </Modal>
        </div>
    );
};
