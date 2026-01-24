import React, { useEffect, useState } from 'react';
import { bankConfigApi, type BankConfiguration } from '../../api/bankConfigApi';
import { Button } from '../../components/common/Button';
import { Building2, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const BankConfigurationPage: React.FC = () => {
    const [banks, setBanks] = useState<BankConfiguration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBank, setEditingBank] = useState<BankConfiguration | null>(null);
    const [formData, setFormData] = useState({
        bankName: '',
        chargesCasba: false,
        casbaAmount: 5.00,
        isActive: true
    });

    useEffect(() => {
        loadBanks();
    }, []);

    const loadBanks = async () => {
        try {
            setIsLoading(true);
            const data = await bankConfigApi.getAllBanks();
            setBanks(data);
        } catch (error) {
            console.error('Failed to load banks:', error);
            toast.error('Failed to load bank configurations');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBank) {
                await bankConfigApi.updateBank(editingBank.id, formData);
                toast.success('Bank configuration updated');
            } else {
                await bankConfigApi.createBank(formData);
                toast.success('Bank configuration created');
            }
            setShowModal(false);
            setEditingBank(null);
            resetForm();
            loadBanks();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save bank configuration');
        }
    };

    const handleEdit = (bank: BankConfiguration) => {
        setEditingBank(bank);
        setFormData({
            bankName: bank.bankName,
            chargesCasba: bank.chargesCasba,
            casbaAmount: bank.casbaAmount,
            isActive: bank.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this bank configuration?')) return;

        try {
            await bankConfigApi.deleteBank(id);
            toast.success('Bank configuration deleted');
            loadBanks();
        } catch (error) {
            toast.error('Failed to delete bank configuration');
        }
    };

    const resetForm = () => {
        setFormData({
            bankName: '',
            chargesCasba: false,
            casbaAmount: 5.00,
            isActive: true
        });
    };

    const handleAddNew = () => {
        setEditingBank(null);
        resetForm();
        setShowModal(true);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Bank Configuration</h1>
                    <p className="text-slate-500">Manage CASBA charge settings for banks</p>
                </div>
                <Button onClick={handleAddNew} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Bank
                </Button>
            </div>

            {/* Banks Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <p className="text-slate-600">Loading banks...</p>
                    </div>
                ) : banks.length === 0 ? (
                    <div className="p-8 text-center">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600">No bank configurations found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Bank Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">CASBA Charge</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {banks.map((bank) => (
                                <tr key={bank.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{bank.bankName}</td>
                                    <td className="px-6 py-4">
                                        {bank.chargesCasba ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                                <CheckCircle className="w-3 h-3" />
                                                Yes
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                <XCircle className="w-3 h-3" />
                                                No
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        NPR {Number(bank.casbaAmount || 0).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {bank.isActive ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(bank)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(bank.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingBank ? 'Edit Bank Configuration' : 'Add Bank Configuration'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Bank Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    required
                                    disabled={!!editingBank}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="chargesCasba"
                                    checked={formData.chargesCasba}
                                    onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        setFormData({
                                            ...formData,
                                            chargesCasba: isChecked,
                                            casbaAmount: isChecked ? (formData.casbaAmount === 0 ? 5.00 : formData.casbaAmount) : 0
                                        });
                                    }}
                                    className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                                />
                                <label htmlFor="chargesCasba" className="text-sm font-medium text-slate-700">
                                    Charges CASBA Fee
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    CASBA Amount (NPR)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.casbaAmount}
                                    onChange={(e) => {
                                        const amount = parseFloat(e.target.value) || 0;
                                        setFormData({
                                            ...formData,
                                            casbaAmount: amount,
                                            chargesCasba: amount > 0
                                        });
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                                    Active
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">
                                    {editingBank ? 'Update' : 'Create'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingBank(null);
                                        resetForm();
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
