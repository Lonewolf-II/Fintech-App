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
        },
    });

    useEffect(() => {
        if (customer) {
            reset({
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone,
                address: customer.address || '',
                dateOfBirth: customer.dateOfBirth || '',
                accountType: customer.accountType || 'individual',
                kycStatus: customer.kycStatus || 'pending',
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
                    // You might want to set a form error here if you have a general error field
                }
            }
        } catch (error) {
            console.error('Failed to save customer:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
