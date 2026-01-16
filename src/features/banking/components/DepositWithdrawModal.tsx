import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { useAppDispatch } from '../../../app/hooks';
import { createTransaction } from '../bankingSlice';
import type { Account } from '../../../types/business.types';
import { toast } from 'react-hot-toast';

const transactionSchema = z.object({
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    description: z.string().min(1, 'Description is required')
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface DepositWithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    account: Account;
    type: 'deposit' | 'withdrawal';
}

export const DepositWithdrawModal: React.FC<DepositWithdrawModalProps> = ({
    isOpen,
    onClose,
    account,
    type
}) => {
    const dispatch = useAppDispatch();
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TransactionForm>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            amount: 0,
            description: ''
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset({ amount: 0, description: '' });
        }
    }, [isOpen, reset]);

    const onSubmit = async (data: TransactionForm) => {
        try {
            await dispatch(createTransaction({
                accountId: account.id,
                transactionType: type,
                amount: data.amount,
                description: data.description
            })).unwrap();

            toast.success(`${type === 'deposit' ? 'Deposit' : 'Withdrawal'} successful`);
            onClose();
        } catch (error: any) {
            toast.error(error.message || `Failed to process ${type}`);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={type === 'deposit' ? 'Depost Funds' : 'Withdraw Funds'}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-md mb-4">
                    <p className="text-sm text-slate-500">Account: <span className="font-semibold text-slate-900">{account.accountNumber}</span></p>
                    <p className="text-sm text-slate-500">Current Balance: <span className="font-semibold text-slate-900">NPR {account.balance}</span></p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Amount (NPR)</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('amount', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="0.00"
                    />
                    {errors.amount && (
                        <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Description</label>
                    <input
                        type="text"
                        {...register('description')}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="e.g. Cash Deposit"
                    />
                    {errors.description && (
                        <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                    )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className={type === 'withdrawal' ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                        {isSubmitting ? 'Processing...' : type === 'deposit' ? 'Deposit' : 'Withdraw'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
