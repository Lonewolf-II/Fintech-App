import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchInvestments, updateMarketPrice, sellShares } from './investorSlice';
import { Button } from '../../components/common/Button';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const InvestmentManagement: React.FC = () => {
    const dispatch = useAppDispatch();
    const { investments, isLoading } = useAppSelector((state) => state.investor);
    const [showUpdatePriceModal, setShowUpdatePriceModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        dispatch(fetchInvestments());
    }, [dispatch]);

    const handleUpdatePrice = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const price = parseFloat(formData.get('price') as string);

        if (!selectedInvestment || !price) return;

        try {
            await dispatch(updateMarketPrice({ id: selectedInvestment.id, price })).unwrap();
            toast.success('Market price updated successfully');
            setShowUpdatePriceModal(false);
            setSelectedInvestment(null);
            dispatch(fetchInvestments());
        } catch (error: any) {
            toast.error(error.message || 'Failed to update price');
        }
    };

    const handleSellShares = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const sharesSold = parseInt(formData.get('sharesSold') as string);
        const salePricePerShare = parseFloat(formData.get('salePricePerShare') as string);
        const adminFeePerAccount = parseFloat(formData.get('adminFeePerAccount') as string) || 1000;

        if (!selectedInvestment || !sharesSold || !salePricePerShare) return;

        try {
            await dispatch(sellShares({
                id: selectedInvestment.id,
                data: { sharesSold, salePricePerShare, adminFeePerAccount }
            })).unwrap();

            toast.success('Shares sold and profit distributed successfully');
            setShowSellModal(false);
            setSelectedInvestment(null);
            dispatch(fetchInvestments());
        } catch (error: any) {
            toast.error(error.message || 'Failed to sell shares');
        }
    };

    const filteredInvestments = filterStatus === 'all'
        ? investments
        : investments.filter(inv => inv.status === filterStatus);

    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.principalAmount.toString()), 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + parseFloat(inv.currentValue.toString()), 0);
    const totalProfit = investments.reduce((sum, inv) => sum + parseFloat(inv.investorProfit.toString()), 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Investment Management</h1>
                    <p className="text-slate-500">Monitor and manage all investor investments</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="all">All Investments</option>
                        <option value="active">Active</option>
                        <option value="partially_sold">Partially Sold</option>
                        <option value="fully_realized">Fully Realized</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Investments</p>
                            <p className="text-2xl font-bold text-slate-900">{investments.length}</p>
                        </div>
                        <Activity className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Invested</p>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalInvested)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Current Value</p>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalCurrentValue)}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Profit</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Investments Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Investment ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Shares
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Cost/Share
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Market Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Current Value
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center text-slate-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredInvestments.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center text-slate-500">
                                        No investments found.
                                    </td>
                                </tr>
                            ) : (
                                filteredInvestments.map((investment) => (
                                    <tr key={investment.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{investment.investmentId}</div>
                                            <div className="text-xs text-slate-500">
                                                {new Date(investment.investedAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900">
                                                {(investment as any).customer?.fullName || 'N/A'}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {(investment as any).account?.accountNumber || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900">
                                                {investment.sharesHeld} / {investment.sharesAllocated}
                                            </div>
                                            <div className="text-xs text-slate-500">Held / Allocated</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {formatCurrency(investment.costPerShare)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                            {formatCurrency(investment.currentMarketPrice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                            {formatCurrency(investment.currentValue)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${investment.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    investment.status === 'partially_sold' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {investment.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedInvestment(investment);
                                                    setShowUpdatePriceModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Update Price
                                            </button>
                                            {investment.sharesHeld > 0 && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedInvestment(investment);
                                                        setShowSellModal(true);
                                                    }}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Sell Shares
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Update Price Modal */}
            {showUpdatePriceModal && selectedInvestment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Update Market Price</h2>
                        <div className="mb-4 p-4 bg-slate-50 rounded-md">
                            <p className="text-sm text-slate-600">Investment: {selectedInvestment.investmentId}</p>
                            <p className="text-sm text-slate-600">Current Price: {formatCurrency(selectedInvestment.currentMarketPrice)}</p>
                            <p className="text-sm text-slate-600">Shares Held: {selectedInvestment.sharesHeld}</p>
                        </div>
                        <form onSubmit={handleUpdatePrice} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    New Market Price *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    step="0.01"
                                    min="0.01"
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter new price per share"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUpdatePriceModal(false);
                                        setSelectedInvestment(null);
                                    }}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <Button type="submit">Update Price</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sell Shares Modal */}
            {showSellModal && selectedInvestment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Sell Shares</h2>
                        <div className="mb-4 p-4 bg-slate-50 rounded-md space-y-1">
                            <p className="text-sm text-slate-600">Investment: {selectedInvestment.investmentId}</p>
                            <p className="text-sm text-slate-600">Shares Available: {selectedInvestment.sharesHeld}</p>
                            <p className="text-sm text-slate-600">Current Market Price: {formatCurrency(selectedInvestment.currentMarketPrice)}</p>
                            <p className="text-sm text-slate-600">Cost Per Share: {formatCurrency(selectedInvestment.costPerShare)}</p>
                        </div>
                        <form onSubmit={handleSellShares} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Number of Shares to Sell *
                                </label>
                                <input
                                    type="number"
                                    name="sharesSold"
                                    required
                                    min="1"
                                    max={selectedInvestment.sharesHeld}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter number of shares"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Sale Price Per Share *
                                </label>
                                <input
                                    type="number"
                                    name="salePricePerShare"
                                    required
                                    step="0.01"
                                    min="0.01"
                                    defaultValue={selectedInvestment.currentMarketPrice}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter sale price"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Admin Fee (per account)
                                </label>
                                <input
                                    type="number"
                                    name="adminFeePerAccount"
                                    step="0.01"
                                    defaultValue="1000"
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Default: 1000"
                                />
                            </div>
                            <div className="p-4 bg-blue-50 rounded-md">
                                <p className="text-sm font-medium text-blue-900">Profit Distribution:</p>
                                <p className="text-xs text-blue-700 mt-1">• 60% to Investor (after admin fee)</p>
                                <p className="text-xs text-blue-700">• 40% to Customer</p>
                                <p className="text-xs text-blue-700">• Principal returned to investor</p>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSellModal(false);
                                        setSelectedInvestment(null);
                                    }}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <Button type="submit">Sell Shares</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
