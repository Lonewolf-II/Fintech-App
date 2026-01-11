import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';
import type { User, UserRole } from '../../../types/auth.types';

const userSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    staffId: z.number(),
    phone: z.string().optional(),
    role: z.enum(['admin', 'maker', 'checker', 'investor'], {
        message: 'Please select a role',
    }),
    status: z.enum(['active', 'inactive']).optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
    user?: User | null;
    onSubmit: (data: UserFormData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'maker', label: 'Maker' },
    { value: 'checker', label: 'Checker' },
    { value: 'investor', label: 'Investor' },
];

const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

export const UserForm: React.FC<UserFormProps> = ({
    user,
    onSubmit,
    onCancel,
    isLoading = false,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            staffId: user?.staffId || 0,
            phone: user?.phone || '',
            role: user?.role || ('' as UserRole),
            status: user?.status || 'active',
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                email: user.email,
                staffId: user.staffId,
                phone: user.phone || '',
                role: user.role,
                status: user.status || 'active',
            });
        }
    }, [user, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="Full Name"
                {...register('name')}
                error={errors.name?.message}
                placeholder="Enter full name"
                required
            />

            <Input
                label="Email Address"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                placeholder="user@example.com"
                required
            />

            <Input
                label="Staff ID"
                type="number"
                {...register('staffId', { valueAsNumber: true })}
                error={errors.staffId?.message}
                placeholder="100"
                helperText="Numeric staff identification number"
                required
            />

            <Input
                label="Phone Number"
                type="tel"
                {...register('phone')}
                error={errors.phone?.message}
                placeholder="+977-9841234567"
            />

            <Select
                label="Role"
                {...register('role')}
                error={errors.role?.message}
                options={roleOptions}
                placeholder="Select a role"
                required
            />

            <Select
                label="Status"
                {...register('status')}
                error={errors.status?.message}
                options={statusOptions}
            />

            <div className="flex justify-end space-x-3 pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    {user ? 'Update User' : 'Create User'}
                </Button>
            </div>
        </form>
    );
};
