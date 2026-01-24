import React, { useEffect, useState } from 'react';
import { bankApi, type BankConfig } from '../../api/bankApi';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Plus, Building2, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const BankManagement: React.FC = () => {
    const [banks, setBanks] = useState<BankConfig[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBank, setSelectedBank] = useState<BankConfig | null>(null);
    const [formData, setFormData] = useState({
        bankName: '',
        chargesCasba: false,
        casbaAmount: '5.00',
        isActive: true
    });
    const [isLoading, setIsLoading] = useState(false);

    const fetchBanks = async () => {
        try {
            const data = await bankApi.getAll();
            setBanks(data);
        } catch (error) {
            console.error('Failed to fetch banks:', error);
        }
    };

    useEffect(() => {
        fetchBanks();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = {
                ...formData,
                casbaAmount: parseFloat(formData.casbaAmount)
            };

            if (selectedBank) {
                await bankApi.update(selectedBank.id, data);
            } else {
                await bankApi.create(data);
            }
            fetchBanks();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Failed to save bank:', error);
            alert('Failed to save bank configuration');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this bank?')) {
            try {
                await bankApi.delete(id);
                fetchBanks();
            } catch (error) {
                console.error('Failed to delete bank:', error);
            }
        }
    };

    const handleEdit = (bank: BankConfig) => {
        setSelectedBank(bank);
        setFormData({
            bankName: bank.bankName,
            chargesCasba: bank.chargesCasba,
            casbaAmount: bank.casbaAmount.toString(),
            isActive: bank.isActive
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setSelectedBank(null);
        setFormData({
            bankName: '',
            chargesCasba: false,
            casbaAmount: '5.00',
            isActive: true
        });
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Bank Management</h1>
                    <p className="text-slate-500">Configure banks and CASBA charges</p>
                </div>
                <Button onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Bank
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bank Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CASBA Active</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CASBA Charge</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {banks.map((bank) => (
                            <tr key={bank.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                            <Building2 className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="text-sm font-medium text-slate-900">{bank.bankName}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${bank.chargesCasba ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                        {bank.chargesCasba ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-900 font-semibold">
                                    {bank.chargesCasba ? formatCurrency(bank.casbaAmount) : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${bank.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                        {bank.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button onClick={() => handleEdit(bank)} className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(bank.id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {banks.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No banks configured. Add one to get started.
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedBank ? "Edit Bank Configuration" : "Add New Bank"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
                        <input
                            type="text"
                            value={formData.bankName}
                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={formData.chargesCasba}
                            onChange={(e) => setFormData({ ...formData, chargesCasba: e.target.checked })}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            id="chargesCasba"
                        />
                        <label htmlFor="chargesCasba" className="text-sm font-medium text-slate-700">Charges CASBA Fee</label>
                    </div>

                    {formData.chargesCasba && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">CASBA Amount (NPR)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.casbaAmount}
                                onChange={(e) => setFormData({ ...formData, casbaAmount: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            id="isActive"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active Status</label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            {selectedBank ? 'Update Bank' : 'Add Bank'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
