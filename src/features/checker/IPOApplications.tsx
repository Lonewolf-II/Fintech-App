import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPendingRequests, bulkActionRequest } from './checkerSlice';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';

export const IPOApplications: React.FC = () => {
    const dispatch = useAppDispatch();
    const { pendingData, isLoading } = useAppSelector((state) => state.checker);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        dispatch(fetchPendingRequests());
    }, [dispatch]);

    const ipoRequests = pendingData?.ipo || [];

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(ipoRequests.map(req => String(req.id)));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleBulkAction = async (action: 'approve' | 'reject') => {
        if (selectedIds.length === 0) return;

        setIsProcessing(true);
        try {
            await dispatch(bulkActionRequest({ ids: selectedIds, action, type: 'ipo' })).unwrap();
            toast.success(`Successfully ${action}d ${selectedIds.length} applications`);
            setSelectedIds([]);
        } catch (error: any) {
            toast.error(error.message || 'Failed to process bulk action');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading && !pendingData) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">IPO Applications Verification</h1>
                <Button onClick={() => dispatch(fetchPendingRequests())} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {selectedIds.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">{selectedIds.length} selected</span>
                    <div className="flex gap-2">
                        <Button
                            variant="primary"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleBulkAction('approve')}
                            disabled={isProcessing}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Selected
                        </Button>
                        <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleBulkAction('reject')}
                            disabled={isProcessing}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject Selected
                        </Button>
                    </div>
                </div>
            )}

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                        checked={ipoRequests.length > 0 && selectedIds.length === ipoRequests.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Applicant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Applied Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {ipoRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-slate-500">No pending IPO applications</td>
                                </tr>
                            ) : (
                                ipoRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                                checked={selectedIds.includes(String(req.id))}
                                                onChange={() => handleSelect(String(req.id))}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{req.customer?.fullName}</div>
                                            <div className="text-xs text-slate-500">ID: {req.customer?.customerId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{req.companyName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{req.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(Number(req.totalAmount))}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
