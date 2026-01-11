import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCustomer } from './customerSlice';
import { IPOApplicationForm } from './components/IPOApplicationForm';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { User, Shield, Plus } from 'lucide-react';
import { AddBankAccountModal } from './components/AddBankAccountModal';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import type { Account } from '../../types/business.types';

export const CustomerProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const { selectedCustomer, isLoading, error } = useAppSelector((state) => state.customers);
    const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'portfolio'>('overview');
    const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchCustomer(id));
        }
    }, [dispatch, id]);

    if (isLoading) return <div className="p-8 text-center text-slate-600">Loading profile...</div>;
    if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
    if (!selectedCustomer) return <div className="p-8 text-center text-slate-600">Customer not found</div>;

    const accounts = selectedCustomer.accounts || [];
    const ipoApplications = selectedCustomer.ipoApplications || [];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="bg-primary-100 p-3 rounded-full">
                        <User className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{selectedCustomer.fullName}</h1>
                        <p className="text-slate-500">ID: {selectedCustomer.customerId}</p>
                    </div>
                </div>
                <div className={`px-4 py-1 rounded-full text-sm font-medium ${selectedCustomer.kycStatus === 'verified' ? 'bg-green-100 text-green-700' :
                    selectedCustomer.kycStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                    KYC: {selectedCustomer.kycStatus.toUpperCase()}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('accounts')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'accounts' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Bank Accounts
                </button>
                <button
                    onClick={() => setActiveTab('portfolio')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'portfolio' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Portfolio & IPO
                </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-slate-500">Email</label>
                                <p className="text-slate-900 font-medium">{selectedCustomer.email}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Phone</label>
                                <p className="text-slate-900 font-medium">{selectedCustomer.phone}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Address</label>
                                <p className="text-slate-900 font-medium">{selectedCustomer.address || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Date of Birth</label>
                                <p className="text-slate-900 font-medium">{selectedCustomer.dateOfBirth || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Account Type</label>
                                <p className="text-slate-900 font-medium capitalize">{selectedCustomer.accountType || 'Individual'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Joined Date</label>
                                <p className="text-slate-900 font-medium">
                                    {selectedCustomer.createdAt ? formatDateTime(selectedCustomer.createdAt) : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'accounts' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-4 flex justify-end">
                            <Button size="sm" onClick={() => setIsAddAccountModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Bank Account
                            </Button>
                        </div>
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Balance</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Blocked Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Primary</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {accounts.map((acc) => (
                                    <tr
                                        key={acc.id}
                                        className="hover:bg-slate-50 cursor-pointer"
                                        onClick={() => setSelectedAccount(acc)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{acc.accountNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{acc.accountType.replace('_', ' ')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold">{formatCurrency(acc.balance)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{formatCurrency(acc.blockedAmount || 0)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${acc.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {acc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {acc.isPrimary && <Shield className="w-4 h-4 text-blue-500" />}
                                        </td>
                                    </tr>
                                ))}
                                {accounts.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-slate-500">No accounts found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'portfolio' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <IPOApplicationForm
                                customerId={selectedCustomer.id}
                                accounts={accounts}
                                onSuccess={() => dispatch(fetchCustomer(selectedCustomer.id))}
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-200">
                                    <h3 className="text-lg font-semibold text-slate-900">Application History</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Company</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Qty</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {ipoApplications.map((app) => (
                                                <tr key={app.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{app.companyName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{app.quantity}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(app.totalAmount)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${app.status === 'verified' ? 'bg-green-100 text-green-800' :
                                                            app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                app.status === 'allotted' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                        {formatDateTime(app.appliedAt)}
                                                    </td>
                                                </tr>
                                            ))}
                                            {ipoApplications.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-4 text-center text-slate-500">No applications yet</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Add Bank Account Modal */}
            {selectedCustomer && (
                <AddBankAccountModal
                    isOpen={isAddAccountModalOpen}
                    onClose={() => setIsAddAccountModalOpen(false)}
                    customerId={selectedCustomer.id}
                />
            )}

            {/* Account Details Modal */}
            {selectedAccount && (
                <Modal
                    isOpen={!!selectedAccount}
                    onClose={() => setSelectedAccount(null)}
                    title="Account Details"
                    size="md"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-slate-500">Account Name</label>
                                <p className="font-medium text-slate-900">{selectedAccount.accountName || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Account Number</label>
                                <p className="font-medium text-slate-900">{selectedAccount.accountNumber}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Bank Name</label>
                                <p className="font-medium text-slate-900">{selectedAccount.bankName || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Branch</label>
                                <p className="font-medium text-slate-900">{selectedAccount.branch || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Type</label>
                                <p className="font-medium text-slate-900 capitalize">{selectedAccount.accountType.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Balance</label>
                                <p className="font-bold text-slate-900">{formatCurrency(selectedAccount.balance)}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Status</label>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedAccount.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {selectedAccount.status}
                                </span>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Opening Date</label>
                                <p className="font-medium text-slate-900">{selectedAccount.openingDate || '-'}</p>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

