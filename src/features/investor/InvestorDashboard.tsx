import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchInvestors, createInvestor, addCapital, setSelectedInvestor, assignAccount } from './investorSlice';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Plus, DollarSign, UserPlus, Link, Wallet } from 'lucide-react';
import type { Investor } from '../../types/business.types';

export const InvestorDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { investors, isLoading } = useAppSelector((state) => state.investor);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

    // Forms state
    const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', totalCapital: '' });
    const [capitalForm, setCapitalForm] = useState({ amount: '' });
    const [linkForm, setLinkForm] = useState({ customerId: '', accountId: '' });

    useEffect(() => {
        dispatch(fetchInvestors());
    }, [dispatch]);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await dispatch(createInvestor({
            ...createForm,
            totalCapital: Number(createForm.totalCapital)
        })).unwrap();
        setIsCreateModalOpen(false);
        setCreateForm({ name: '', email: '', phone: '', totalCapital: '' });
    };

    const handleCapitalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (investors.find(i => i.id === Number(createForm.name))) { // Hacky check logic, fixing below
        }
        // Actually we need the selected investor ID. 
        // Let's use local state for selected investor for modals
    };

    // Selecting investor for actions
    const [activeInvestor, setActiveInvestor] = useState<Investor | null>(null);

    const openCapitalModal = (investor: Investor) => {
        setActiveInvestor(investor);
        setCapitalForm({ amount: '' });
        setIsCapitalModalOpen(true);
    };

    const submitCapital = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeInvestor) return;
        await dispatch(addCapital({ id: activeInvestor.id, amount: Number(capitalForm.amount) })).unwrap();
        setIsCapitalModalOpen(false);
    };

    const openLinkModal = (investor: Investor) => {
        setActiveInvestor(investor);
        setLinkForm({ customerId: '', accountId: '' });
        setIsLinkModalOpen(true);
    };

    const submitLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeInvestor) return;
        await dispatch(assignAccount({
            investorId: activeInvestor.id,
            data: {
                customerId: Number(linkForm.customerId),
                accountId: Number(linkForm.accountId)
            }
        })).unwrap();
        setIsLinkModalOpen(false);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Investor Management</h1>
                    <p className="text-slate-600">Manage internal investors and capital</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    New Investor
                </Button>
            </div>

            {/* Investors List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Investor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Total Capital</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Invested</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Available</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Profit</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {investors.map((investor) => (
                            <tr key={investor.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900">{investor.name}</div>
                                    <div className="text-xs text-slate-500">{investor.investorId}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-900">{investor.email}</div>
                                    <div className="text-xs text-slate-500">{investor.phone}</div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                    NPR {investor.totalCapital.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    NPR {investor.investedAmount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-green-600 font-medium">
                                    NPR {investor.availableCapital.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-blue-600 font-medium">
                                    NPR {investor.totalProfit.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => openCapitalModal(investor)} title="Add Capital">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => openLinkModal(investor)} title="Link Account">
                                        <Link className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {investors.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                    No investors found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Investor Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Investor"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                        <input
                            type="text"
                            value={createForm.name}
                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={createForm.email}
                                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={createForm.phone}
                                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Initial Capital (NPR)</label>
                        <input
                            type="number"
                            value={createForm.totalCapital}
                            onChange={(e) => setCreateForm({ ...createForm, totalCapital: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            required
                            min="0"
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Investor</Button>
                    </div>
                </form>
            </Modal>

            {/* Add Capital Modal */}
            <Modal
                isOpen={isCapitalModalOpen}
                onClose={() => setIsCapitalModalOpen(false)}
                title={`Add Capital - ${activeInvestor?.name}`}
            >
                <form onSubmit={submitCapital} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount (NPR)</label>
                        <input
                            type="number"
                            value={capitalForm.amount}
                            onChange={(e) => setCapitalForm({ amount: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            required
                            min="1"
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsCapitalModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Add Capital</Button>
                    </div>
                </form>
            </Modal>

            {/* Link Account Modal */}
            <Modal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                title={`Link Customer Account - ${activeInvestor?.name}`}
            >
                <form onSubmit={submitLink} className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-4">
                        Linking a customer account allows this investor to fund IPO applications for that customer.
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Customer ID</label>
                        <input
                            type="number"
                            value={linkForm.customerId}
                            onChange={(e) => setLinkForm({ ...linkForm, customerId: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            placeholder="Enter Customer ID"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Account ID</label>
                        <input
                            type="number"
                            value={linkForm.accountId}
                            onChange={(e) => setLinkForm({ ...linkForm, accountId: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            placeholder="Enter Account ID"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsLinkModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Link Account</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
