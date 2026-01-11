import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { User } from '../../../types/auth.types';

interface DeleteUserModalProps {
    isOpen: boolean;
    user: User | null;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
    isOpen,
    user,
    onConfirm,
    onCancel,
    isLoading = false,
}) => {
    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onCancel} size="sm">
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Delete User
                </h3>
                <p className="text-slate-600 mb-4">
                    Are you sure you want to delete{' '}
                    <span className="font-semibold">{user.name}</span>? This action
                    cannot be undone.
                </p>
                <div className="bg-slate-50 rounded-lg p-3 mb-6 text-left">
                    <p className="text-sm text-slate-600">
                        <span className="font-medium">Email:</span> {user.email}
                    </p>
                    <p className="text-sm text-slate-600">
                        <span className="font-medium">Role:</span> {user.role}
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className="flex-1"
                    >
                        Delete User
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
