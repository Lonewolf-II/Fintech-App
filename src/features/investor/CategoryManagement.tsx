import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCategories, createCategory, fetchInvestors, assignAccounts } from './investorSlice';
import { fetchCustomers } from '../customers/customerSlice';
import { Button } from '../../components/common/Button';
import { Plus, Users, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export const CategoryManagement: React.FC = () => {
    const dispatch = useAppDispatch();
    const { categories, investors, isLoading } = useAppSelector((state) => state.investor);
    const { customers } = useAppSelector((state) => state.customers);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchInvestors());
        dispatch(fetchCustomers());
    }, [dispatch]);

    const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
            await dispatch(createCategory({
                categoryName: formData.get('categoryName') as string,
                investorId: parseInt(formData.get('investorId') as string) || undefined,
                description: formData.get('description') as string || undefined
            })).unwrap();

            toast.success('Category created successfully');
            setShowCreateModal(false);
            dispatch(fetchCategories());
        } catch (error: any) {
            toast.error(error.message || 'Failed to create category');
        }
    };

    const handleAssignAccounts = async () => {
        if (!selectedCategoryId || selectedAccounts.length === 0) {
            toast.error('Please select accounts to assign');
            return;
        }

        try {
            await dispatch(assignAccounts({
                categoryId: selectedCategoryId,
                accountIds: selectedAccounts
            })).unwrap();

            toast.success(`Assigned ${selectedAccounts.length} accounts to category`);
            setShowAssignModal(false);
            setSelectedCategoryId(null);
            setSelectedAccounts([]);
            dispatch(fetchCategories());
        } catch (error: any) {
            toast.error(error.message || 'Failed to assign accounts');
        }
    };

    const toggleAccountSelection = (accountId: string) => {
        const numericId = parseInt(accountId);
        setSelectedAccounts(prev =>
            prev.includes(numericId)
                ? prev.filter(id => id !== numericId)
                : [...prev, numericId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedAccounts.length > 0) {
            setSelectedAccounts([]);
        } else {
            const accountIds = customers
                .map(c => c.accounts?.[0]?.id)
                .filter((id): id is string => typeof id === 'string')
                .map(id => parseInt(id));
            setSelectedAccounts(accountIds);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Category Management</h1>
                    <p className="text-slate-500">Organize customer accounts into investor categories</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Category
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Categories</p>
                            <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
                        </div>
                        <FolderOpen className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Active Categories</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {categories.filter(c => c.status === 'active').length}
                            </p>
                        </div>
                        <FolderOpen className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Investors</p>
                            <p className="text-2xl font-bold text-slate-900">{investors.length}</p>
                        </div>
                        <Users className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-full text-center py-8 text-slate-500">Loading...</div>
                ) : categories.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-slate-500">
                        No categories yet. Create your first category to get started.
                    </div>
                ) : (
                    categories.map((category) => (
                        <div key={category.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-900">{category.categoryName}</h3>
                                    {category.description && (
                                        <p className="text-sm text-slate-500 mt-1">{category.description}</p>
                                    )}
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {category.status}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm">
                                    <span className="text-slate-500">Investor:</span>
                                    <span className="ml-2 font-medium text-slate-900">
                                        {category.investor?.name || 'Not assigned'}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <span className="text-slate-500">Accounts:</span>
                                    <span className="ml-2 font-medium text-slate-900">
                                        {(category as any).assignments?.length || 0}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedCategoryId(category.id);
                                    setShowAssignModal(true);
                                }}
                                className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                            >
                                Assign Accounts
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Create Category Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create New Category</h2>
                        <form onSubmit={handleCreateCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    name="categoryName"
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g., Everest, Nepal, Ganag"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Assign to Investor
                                </label>
                                <select
                                    name="investorId"
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">-- Select Investor --</option>
                                    {investors.map(investor => (
                                        <option key={investor.id} value={investor.id}>
                                            {investor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Optional description"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <Button type="submit">Create Category</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Accounts Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8">
                        <h2 className="text-xl font-bold mb-4">Assign Accounts to Category</h2>

                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-slate-600">
                                Selected: {selectedAccounts.length} accounts
                            </p>
                            <button
                                onClick={toggleSelectAll}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                {selectedAccounts.length === customers.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        <div className="max-h-96 overflow-y-auto border rounded-md">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedAccounts.length === customers.length && customers.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                            Customer
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                            Account Number
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                            Type
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {customers.map((customer) => {
                                        const primaryAccount = customer.accounts?.[0];
                                        if (!primaryAccount) return null;

                                        return (
                                            <tr key={customer.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAccounts.includes(parseInt(primaryAccount.id))}
                                                        onChange={() => toggleAccountSelection(primaryAccount.id)}
                                                        className="rounded"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-medium text-slate-900">{customer.fullName}</div>
                                                    <div className="text-xs text-slate-500">{customer.customerId}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-900">
                                                    {primaryAccount.accountNumber}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-500">
                                                    {primaryAccount.accountType}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAssignModal(false);
                                    setSelectedCategoryId(null);
                                    setSelectedAccounts([]);
                                }}
                                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
                            >
                                Cancel
                            </button>
                            <Button onClick={handleAssignAccounts}>
                                Assign {selectedAccounts.length} Accounts
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
