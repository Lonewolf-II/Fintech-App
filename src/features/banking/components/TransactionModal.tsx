import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { useAppDispatch } from '../../../app/hooks';
import { createTransaction, fetchTransactions, fetchAccounts } from '../bankingSlice';
import type { Account } from '../../../types/business.types';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    account: Account;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, account }) => {
    const dispatch = useAppDispatch();
    const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (type === 'withdrawal' && parseFloat(amount) > parseFloat(account.balance.toString())) {
            setError('Insufficient balance');
            return;
        }

        setIsSubmitting(true);

        try {
            await dispatch(createTransaction({
                accountId: account.id,
                transactionType: type,
                amount: parseFloat(amount),
                description
            })).unwrap();

            // Refresh data
            dispatch(fetchAccounts()); // to update balance in list
            dispatch(fetchTransactions({ accountId: account.id }));

            onClose();
            setAmount('');
            setDescription('');
            setType('deposit');
        } catch (err: any) {
            setError(err || 'Failed to process transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`New Transaction - ${account.accountNumber}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                className="mr-2"
                                checked={type === 'deposit'}
                                onChange={() => setType('deposit')}
                            />
                            Deposit
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                className="mr-2"
                                checked={type === 'withdrawal'}
                                onChange={() => setType('withdrawal')}
                            />
                            Withdrawal
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500">NPR</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                            required
                        />
                    </div>
                    {type === 'withdrawal' && (
                        <p className="text-xs text-slate-500 mt-1">
                            Available: {account.balance}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                        rows={3}
                        placeholder="Enter transaction details..."
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        {type === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
