import React from 'react';
import { Edit2, Trash2, Lock } from 'lucide-react';
import { Avatar } from '../../../components/common/Avatar';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import type { User } from '../../../types/auth.types';
import { format } from 'date-fns';

interface UserTableProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    onResetPassword: (user: User) => void;
}

const getRoleBadgeVariant = (role: string) => {
    switch (role) {
        case 'admin':
            return 'error' as const;
        case 'maker':
            return 'info' as const;
        case 'checker':
            return 'warning' as const;
        case 'investor':
            return 'success' as const;
        default:
            return 'default' as const;
    }
};

export const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete, onResetPassword }) => {
    if (users.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 text-lg">No users found</p>
                <p className="text-slate-400 text-sm mt-2">
                    Create your first user to get started
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            User
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Staff ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Email
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Phone
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Role
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Created
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr
                            key={user.id}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                            <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                    <Avatar name={user.name} src={user.avatar} size="sm" />
                                    <span className="font-medium text-slate-900">
                                        {user.name}
                                    </span>
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <span className="font-mono text-sm text-slate-700">
                                    {user.staffId}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{user.email}</td>
                            <td className="py-3 px-4 text-slate-600">
                                {user.phone || '-'}
                            </td>
                            <td className="py-3 px-4">
                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                    {user.role}
                                </Badge>
                            </td>
                            <td className="py-3 px-4">
                                <Badge
                                    variant={
                                        user.status === 'active' ? 'success' : 'default'
                                    }
                                >
                                    {user.status || 'active'}
                                </Badge>
                            </td>
                            <td className="py-3 px-4 text-slate-600 text-sm">
                                {user.createdAt
                                    ? format(new Date(user.createdAt), 'MMM dd, yyyy')
                                    : '-'}
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center justify-end space-x-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        title="Reset Password"
                                        onClick={() => onResetPassword(user)}
                                    >
                                        <Lock className="w-4 h-4 text-slate-500" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onEdit(user)}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onDelete(user)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
