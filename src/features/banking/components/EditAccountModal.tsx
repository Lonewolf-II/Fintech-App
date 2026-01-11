import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { useAppDispatch } from '../../../app/hooks';
import { updateAccount } from '../bankingSlice';
import type { Account } from '../../../types/business.types';
import { toast } from 'react-hot-toast';

const editAccountSchema = z.object({
    accountName: z.string().min(1, 'Account name is required'),
    status: z.enum(['active', 'frozen', 'closed'])
});

type EditAccountForm = z.infer<typeof editAccountSchema>;

interface EditAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    account: Account;
}

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
    isOpen,
    onClose,
    account
}) => {
    const dispatch = useAppDispatch();
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<EditAccountForm>({
        resolver: zodResolver(editAccountSchema),
        defaultValues: {
            accountName: account.accountName || '',
            status: account.status as any
        }
    });

    useEffect(() => {
        if (isOpen && account) {
            reset({
                accountName: account.accountName || '',
                status: account.status as any
            });
        }
    }, [isOpen, account, reset]);

    const onSubmit = async (data: EditAccountForm) => {
        try {
            await dispatch(updateAccount({ id: account.id, updates: data })).unwrap();
            toast.success('Account update requested');
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update account');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Account"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Account Name</label>
                    <input
                        type="text"
                        {...register('accountName')}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                    {errors.accountName && (
                        <p className="text-sm text-red-600 mt-1">{errors.accountName.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Status</label>
                    <select
                        {...register('status')}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                        <option value="active">Active</option>
                        <option value="frozen">Frozen</option>
                        <option value="closed">Closed</option>
                    </select>
                    {errors.status && (
                        <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">Status changes may require approval.</p>
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
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
