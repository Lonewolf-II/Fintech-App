import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchFees, payFee, waiveFee, bulkCreateAnnualFees, fetchFeeStats } from './feeSlice';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { CheckCircle, XCircle, Calendar } from 'lucide-react';

export const FeeManagement: React.FC = () => {
    const dispatch = useAppDispatch();
    const { fees, stats, isLoading } = useAppSelector((state) => state.fees);
    const [filterStatus, setFilterStatus] = useState('pending');
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkForm, setBulkForm] = useState({ amount: '500', dueDate: '' });

    useEffect(() => {
        dispatch(fetchFees({ status: filterStatus }));
        dispatch(fetchFeeStats());
    }, [dispatch, filterStatus]);

    const handlePay = async (id: number) => {
        if (window.confirm('Mark this fee as paid?')) {
            await dispatch(payFee(id));
        }
    };

    const handleWaive = async (id: number) => {
        if (window.confirm('Are you sure you want to waive this fee?')) {
            await dispatch(waiveFee(id));
        }
    };

    const handleBulkCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await dispatch(bulkCreateAnnualFees({
            amount: Number(bulkForm.amount),
            dueDate: bulkForm.dueDate
        }));
        setIsBulkModalOpen(false);
        dispatch(fetchFees({ status: filterStatus }));
        dispatch(fetchFeeStats());
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Fee Management</h1>
                    <p className="text-slate-600">Track and manage customer fees</p>
                </div>
                <Button onClick={() => setIsBulkModalOpen(true)}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Generate Annual Fees
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500">Collected</p>
                    <h3 className="text-2xl font-bold text-green-600">NPR {stats?.collected?.toLocaleString() || 0}</h3>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500">Pending</p>
                    <h3 className="text-2xl font-bold text-orange-600">NPR {stats?.pending?.toLocaleString() || 0}</h3>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500">Waived</p>
                    <h3 className="text-2xl font-bold text-slate-600">NPR {stats?.waived?.toLocaleString() || 0}</h3>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4">
                {['pending', 'paid', 'waived', 'all'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filterStatus === status
                            ? 'bg-primary-500 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Fees Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Loading fees...</div>
                ) : fees.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No {filterStatus} fees found.</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-3 text-left">Customer ID</th>
                                <th className="px-6 py-3 text-left">Type</th>
                                <th className="px-6 py-3 text-left">Due Date</th>
                                <th className="px-6 py-3 text-left">Amount</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-sm">
                            {fees.map((fee) => (
                                <tr key={fee.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-slate-900">{fee.customerId}</td>
                                    <td className="px-6 py-4 text-slate-600 capitalize">{fee.feeType.replace('_', ' ')}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-900 font-medium">NPR {fee.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                                            ${fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                fee.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-slate-100 text-slate-800'}`}>
                                            {fee.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {fee.status === 'pending' && (
                                            <>
                                                <Button size="sm" onClick={() => handlePay(fee.id)} title="Mark as Paid">
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleWaive(fee.id)} title="Waive">
                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Bulk Create Modal */}
            <Modal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                title="Generate Annual Fees"
            >
                <form onSubmit={handleBulkCreate} className="space-y-4">
                    <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg mb-4">
                        This will generate an annual fee record for ALL active customers.
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fee Amount (NPR)</label>
                        <input
                            type="number"
                            value={bulkForm.amount}
                            onChange={(e) => setBulkForm({ ...bulkForm, amount: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                        <input
                            type="date"
                            value={bulkForm.dueDate}
                            onChange={(e) => setBulkForm({ ...bulkForm, dueDate: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsBulkModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Generate Fees</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
