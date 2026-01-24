import React, { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { updateIPOApplication } from '../customerSlice';
import { Modal } from '../../../components/common/Modal';
import { ActionButton } from '../../../components/ui/ActionButton';
import { formatCurrency } from '../../../utils/formatters';
import { toast } from 'react-hot-toast';

interface EditIPOApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: {
        id: number;
        companyName: string;
        quantity: number;
        pricePerShare: number;
        totalAmount: number;
        accountId?: number; // Add accountId to application interface
    };
    customerId: string;
    accounts: any[]; // Add accounts prop
    onSuccess: () => void;
}

export const EditIPOApplicationModal: React.FC<EditIPOApplicationModalProps> = ({
    isOpen,
    onClose,
    application,
    customerId,
    accounts,
    onSuccess
}) => {
    const dispatch = useAppDispatch();
    const [quantity, setQuantity] = useState(application.quantity.toString());
    const [accountId, setAccountId] = useState(application.accountId?.toString() || '');
    const [submitting, setSubmitting] = useState(false);

    // Initialize accountId from application if valid, otherwise default to primary or first
    React.useEffect(() => {
        if (application.accountId) {
            setAccountId(application.accountId.toString());
        } else if (accounts.length > 0) {
            const primary = accounts.find(a => a.isPrimary);
            setAccountId(primary ? primary.id.toString() : accounts[0].id.toString());
        }
    }, [application, accounts]);

    const pricePerShare = Number(application.pricePerShare);
    const totalAmount = (parseInt(quantity) || 0) * pricePerShare;
    const selectedAccount = accounts.find(a => a.id.toString() === accountId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const newQty = parseInt(quantity);
            if (isNaN(newQty) || newQty <= 0) {
                toast.error("Invalid quantity");
                setSubmitting(false);
                return;
            }

            const result = await dispatch(updateIPOApplication({
                id: String(application.id),
                data: {
                    quantity: newQty,
                    totalAmount: newQty * pricePerShare,
                    accountId: parseInt(accountId) // Include accountId in update
                }
            })).unwrap();

            if (result.pending) {
                toast.success("Modification Request Sent");
            } else {
                toast.success("Updated Successfully");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to update application");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Application: ${application.companyName}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                        type="number"
                        min="10"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Account Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deduct from Account
                    </label>
                    <select
                        value={accountId}
                        onChange={e => setAccountId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                                {acc.bankName} - {acc.accountNumber} ({formatCurrency(acc.balance)}) {acc.isPrimary ? '(Primary)' : ''}
                            </option>
                        ))}
                    </select>
                    {selectedAccount && (
                        <div className="mt-1 text-xs text-blue-600">
                            Available Balance: <strong>{formatCurrency(selectedAccount.balance)}</strong>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Price per Share:</span>
                        <span className="font-medium">{formatCurrency(pricePerShare)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-gray-900 border-t border-gray-200 pt-2 mt-2">
                        <span>Total Amount:</span>
                        <span>{formatCurrency(totalAmount)}</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <ActionButton variant="outline" onClick={onClose} disabled={submitting}>
                        Cancel
                    </ActionButton>
                    <ActionButton type="submit" disabled={submitting}>
                        {submitting ? 'Updating...' : 'Update Application'}
                    </ActionButton>
                </div>
            </form>
        </Modal>
    );
};
