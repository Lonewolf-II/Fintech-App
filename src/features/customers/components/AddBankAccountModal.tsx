import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { useAppDispatch } from '../../../app/hooks';
import { addBankAccount } from '../customerSlice';
import { bankConfigApi, type BankConfiguration } from '../../../api/bankConfigApi';

const bankAccountSchema = z.object({
    accountNumber: z.string().min(1, 'Account number is required'),
    accountName: z.string().min(1, 'Account name is required'),
    bankName: z.string().min(1, 'Bank name is required'),
    branch: z.string().min(1, 'Branch is required'),
    accountType: z.enum(['savings', 'current', 'fixed_deposit']),
    status: z.enum(['active', 'frozen', 'closed']),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface AddBankAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: string;
}

export const AddBankAccountModal: React.FC<AddBankAccountModalProps> = ({ isOpen, onClose, customerId }) => {
    const dispatch = useAppDispatch();
    const [banks, setBanks] = useState<BankConfiguration[]>([]);
    const [isLoadingBanks, setIsLoadingBanks] = useState(true);

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<BankAccountFormData>({
        resolver: zodResolver(bankAccountSchema),
        defaultValues: {
            accountType: 'savings',
            status: 'active',
        },
    });

    useEffect(() => {
        if (isOpen) {
            loadBanks();
        }
    }, [isOpen]);

    const loadBanks = async () => {
        try {
            setIsLoadingBanks(true);
            const data = await bankConfigApi.getAllBanks();
            // Filter only active banks
            setBanks(data.filter(b => b.isActive));
        } catch (error) {
            console.error('Failed to load banks:', error);
        } finally {
            setIsLoadingBanks(false);
        }
    };

    const onSubmit = async (data: BankAccountFormData) => {
        try {
            await dispatch(addBankAccount({
                customerId,
                ...data,
            })).unwrap();
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to add bank account:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Bank Account" size="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Account Name"
                    {...register('accountName')}
                    error={errors.accountName?.message}
                />

                <Input
                    label="Account Number"
                    {...register('accountNumber')}
                    error={errors.accountNumber?.message}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Bank Name"
                        {...register('bankName')}
                        error={errors.bankName?.message}
                        options={[
                            { value: '', label: 'Select a bank...' },
                            ...banks.map(bank => ({
                                value: bank.bankName,
                                label: bank.bankName
                            }))
                        ]}
                        disabled={isLoadingBanks}
                    />

                    <Input
                        label="Branch"
                        {...register('branch')}
                        error={errors.branch?.message}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Account Type"
                        {...register('accountType')}
                        error={errors.accountType?.message}
                        options={[
                            { value: 'savings', label: 'Savings' },
                            { value: 'current', label: 'Current' },
                            { value: 'fixed_deposit', label: 'Fixed Deposit' },
                        ]}
                    />

                    <Select
                        label="Status"
                        {...register('status')}
                        error={errors.status?.message}
                        options={[
                            { value: 'active', label: 'Active' },
                            { value: 'frozen', label: 'Frozen' },
                            { value: 'closed', label: 'Closed' },
                        ]}
                    />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        Add Account
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
