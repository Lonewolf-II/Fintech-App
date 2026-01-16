import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCustomer, updateIPOApplication, deleteIPOApplication } from './customerSlice';
import { IPOApplicationForm } from './components/IPOApplicationForm';
import { CustomerForm } from './components/CustomerForm';
import { DematFamilyForm } from './components/DematFamilyForm';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { User, Shield, Plus, Key, Lock, Edit, Trash2 } from 'lucide-react';
import { AddBankAccountModal } from './components/AddBankAccountModal';
import { AddCredentialModal } from './components/AddCredentialModal';

import { Button } from '../../components/common/Button';
import { EditAccountModal } from './components/EditAccountModal';
import { actionRequest } from '../checker/checkerSlice';
import { toast } from 'react-hot-toast';
import { fetchPortfolios } from '../portfolio/portfolioSlice';
import { PortfolioHoldingsTable } from './components/PortfolioHoldingsTable';

import { Modal } from '../../components/common/Modal';
import type { Account } from '../../types/business.types';

export const CustomerProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { selectedCustomer, isLoading, error } = useAppSelector((state) => state.customers);
    const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'portfolio' | 'credentials'>('overview');
    const [portfolioSubTab, setPortfolioSubTab] = useState<'holdings' | 'apply' | 'applications' | 'details'>('holdings');
    const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
    const [isAddCredentialModalOpen, setIsAddCredentialModalOpen] = useState(false);
    const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchCustomer(id));
            dispatch(fetchPortfolios());
        }
    }, [dispatch, id]);

    if (isLoading) return <div className="p-8 text-center text-slate-600">Loading profile...</div>;
    if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
    if (!selectedCustomer) return <div className="p-8 text-center text-slate-600">Customer not found</div>;

    const accounts = selectedCustomer.accounts || [];
    const ipoApplications = selectedCustomer.ipoApplications || [];
    const credentials = selectedCustomer.credentials || [];

    const handleEditSuccess = () => {
        setIsEditProfileModalOpen(false);
        dispatch(fetchCustomer(id!));
        toast.success('Profile updated successfully');
    };

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
                <div className="flex gap-2">
                    <div className={`px-4 py-1 rounded-full text-sm font-medium h-fit ${selectedCustomer.kycStatus === 'verified' ? 'bg-green-100 text-green-700' :
                        selectedCustomer.kycStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                        KYC: {selectedCustomer.kycStatus.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Checker Actions */}
            {user?.role === 'checker' && selectedCustomer.kycStatus === 'pending' && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-blue-900">Pending KYC Verification</h3>
                        <p className="text-sm text-blue-700">Review the customer details and documents before approving.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                                dispatch(actionRequest({ id: selectedCustomer.id, action: 'approve', type: 'kyc' }))
                                    .unwrap()
                                    .then(() => {
                                        toast.success('KYC Approved');
                                        dispatch(fetchCustomer(id!));
                                    })
                                    .catch((err) => toast.error(err));
                            }}
                        >
                            Approve KYC
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => {
                                dispatch(actionRequest({ id: selectedCustomer.id, action: 'reject', type: 'kyc' }))
                                    .unwrap()
                                    .then(() => {
                                        toast.success('KYC Rejected');
                                        dispatch(fetchCustomer(id!));
                                    })
                                    .catch((err) => toast.error(err));
                            }}
                        >
                            Reject KYC
                        </Button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-slate-200 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Overview
                </button>

                <button
                    onClick={() => setActiveTab('accounts')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'accounts' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Bank Accounts
                </button>
                <button
                    onClick={() => setActiveTab('portfolio')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'portfolio' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Portfolio & IPO
                </button>
                <button
                    onClick={() => setActiveTab('credentials')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'credentials' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Credentials
                </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Personal Details</h3>
                            <Button size="sm" variant="outline" onClick={() => setIsEditProfileModalOpen(true)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Details
                            </Button>
                        </div>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bank Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Balance</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Blocked</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{acc.bankName || '-'}</td>
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
                                        <td colSpan={7} className="px-6 py-4 text-center text-slate-500">No accounts found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'portfolio' && (
                    <div className="space-y-6">
                        {/* Child Tabs for Portfolio & IPO */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="flex border-b border-slate-200 overflow-x-auto px-4">
                                <button
                                    onClick={() => setPortfolioSubTab('holdings')}
                                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${portfolioSubTab === 'holdings'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Portfolio Holdings
                                </button>
                                <button
                                    onClick={() => setPortfolioSubTab('apply')}
                                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${portfolioSubTab === 'apply'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Apply for IPO
                                </button>
                                <button
                                    onClick={() => setPortfolioSubTab('applications')}
                                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${portfolioSubTab === 'applications'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    IPO Applications
                                </button>
                                <button
                                    onClick={() => setPortfolioSubTab('details')}
                                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${portfolioSubTab === 'details'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    My Details
                                </button>
                            </div>

                            {/* Portfolio Holdings Tab */}
                            {portfolioSubTab === 'holdings' && (
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-slate-900">Portfolio Holdings</h3>
                                        <Button size="sm" onClick={() => {
                                            toast.success("Feature coming soon");
                                        }}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Holding
                                        </Button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Symbol</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Company</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Qty</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Avg Price</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Current</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Value</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">P/L</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-slate-200">
                                                <PortfolioHoldingsTable
                                                    customerId={selectedCustomer.id}
                                                    pendingRequests={selectedCustomer.pendingRequests || []}
                                                />
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Apply for IPO Tab */}
                            {portfolioSubTab === 'apply' && (
                                <div className="p-6">
                                    <IPOApplicationForm
                                        customerId={selectedCustomer.id}
                                        accounts={accounts}
                                        onSuccess={() => dispatch(fetchCustomer(selectedCustomer.id))}
                                    />
                                </div>
                            )}

                            {/* IPO Applications Tab */}
                            {portfolioSubTab === 'applications' && (
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">IPO Applications</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Company</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Qty</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-slate-200">
                                                {ipoApplications.map((app) => {
                                                    const pendingRequest = selectedCustomer.pendingRequests?.find(
                                                        r => r.targetModel === 'IPOApplication' && r.targetId === String(app.id) && r.status === 'pending'
                                                    );
                                                    const isPending = !!pendingRequest;

                                                    return (
                                                        <tr key={app.id} className={isPending ? "bg-yellow-50" : ""}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                                {app.companyName}
                                                                {isPending && (
                                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                        {pendingRequest?.changeType === 'delete' ? 'Deletion Pending' : 'Update Pending'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{app.quantity}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(Number(app.totalAmount))}</td>
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
                                                                {formatDateTime(app.createdAt)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        disabled={isPending}
                                                                        onClick={() => {
                                                                            const newQty = prompt("Enter new quantity:", String(app.quantity));
                                                                            if (newQty && !isNaN(Number(newQty))) {
                                                                                dispatch(updateIPOApplication({
                                                                                    id: String(app.id),
                                                                                    data: { quantity: Number(newQty), totalAmount: Number(newQty) * Number(app.pricePerShare) }
                                                                                }))
                                                                                    .unwrap()
                                                                                    .then((res) => {
                                                                                        if (res.pending) toast.success("Modification Request Sent");
                                                                                        else toast.success("Updated Successfully");
                                                                                        dispatch(fetchCustomer(selectedCustomer.id));
                                                                                    })
                                                                                    .catch(err => toast.error(err));
                                                                            }
                                                                        }}
                                                                        className={`text-blue-600 hover:text-blue-900 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        disabled={isPending}
                                                                        onClick={() => {
                                                                            if (confirm("Are you sure you want to delete this application?")) {
                                                                                dispatch(deleteIPOApplication(String(app.id)))
                                                                                    .unwrap()
                                                                                    .then((res) => {
                                                                                        if (res.pending) toast.success("Deletion Request Sent");
                                                                                        else toast.success("Deleted Successfully");
                                                                                        dispatch(fetchCustomer(selectedCustomer.id));
                                                                                    })
                                                                                    .catch(err => toast.error(err));
                                                                            }
                                                                        }}
                                                                        className={`text-red-600 hover:text-red-900 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {ipoApplications.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-4 text-center text-slate-500">No applications yet</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* My Details Tab (Existing Demat & Family Details) */}
                            {portfolioSubTab === 'details' && (
                                <DematFamilyForm customer={selectedCustomer} />
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'credentials' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-slate-900">Login Credentials</h3>
                            <Button size="sm" onClick={() => setIsAddCredentialModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Credential
                            </Button>
                        </div>
                        <div className="p-4">
                            {credentials.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {credentials.map((cred) => (
                                        <div key={cred.id} className="border rounded-lg p-4 bg-slate-50 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Key className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 capitalize">{cred.platform.replace('_', ' ')}</h4>
                                                    <p className="text-xs text-slate-500">Updated: {formatDateTime(cred.updatedAt || new Date().toISOString())}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-sm">
                                                    <span className="text-slate-500 block text-xs">Login ID</span>
                                                    <span className="font-mono bg-white px-2 py-1 rounded border block mt-1">{cred.loginId}</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-slate-500 block text-xs">Password</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="font-mono bg-white px-2 py-1 rounded border block flex-1">{cred.password}</span>
                                                        <Lock className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <Key className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                                    No credentials added yet
                                </div>
                            )}
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

            {/* Add Credential Modal */}
            {selectedCustomer && (
                <AddCredentialModal
                    isOpen={isAddCredentialModalOpen}
                    onClose={() => setIsAddCredentialModalOpen(false)}
                    customerId={selectedCustomer.id}
                />
            )}

            {/* Edit Profile Modal */}
            {selectedCustomer && (
                <Modal
                    isOpen={isEditProfileModalOpen}
                    onClose={() => setIsEditProfileModalOpen(false)}
                    title="Edit Customer Profile"
                    size="lg"
                >
                    <CustomerForm
                        customer={selectedCustomer}
                        onSuccess={handleEditSuccess}
                        onCancel={() => setIsEditProfileModalOpen(false)}
                    />
                </Modal>
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

                        <div className="flex justify-end pt-4 border-t">
                            <Button
                                onClick={() => {
                                    // Close details, open edit (selectedAccount remains set)
                                    setIsEditAccountModalOpen(true);
                                }}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Account
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit Account Modal */}
            {selectedAccount && (
                <EditAccountModal
                    isOpen={isEditAccountModalOpen}
                    onClose={() => {
                        setIsEditAccountModalOpen(false);
                    }}
                    account={selectedAccount}
                />
            )}
        </div>
    );
};

