import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPortfolios, fetchHoldings, updateMarketPrice, sellShares } from './portfolioSlice';
import { formatCurrency } from '../../utils/formatters';
import { FileText, Download, Filter, RefreshCw } from 'lucide-react';
import type { Portfolio, Holding } from '../../types/business.types';
import { Modal } from '../../components/common/Modal';
import { toast } from 'react-hot-toast';
import { Card, ActionButton, PageHeader } from '../../components/ui';

export const PortfolioDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { portfolios, holdings, isLoading } = useAppSelector((state) => state.portfolio);
    const { user } = useAppSelector((state) => state.auth);
    const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

    // Modals state
    const [isUpdatePriceOpen, setIsUpdatePriceOpen] = useState(false);
    const [isSellOpen, setIsSellOpen] = useState(false);
    const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);

    // Form inputs
    const [priceUpdateSymbol, setPriceUpdateSymbol] = useState('');
    const [priceUpdateValue, setPriceUpdateValue] = useState('');
    const [sellQuantity, setSellQuantity] = useState('');
    const [sellPrice, setSellPrice] = useState('');

    useEffect(() => {
        dispatch(fetchPortfolios());
    }, [dispatch]);

    useEffect(() => {
        if (selectedPortfolio) {
            dispatch(fetchHoldings(selectedPortfolio.id));
        } else if (portfolios.length > 0) {
            setSelectedPortfolio(portfolios[0]);
        }
    }, [selectedPortfolio, portfolios, dispatch]);

    const handleUpdatePrice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!priceUpdateSymbol || !priceUpdateValue) return;

        try {
            await dispatch(updateMarketPrice({
                stockSymbol: priceUpdateSymbol,
                currentPrice: parseFloat(priceUpdateValue)
            })).unwrap();
            toast.success('Market price updated successfully');
            setIsUpdatePriceOpen(false);
            setPriceUpdateSymbol('');
            setPriceUpdateValue('');
            dispatch(fetchPortfolios());
            if (selectedPortfolio) dispatch(fetchHoldings(selectedPortfolio.id));
        } catch (error: any) {
            toast.error(error || 'Failed to update price');
        }
    };

    const handleSellShares = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHolding || !sellQuantity || !sellPrice) return;

        try {
            const result = await dispatch(sellShares({
                id: selectedHolding.id,
                data: {
                    quantity: parseInt(sellQuantity),
                    salePrice: parseFloat(sellPrice)
                }
            })).unwrap();

            toast.success(`Sold successfully! Profit: ${formatCurrency(result.profit)}`);
            setIsSellOpen(false);
            setSelectedHolding(null);
            setSellQuantity('');
            setSellPrice('');
            dispatch(fetchPortfolios());
            if (selectedPortfolio) dispatch(fetchHoldings(selectedPortfolio.id));
        } catch (error: any) {
            toast.error(error || 'Failed to sell shares');
        }
    };

    const openSellModal = (holding: Holding) => {
        setSelectedHolding(holding);
        setSellPrice(holding.currentPrice.toString());
        setSellQuantity(holding.quantity.toString());
        setIsSellOpen(true);
    };

    const isAdmin = user?.role === 'admin';

    // Calculate totals
    const totalCurrentBalance = holdings.reduce((sum, h) => sum + h.quantity, 0);
    const totalValueAtLCP = holdings.reduce((sum, h) => sum + (h.quantity * parseFloat(h.currentPrice.toString())), 0);
    const totalValueAtLTP = holdings.reduce((sum, h) => sum + (h.quantity * parseFloat(h.currentPrice.toString())), 0);

    const handleExportPDF = () => {
        toast('PDF export feature coming soon');
    };

    const handleExportCSV = () => {
        toast('CSV export feature coming soon');
    };

    const handleExportExcel = () => {
        toast('Excel export feature coming soon');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <PageHeader
                    title="My Portfolio"
                    actions={
                        <div className="flex items-center gap-2">
                            <ActionButton
                                variant="outline"
                                size="sm"
                                onClick={handleExportPDF}
                                icon={<FileText className="w-4 h-4" />}
                            >
                                PDF
                            </ActionButton>
                            <ActionButton
                                variant="outline"
                                size="sm"
                                onClick={handleExportCSV}
                                icon={<Download className="w-4 h-4" />}
                            >
                                CSV
                            </ActionButton>
                            <ActionButton
                                variant="outline"
                                size="sm"
                                onClick={handleExportExcel}
                                icon={<Download className="w-4 h-4" />}
                            >
                                Excel
                            </ActionButton>
                            <ActionButton
                                variant="outline"
                                size="sm"
                                icon={<Filter className="w-4 h-4" />}
                            >
                                Filter
                            </ActionButton>
                            {isAdmin && (
                                <ActionButton
                                    size="sm"
                                    onClick={() => setIsUpdatePriceOpen(true)}
                                    icon={<RefreshCw className="w-4 h-4" />}
                                >
                                    Update Price
                                </ActionButton>
                            )}
                        </div>
                    }
                />

                {/* Portfolio Table */}
                <Card padding="none">
                    {isLoading ? (
                        <div className="text-center py-12 text-gray-500">Loading portfolio...</div>
                    ) : holdings.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No holdings found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Scrip
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Current Balance
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Closing Price
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Value At Last Closing Price
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Transaction Price(LTP)
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Value As Of LTP
                                        </th>
                                        {isAdmin && (
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {holdings.map((holding) => {
                                        const valueAtLCP = holding.quantity * parseFloat(holding.currentPrice.toString());
                                        const valueAtLTP = holding.quantity * parseFloat(holding.currentPrice.toString());

                                        return (
                                            <tr key={holding.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {holding.stockSymbol}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    {holding.quantity.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    {formatCurrency(parseFloat(holding.currentPrice.toString()))}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                                    {formatCurrency(valueAtLCP)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    {formatCurrency(parseFloat(holding.currentPrice.toString()))}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                                    {formatCurrency(valueAtLTP)}
                                                </td>
                                                {isAdmin && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <ActionButton
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openSellModal(holding)}
                                                        >
                                                            Sell
                                                        </ActionButton>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                    {/* Totals Row */}
                                    <tr className="bg-gray-50 font-semibold">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            Total
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            {totalCurrentBalance.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            -
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            {formatCurrency(totalValueAtLCP)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            -
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            {formatCurrency(totalValueAtLTP)}
                                        </td>
                                        {isAdmin && <td></td>}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* Pagination */}
                <div className="mt-4 flex justify-center">
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-900 text-white text-sm font-medium">
                            1
                        </button>
                    </div>
                </div>
            </div>

            {/* Update Price Modal */}
            <Modal
                isOpen={isUpdatePriceOpen}
                onClose={() => setIsUpdatePriceOpen(false)}
                title="Update Market Price"
            >
                <form onSubmit={handleUpdatePrice} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Symbol
                        </label>
                        <input
                            type="text"
                            value={priceUpdateSymbol}
                            onChange={e => setPriceUpdateSymbol(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Price
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={priceUpdateValue}
                            onChange={e => setPriceUpdateValue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <ActionButton variant="outline" onClick={() => setIsUpdatePriceOpen(false)}>
                            Cancel
                        </ActionButton>
                        <ActionButton type="submit">
                            Update Price
                        </ActionButton>
                    </div>
                </form>
            </Modal>

            {/* Sell Shares Modal */}
            <Modal
                isOpen={isSellOpen}
                onClose={() => setIsSellOpen(false)}
                title="Sell Shares"
            >
                <form onSubmit={handleSellShares} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock: {selectedHolding?.stockSymbol}
                        </label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity (Available: {selectedHolding?.quantity})
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={selectedHolding?.quantity}
                            value={sellQuantity}
                            onChange={e => setSellQuantity(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sale Price per Share
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={sellPrice}
                            onChange={e => setSellPrice(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <ActionButton variant="outline" onClick={() => setIsSellOpen(false)}>
                            Cancel
                        </ActionButton>
                        <ActionButton type="submit">
                            Sell Shares
                        </ActionButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
