import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCustomers, deleteCustomer } from './customerSlice';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { CustomerForm } from './components/CustomerForm';
import { CustomerTable } from './components/CustomerTable';
import { BulkUploadModal } from './components/BulkUploadModal';
import { AccountStatementViewer } from '../../components/common/AccountStatementViewer';
import { UserPlus, Search, Upload } from 'lucide-react';
import type { Customer } from '../../types/business.types';
import { bankingApi } from '../../api/bankingApi';
import toast from 'react-hot-toast';

export const CustomerManagement: React.FC = () => {
    const dispatch = useAppDispatch();
    const { customers, isLoading } = useAppSelector((state) => state.customers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [kycFilter, setKycFilter] = useState<string>('all');

    // Statement viewer state
    const [showStatements, setShowStatements] = useState(false);
    const [statementAccount, setStatementAccount] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    useEffect(() => {
        dispatch(fetchCustomers());
    }, [dispatch]);

    const filteredCustomers = customers.filter((customer) => {
        const matchesSearch = customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.accounts?.some(acc => acc.accountNumber.includes(searchTerm));
        const matchesKyc = kycFilter === 'all' || customer.kycStatus === kycFilter;
        return matchesSearch && matchesKyc;
    });

    const handleCreate = () => {
        setSelectedCustomer(null);
        setIsModalOpen(true);
    };

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const handleDelete = async (customer: Customer) => {
        if (window.confirm(`Are you sure you want to delete ${customer.fullName}?`)) {
            await dispatch(deleteCustomer(customer.id));
        }
    };

    const handleFormSuccess = () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
    };

    const handleViewStatements = async (customer: Customer) => {
        const primaryAccount = customer.accounts?.find(acc => acc.isPrimary) || customer.accounts?.[0];

        if (!primaryAccount) {
            toast.error('No account found for this customer');
            return;
        }

        setStatementAccount(primaryAccount);
        setShowStatements(true);
        setLoadingTransactions(true);

        try {
            const response = await bankingApi.getAccountTransactions(primaryAccount.id);
            setTransactions(response || []);
        } catch (error: any) {
            toast.error('Failed to load transactions');
            setTransactions([]);
        } finally {
            setLoadingTransactions(false);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Customer Management</h1>
                    <p className="text-slate-600">Manage customer accounts and KYC verification</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsBulkModalOpen(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Bulk Upload
                    </Button>
                    <Button onClick={handleCreate}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Customer
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-slate-600">Total Customers</p>
                    <p className="text-2xl font-bold text-slate-900">{customers.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-slate-600">Verified</p>
                    <p className="text-2xl font-bold text-green-600">
                        {customers.filter(c => c.kycStatus === 'verified').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-slate-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {customers.filter(c => c.kycStatus === 'pending').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-slate-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">
                        {customers.filter(c => c.kycStatus === 'rejected').length}
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or account number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={kycFilter}
                        onChange={(e) => setKycFilter(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="all">All KYC Status</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Customer Table */}
            <div className="bg-white rounded-lg shadow">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <p className="text-slate-600">Loading customers...</p>
                    </div>
                ) : (
                    <CustomerTable
                        customers={filteredCustomers}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onViewStatements={handleViewStatements}
                    />
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedCustomer(null);
                }}
                title={selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
                size="lg"
            >
                <CustomerForm
                    customer={selectedCustomer}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            {/* Bulk Upload Modal */}
            <Modal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                title="Bulk Customer Upload"
            >
                <BulkUploadModal onClose={() => setIsBulkModalOpen(false)} />
            </Modal>

            {/* Account Statement Viewer */}
            {showStatements && statementAccount && (
                loadingTransactions ? (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-lg">
                            <p className="text-slate-600">Loading transactions...</p>
                        </div>
                    </div>
                ) : (
                    <AccountStatementViewer
                        account={statementAccount}
                        transactions={transactions}
                        onClose={() => {
                            setShowStatements(false);
                            setStatementAccount(null);
                            setTransactions([]);
                        }}
                    />
                )
            )}
        </div>
    );
};
