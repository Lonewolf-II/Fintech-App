import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    setUsers,
    addUser,
    updateUserLocal as updateUserAction,
    removeUser,
    setSelectedUser,
} from './userSlice';
import {
    getAllMockUsers,
    createMockUser,
    updateMockUser,
    deleteMockUser,
} from '../../services/mockData';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { UserTable } from './components/UserTable';
import { UserForm } from './components/UserForm';
import { DeleteUserModal } from './components/DeleteUserModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import type { User } from '../../types/auth.types';

export const UserManagement: React.FC = () => {
    const dispatch = useAppDispatch();
    const { users, selectedUser } = useAppSelector((state) => state.userManagement);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToReset, setUserToReset] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Load users on mount
    useEffect(() => {
        const loadedUsers = getAllMockUsers();
        dispatch(setUsers(loadedUsers));
    }, [dispatch]);

    // Filtered users
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesStatus = !statusFilter || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const handleCreateUser = () => {
        dispatch(setSelectedUser(null));
        setIsFormOpen(true);
    };

    const handleEditUser = (user: User) => {
        dispatch(setSelectedUser(user));
        setIsFormOpen(true);
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleResetPasswordClick = (user: User) => {
        setUserToReset(user);
        setIsResetModalOpen(true);
    };

    const handleFormSubmit = (data: any) => {
        if (selectedUser) {
            // Update existing user
            const updatedUser = updateMockUser(selectedUser.id, data);
            dispatch(updateUserAction(updatedUser));
        } else {
            // Create new user
            const newUser = createMockUser(data);
            dispatch(addUser(newUser));
        }
        setIsFormOpen(false);
        dispatch(setSelectedUser(null));
    };

    const handleDeleteConfirm = () => {
        if (userToDelete) {
            deleteMockUser(userToDelete.id);
            dispatch(removeUser(userToDelete.id));
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        dispatch(setSelectedUser(null));
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                    <p className="text-slate-600">Manage system users and their roles</p>
                </div>
                <Button onClick={handleCreateUser}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create User
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select
                            placeholder="All Roles"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            options={[
                                { value: '', label: 'All Roles' },
                                { value: 'admin', label: 'Admin' },
                                { value: 'maker', label: 'Maker' },
                                { value: 'checker', label: 'Checker' },
                                { value: 'investor', label: 'Investor' },
                            ]}
                        />
                        <Select
                            placeholder="All Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={[
                                { value: '', label: 'All Status' },
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                            ]}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* User Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Users ({filteredUsers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <UserTable
                        users={filteredUsers}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteClick}
                        onResetPassword={handleResetPasswordClick}
                    />
                </CardContent>
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={handleFormCancel}
                title={selectedUser ? 'Edit User' : 'Create New User'}
                size="md"
            >
                <UserForm
                    user={selectedUser}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteUserModal
                isOpen={isDeleteModalOpen}
                user={userToDelete}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />

            {/* Reset Password Modal */}
            {userToReset && (
                <ResetPasswordModal
                    isOpen={isResetModalOpen}
                    onClose={() => {
                        setIsResetModalOpen(false);
                        setUserToReset(null);
                    }}
                    userId={userToReset.id}
                    userName={userToReset.name}
                />
            )}
        </div>
    );
};
