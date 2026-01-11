import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { useAppDispatch } from '../../../app/hooks';
import { updateAccount } from '../../banking/bankingSlice';
import type { Account } from '../../../types/business.types';

interface EditAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    account: Account;
}

export const EditAccountModal: React.FC<EditAccountModalProps> = ({ isOpen, onClose, account }) => {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState({
        accountName: '',
        accountType: '',
        status: '',
        bankName: '',
        branch: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [infoMessage, setInfoMessage] = useState('');

    useEffect(() => {
        if (account) {
            setFormData({
                accountName: account.accountName || '',
                accountType: account.accountType,
                status: account.status,
                bankName: account.bankName || '',
                branch: account.branch || ''
            });
        }
    }, [account]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setInfoMessage('');
        setIsSubmitting(true);

        try {
            const resultAction = await dispatch(updateAccount({
                id: account.id,
                updates: formData as Partial<Account>
            }));

            if (updateAccount.fulfilled.match(resultAction)) {
                const payload = resultAction.payload as any;
                if (payload.pending) {
                    setInfoMessage('Request submitted for approval (Maker-Checker).');
                    setTimeout(() => {
                        onClose();
                    }, 2000);
                } else {
                    onClose();
                }
            } else {
                setError('Failed to update account');
            }
        } catch (err: any) {
            setError(err || 'Failed to update account');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Account">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
                        {error}
                    </div>
                )}
                {infoMessage && (
                    <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-md">
                        {infoMessage}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                    <input
                        type="text"
                        value={account.accountNumber}
                        disabled
                        className="w-full px-3 py-2 border rounded-md bg-slate-100 text-slate-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
                    <input
                        type="text"
                        value={formData.accountName}
                        onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
                        <input
                            type="text"
                            value={formData.bankName}
                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                        <input
                            type="text"
                            value={formData.branch}
                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Account Type</label>
                        <select
                            value={formData.accountType}
                            onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="savings">Savings</option>
                            <option value="current">Current</option>
                            <option value="fixed_deposit">Fixed Deposit</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="active">Active</option>
                            <option value="frozen">Frozen</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};
