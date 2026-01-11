import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { useAppDispatch } from '../../../app/hooks';
import { resetUserPassword } from '../userSlice';

const resetPasswordSchema = z
    .object({
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
    isOpen,
    onClose,
    userId,
    userName,
}) => {
    const dispatch = useAppDispatch();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        try {
            await dispatch(resetUserPassword({ userId, password: data.password })).unwrap();
            setSuccessMessage('Password reset successfully!');
            reset();
            setTimeout(() => {
                setSuccessMessage(null);
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Failed to reset password:', error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Reset Password for ${userName}`}
        >
            {successMessage ? (
                <div className="text-center py-4">
                    <p className="text-green-600 font-medium">{successMessage}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="New Password"
                        type="password"
                        {...register('password')}
                        error={errors.password?.message}
                        placeholder="Enter new password"
                        required
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        {...register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                        placeholder="Confirm new password"
                        required
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            Reset Password
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};
