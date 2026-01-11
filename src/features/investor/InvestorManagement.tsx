import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchInvestors, createInvestor, addCapital } from './investorSlice';
import { Button } from '../../components/common/Button';
import { Plus, DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const InvestorManagement: React.FC = () => {
    const dispatch = useAppDispatch();
    const { investors, isLoading } = useAppSelector((state) => state.investor);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddCapitalModal, setShowAddCapitalModal] = useState(false);
    const [selectedInvestorId, setSelectedInvestorId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchInvestors());
    }, [dispatch]);

    const handleCreateInvestor = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
            await dispatch(createInvestor({
                name: formData.get('name') as string,
                email: formData.get('email') as string || undefined,
                phone: formData.get('phone') as string || undefined,
                totalCapital: parseFloat(formData.get('totalCapital') as string) || 0
            })).unwrap();

            toast.success('Investor created successfully');
            setShowCreateModal(false);
            dispatch(fetchInvestors());
        } catch (error: any) {
            toast.error(error.message || 'Failed to create investor');
        }
    };

    const handleAddCapital = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const amount = parseFloat(formData.get('amount') as string);

        if (!selectedInvestorId || !amount) return;

        try {
            await dispatch(addCapital({ id: selectedInvestorId, amount })).unwrap();
            toast.success('Capital added successfully');
            setShowAddCapitalModal(false);
            setSelectedInvestorId(null);
            dispatch(fetchInvestors());
        } catch (error: any) {
            toast.error(error.message || 'Failed to add capital');
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Investor Management</h1>
                    <p className="text-slate-500">Manage investor partners and their capital</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Investor
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Investors</p>
                            <p className="text-2xl font-bold text-slate-900">{investors.length}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Capital</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {formatCurrency(investors.reduce((sum, inv) => sum + parseFloat(inv.totalCapital.toString()), 0))}
                            </p>
                        </div>
                        <Wallet className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Invested Amount</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {formatCurrency(investors.reduce((sum, inv) => sum + parseFloat(inv.investedAmount.toString()), 0))}
                            </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Available Capital</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {formatCurrency(investors.reduce((sum, inv) => sum + parseFloat(inv.availableCapital.toString()), 0))}
                            </p>
                        </div>
                        <Wallet className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Investors Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Investor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Total Capital
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Invested
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Available
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Profit
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
                        ) : investors.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-slate-500">
                                    No investors yet. Create your first investor to get started.
                                </td>
                            </tr>
                        ) : (
                            investors.map((investor) => (
                                <tr key={investor.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">{investor.name}</div>
                                            <div className="text-xs text-slate-500">{investor.investorId}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">{investor.email || '-'}</div>
                                        <div className="text-xs text-slate-500">{investor.phone || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {formatCurrency(investor.totalCapital)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                                        {formatCurrency(investor.investedAmount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                        {formatCurrency(investor.availableCapital)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                        {formatCurrency(investor.totalProfit)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${investor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {investor.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                setSelectedInvestorId(investor.id);
                                                setShowAddCapitalModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Add Capital
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Investor Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create New Investor</h2>
                        <form onSubmit={handleCreateInvestor} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Investor name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="investor@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="9841000000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Initial Capital
                                </label>
                                <input
                                    type="number"
                                    name="totalCapital"
                                    step="0.01"
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <Button type="submit">Create Investor</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Capital Modal */}
            {showAddCapitalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add Capital</h2>
                        <form onSubmit={handleAddCapital} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Amount *
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    required
                                    step="0.01"
                                    min="0.01"
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter amount to add"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddCapitalModal(false);
                                        setSelectedInvestorId(null);
                                    }}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <Button type="submit">Add Capital</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
