import React, { useEffect, useState } from 'react';
import { investmentApi, type HoldingSummary } from '../../api/investmentApi';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, RefreshCw, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const InvestmentManagement: React.FC = () => {
    const [summary, setSummary] = useState<HoldingSummary[]>([]);
    const [grandTotal, setGrandTotal] = useState({ totalValueAtClosing: 0, totalValueAtLTP: 0, totalInvestment: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [expandedScrip, setExpandedScrip] = useState<string | null>(null);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [selectedScrip, setSelectedScrip] = useState<HoldingSummary | null>(null);
    const [priceForm, setPriceForm] = useState({
        lastClosingPrice: 0,
        lastTransactionPrice: 0
    });

    useEffect(() => {
        loadHoldings();
    }, []);

    const loadHoldings = async () => {
        try {
            setIsLoading(true);
            const data = await investmentApi.getAllHoldings();
            setSummary(data.summary);
            setGrandTotal(data.grandTotal);
        } catch (error) {
            console.error('Failed to load holdings:', error);
            toast.error('Failed to load holdings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePrice = (scrip: HoldingSummary) => {
        setSelectedScrip(scrip);
        setPriceForm({
            lastClosingPrice: scrip.lastClosingPrice,
            lastTransactionPrice: scrip.lastTransactionPrice
        });
        setShowPriceModal(true);
    };

    const handleSubmitPrice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedScrip) return;

        try {
            await investmentApi.updateScripPrices(selectedScrip.scripName, priceForm);
            toast.success(`Updated prices for ${selectedScrip.scripName}`);
            setShowPriceModal(false);
            setSelectedScrip(null);
            loadHoldings();
        } catch (error) {
            toast.error('Failed to update prices');
        }
    };

    const toggleExpand = (scripName: string) => {
        setExpandedScrip(expandedScrip === scripName ? null : scripName);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Investment Management</h1>
                    <p className="text-slate-500">View and manage customer holdings and stock prices</p>
                </div>
                <Button onClick={loadHoldings} variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Total Investment</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {formatCurrency(grandTotal.totalInvestment)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Value at Closing</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(grandTotal.totalValueAtClosing)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Value at LTP</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {formatCurrency(grandTotal.totalValueAtLTP)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Holdings Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <p className="text-slate-600">Loading holdings...</p>
                    </div>
                ) : summary.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-slate-600">No holdings found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Scrip</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Current Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Last Closing Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Value as of Last Closing</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">LTP</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Value as of LTP</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {summary.map((item, index) => (
                                <React.Fragment key={item.scripName}>
                                    <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => toggleExpand(item.scripName)}>
                                        <td className="px-6 py-4 text-sm text-slate-900">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {expandedScrip === item.scripName ? (
                                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">{item.scripName}</div>
                                                    <div className="text-xs text-slate-500">{item.companyName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900">{item.totalQuantity}</td>
                                        <td className="px-6 py-4 text-sm text-slate-900">{formatCurrency(item.lastClosingPrice)}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatCurrency(item.valueAtClosing)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-900">{formatCurrency(item.lastTransactionPrice)}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatCurrency(item.valueAtLTP)}</td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleUpdatePrice(item)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Update Prices"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedScrip === item.scripName && (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-4 bg-slate-50">
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-slate-900 mb-2">Customer Holdings:</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {item.customerHoldings.map((holding: any) => (
                                                            <div key={holding.id} className="bg-white p-3 rounded border border-slate-200">
                                                                <div className="flex justify-between">
                                                                    <span className="text-sm font-medium">{holding.customerName}</span>
                                                                    <span className="text-sm text-slate-600">{holding.quantity} shares</span>
                                                                </div>
                                                                <div className="text-xs text-slate-500 mt-1">
                                                                    Purchase: {formatCurrency(holding.purchasePrice)} |
                                                                    Total: {formatCurrency(holding.quantity * holding.purchasePrice)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            {/* Total Row */}
                            <tr className="bg-slate-100 font-bold">
                                <td colSpan={4} className="px-6 py-4 text-sm text-slate-900">Total</td>
                                <td className="px-6 py-4 text-sm text-slate-900">{formatCurrency(grandTotal.totalValueAtClosing)}</td>
                                <td className="px-6 py-4 text-sm text-slate-900"></td>
                                <td className="px-6 py-4 text-sm text-slate-900">{formatCurrency(grandTotal.totalValueAtLTP)}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>

            {/* Price Update Modal */}
            {showPriceModal && selectedScrip && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Update Prices for {selectedScrip.scripName}</h2>
                        <form onSubmit={handleSubmitPrice} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Last Closing Price (NPR)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={priceForm.lastClosingPrice}
                                    onChange={(e) => setPriceForm({ ...priceForm, lastClosingPrice: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Last Transaction Price (LTP) (NPR)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={priceForm.lastTransactionPrice}
                                    onChange={(e) => setPriceForm({ ...priceForm, lastTransactionPrice: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                                This will update prices for all {selectedScrip.totalQuantity} shares held by {selectedScrip.customerHoldings.length} customer(s).
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">
                                    Update Prices
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowPriceModal(false);
                                        setSelectedScrip(null);
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
