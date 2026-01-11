import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '../../../app/hooks';
import { createCustomer, updateCustomer } from '../customerSlice';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';
import type { Customer } from '../../../types/business.types';

const customerSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number is required'),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
    accountType: z.enum(['individual', 'corporate']).optional(),
    kycStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
    // Bank Account Details (Required for new customers)
    accountNumber: z.string().min(1, 'Account Number is required'),
    accountName: z.string().min(1, 'Account Name is required'),
    bankName: z.string().min(1, 'Bank Name is required'),
    branch: z.string().min(1, 'Branch is required'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
    customer?: Customer | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const accountTypeOptions = [
    { value: 'individual', label: 'Individual' },
    { value: 'corporate', label: 'Corporate' },
];

const kycStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' },
];

export const CustomerForm: React.FC<CustomerFormProps> = ({
    customer,
    onSuccess,
    onCancel,
}) => {
    const dispatch = useAppDispatch();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            fullName: customer?.fullName || '',
            email: customer?.email || '',
            phone: customer?.phone || '',
            address: customer?.address || '',
            dateOfBirth: customer?.dateOfBirth || '',
            accountType: customer?.accountType || 'individual',
            kycStatus: customer?.kycStatus || 'pending',
            // Default empty for new, or perhaps pre-fill if editing not supported here
            accountNumber: '',
            accountName: '',
            bankName: '',
            branch: '',
        },
    });

    useEffect(() => {
        if (customer) {
            // Note: We are NOT pre-filling bank details here because this form 
            // is primarily for Customer details. Editing account happens elsewhere.
            // But we must provide dummy values to satisfy schema validation if we submit an update.
            // OR we make schema dynamic. For now, let's assume this form is mainly for creation
            // or we make fields optional for update using .partial() in a refine or separate schema.
            // Simpler approach: If customer exists, we might hide these fields or make them optional.
            // For this iteration, let's focus on Creation as requested.

            reset({
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone,
                address: customer.address || '',
                dateOfBirth: customer.dateOfBirth || '',
                accountType: customer.accountType || 'individual',
                kycStatus: customer.kycStatus || 'pending',
                accountNumber: 'N/A', // Placeholder for validation
                accountName: 'N/A',
                bankName: 'N/A',
                branch: 'N/A',
            });
        }
    }, [customer, reset]);

    const onSubmit = async (data: CustomerFormData) => {
        try {
            const customerData = {
                ...data,
                kycStatus: data.kycStatus || 'pending' as const,
                accountType: data.accountType || 'individual' as const,
            };

            // Remove placeholder bank details if updating
            if (customer) {
                delete (customerData as any).accountNumber;
                delete (customerData as any).accountName;
                delete (customerData as any).bankName;
                delete (customerData as any).branch;
            }

            let resultAction;
            if (customer) {
                resultAction = await dispatch(updateCustomer({ id: customer.id, data: customerData }));
            } else {
                resultAction = await dispatch(createCustomer(customerData));
            }

            if (createCustomer.fulfilled.match(resultAction) || updateCustomer.fulfilled.match(resultAction)) {
                onSuccess();
                reset();
            } else {
                if (resultAction.payload) {
                    console.error('Action failed:', resultAction.payload);
                }
            }
        } catch (error) {
            console.error('Failed to save customer:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h3 className="text-lg font-medium text-slate-800 border-b pb-2 mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Full Name"
                    {...register('fullName')}
                    error={errors.fullName?.message}
                    placeholder="Enter full name"
                    required
                />

                <Input
                    label="Email Address"
                    type="email"
                    {...register('email')}
                    error={errors.email?.message}
                    placeholder="customer@example.com"
                    required
                />

                <Input
                    label="Phone Number"
                    type="tel"
                    {...register('phone')}
                    error={errors.phone?.message}
                    placeholder="+977-9841234567"
                    required
                />

                <Input
                    label="Date of Birth"
                    type="date"
                    {...register('dateOfBirth')}
                    error={errors.dateOfBirth?.message}
                />

                <Select
                    label="Account Type"
                    {...register('accountType')}
                    error={errors.accountType?.message}
                    options={accountTypeOptions}
                />

                <Select
                    label="KYC Status"
                    {...register('kycStatus')}
                    error={errors.kycStatus?.message}
                    options={kycStatusOptions}
                />
            </div>

            <Input
                label="Address"
                {...register('address')}
                error={errors.address?.message}
                placeholder="Enter full address"
            />

            {!customer && (
                <>
                    <h3 className="text-lg font-medium text-slate-800 border-b pb-2 mt-6 mb-4">Bank Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Account Number"
                            {...register('accountNumber')}
                            error={errors.accountNumber?.message}
                            placeholder="Enter account number"
                            required
                        />
                        <Input
                            label="Account Name"
                            {...register('accountName')}
                            error={errors.accountName?.message}
                            placeholder="Account holder name"
                            required
                        />
                        <Input
                            label="Bank Name"
                            {...register('bankName')}
                            error={errors.bankName?.message}
                            placeholder="Enter bank name"
                            required
                        />
                        <Input
                            label="Branch"
                            {...register('branch')}
                            error={errors.branch?.message}
                            placeholder="Enter branch"
                            required
                        />
                    </div>
                </>
            )}

            <Input
                label="Address"
                {...register('address')}
                error={errors.address?.message}
                placeholder="Enter full address"
            />

            <div className="flex justify-end space-x-3 pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                    {customer ? 'Update Customer' : 'Create Customer'}
                </Button>
            </div>
        </form>
    );
};
