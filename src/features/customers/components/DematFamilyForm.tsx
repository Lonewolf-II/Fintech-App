import React from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../../app/hooks';
import { updateCustomer, fetchCustomer } from '../customerSlice';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import type { Customer } from '../../../types/business.types';
import toast from 'react-hot-toast';

interface DematFamilyFormProps {
    customer: Customer;
}

interface FormData {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    fatherName: string;
    grandfatherName: string;
    motherName: string;
    spouseName: string;
    boid: string;
    dematOpenDate: string;
    dematExpiryDate: string;
}

export const DematFamilyForm: React.FC<DematFamilyFormProps> = ({ customer }) => {
    const dispatch = useAppDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<FormData>({
        defaultValues: {
            fullName: customer.fullName || '',
            email: customer.email || '',
            phone: customer.phone || '',
            dateOfBirth: customer.dateOfBirth || '',
            fatherName: customer.fatherName || '',
            grandfatherName: customer.grandfatherName || '',
            motherName: customer.motherName || '',
            spouseName: customer.spouseName || '',
            boid: customer.boid || '',
            dematOpenDate: customer.dematOpenDate || '',
            dematExpiryDate: customer.dematExpiryDate || ''
        }
    });

    const onSubmit = async (data: FormData) => {
        try {
            // Filter out empty strings to send undefined/null? Or allow empty strings? 
            // API likely accepts strings.
            await dispatch(updateCustomer({ id: customer.id, data })).unwrap();
            toast.success('Details updated successfully');
            dispatch(fetchCustomer(customer.id));
        } catch (error: any) {
            toast.error(error || 'Failed to update details');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Demat & Family Details</h3>

            {/* Basic Info (Editable here as requested) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                    label="Full Name"
                    {...register('fullName')}
                    error={errors.fullName?.message}
                />
                <Input
                    label="Email"
                    {...register('email')}
                    error={errors.email?.message}
                />
                <Input
                    label="Contact Number"
                    {...register('phone')}
                    error={errors.phone?.message}
                />
                <Input
                    label="Date of Birth"
                    type="date"
                    {...register('dateOfBirth')}
                    error={errors.dateOfBirth?.message}
                />
                <Input
                    label="BOID"
                    {...register('boid')}
                    placeholder="16 digit BOID"
                    error={errors.boid?.message}
                />
            </div>

            <h4 className="font-medium text-slate-700 mt-4">Family Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                    label="Father's Name"
                    {...register('fatherName')}
                    error={errors.fatherName?.message}
                />
                <Input
                    label="Grandfather's Name"
                    {...register('grandfatherName')}
                    error={errors.grandfatherName?.message}
                />
                <Input
                    label="Mother's Name"
                    {...register('motherName')}
                    error={errors.motherName?.message}
                />
                <Input
                    label="Spouse Name (If Married)"
                    {...register('spouseName')}
                    error={errors.spouseName?.message}
                />
            </div>

            <h4 className="font-medium text-slate-700 mt-4">Demat Account Dates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Demat Open Date"
                    type="date"
                    {...register('dematOpenDate')}
                    error={errors.dematOpenDate?.message}
                />
                <Input
                    label="Demat Expiry Date"
                    type="date"
                    {...register('dematExpiryDate')}
                    error={errors.dematExpiryDate?.message}
                />
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={isSubmitting}>
                    Save Details
                </Button>
            </div>
        </form>
    );
};
