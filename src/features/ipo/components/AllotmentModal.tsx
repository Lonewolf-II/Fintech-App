import React, { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { allotApplication } from '../ipoSlice';
import { Button } from '../../../components/common/Button';
import type { IPOApplication } from '../../../types/business.types';

interface AllotmentModalProps {
    application: IPOApplication;
    onSuccess: () => void;
    onCancel: () => void;
}

export const AllotmentModal: React.FC<AllotmentModalProps> = ({ application, onSuccess, onCancel }) => {
    const dispatch = useAppDispatch();
    const [allotmentQuantity, setAllotmentQuantity] = useState<string>(application.quantity.toString());
    const [status, setStatus] = useState<'allotted' | 'not_allotted'>('allotted');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const qty = parseInt(allotmentQuantity);
        if (status === 'allotted' && (qty <= 0 || qty > application.quantity)) {
            setError(`Invalid quantity. Must be between 1 and ${application.quantity}`);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await dispatch(allotApplication({
                id: application.id,
                data: {
                    allotmentQuantity: status === 'allotted' ? qty : 0,
                    allotmentStatus: status
                }
            })).unwrap();
            onSuccess();
        } catch (err: any) {
            setError(err || 'Failed to allot application');
        } finally {
            setIsLoading(false);
        }
    };

    const refundAmount = status === 'not_allotted'
        ? application.totalAmount
        : (application.quantity - parseInt(allotmentQuantity || '0')) * application.pricePerShare;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                    {error}
                </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Company:</span>
                    <span className="font-medium text-slate-900">{application.companyName}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Customer:</span>
                    <span className="font-medium text-slate-900">{application.customerId}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Applied Qty:</span>
                    <span className="font-medium text-slate-900">{application.quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Blocked:</span>
                    <span className="font-medium text-slate-900">NPR {Number(application.totalAmount).toLocaleString()}</span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <div className="flex gap-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="status"
                            checked={status === 'allotted'}
                            onChange={() => setStatus('allotted')}
                            className="mr-2"
                        />
                        Allotted
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="status"
                            checked={status === 'not_allotted'}
                            onChange={() => setStatus('not_allotted')}
                            className="mr-2"
                        />
                        Not Allotted
                    </label>
                </div>
            </div>

            {status === 'allotted' && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Allotment Quantity</label>
                    <input
                        type="number"
                        value={allotmentQuantity}
                        onChange={(e) => setAllotmentQuantity(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        min="0"
                        max={application.quantity}
                        required
                    />
                </div>
            )}

            <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
                <div className="flex justify-between">
                    <span>Refund Amount:</span>
                    <span className="font-bold">NPR {Number(refundAmount).toLocaleString()}</span>
                </div>
                <p className="text-xs mt-1 opacity-75">
                    This amount will be unblocked from the customer's account.
                </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    Confirm Processing
                </Button>
            </div>
        </form>
    );
};
