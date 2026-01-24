import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAccounts } from './bankingSlice';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { EditAccountModal } from './components/EditAccountModal';
import { DepositWithdrawModal } from './components/DepositWithdrawModal';
import { DollarSign, TrendingUp, TrendingDown, Edit2, FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Account } from '../../types/business.types';
import { useNavigate } from 'react-router-dom';

export const BankingDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const { accounts, isLoading } = useAppSelector((state) => state.banking);
    const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        dispatch(fetchAccounts());
    }, [dispatch]);

    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance.toString()), 0);

    // Filter and Pagination
    const filteredAccounts = accounts.filter(acc =>
        acc.accountNumber?.includes(searchTerm) ||
        acc.accountName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const paginatedAccounts = filteredAccounts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const [depositWithdrawModal, setDepositWithdrawModal] = useState<{
        isOpen: boolean;
        account: Account | null;
        type: 'deposit' | 'withdrawal';
    }>({
        isOpen: false,
        account: null,
        type: 'deposit'
    });

    const openDepositWithdraw = (account: Account, type: 'deposit' | 'withdrawal') => {
        setDepositWithdrawModal({
            isOpen: true,
            account,
            type
        });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Banking Dashboard</h1>
                    <p className="text-slate-600">Manage accounts and view statements</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Liquidity</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">
                                {formatCurrency(totalBalance)}
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Active Accounts</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{accounts.filter(a => a.status === 'active').length}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Accounts</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">
                                {accounts.length}
                            </p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <TrendingDown className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Accounts Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-semibold text-slate-900">Bank Accounts</h2>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search accounts..."
                            className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-primary-500"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bank Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account Name</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {isLoading && accounts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading accounts...</td>
                                </tr>
                            ) : paginatedAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No accounts found</td>
                                </tr>
                            ) : (
                                paginatedAccounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm font-medium text-slate-900">
                                                {account.accountNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 capitalize">
                                            {account.accountType.replace('_', ' ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {account.bankName || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {account.accountName || 'Unnamed'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-900">
                                            {formatCurrency(parseFloat(account.balance.toString()))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${account.status === 'active' ? 'bg-green-100 text-green-800' :
                                                account.status === 'frozen' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {account.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => openDepositWithdraw(account, 'deposit')}
                                                    title="Deposit"
                                                >
                                                    <TrendingUp className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => openDepositWithdraw(account, 'withdrawal')}
                                                    title="Withdraw"
                                                >
                                                    <TrendingDown className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => navigate(`/${user?.role}/banking/statement/${account.id}`)}
                                                    title="View Statement"
                                                >
                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setAccountToEdit(account)}
                                                    title="Edit Account"
                                                >
                                                    <Edit2 className="w-4 h-4 text-slate-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAccounts.length)}</span> of <span className="font-medium">{filteredAccounts.length}</span> results
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {accountToEdit && (
                <EditAccountModal
                    isOpen={!!accountToEdit}
                    onClose={() => setAccountToEdit(null)}
                    account={accountToEdit}
                />
            )}

            {depositWithdrawModal.isOpen && depositWithdrawModal.account && (
                <DepositWithdrawModal
                    isOpen={depositWithdrawModal.isOpen}
                    onClose={() => setDepositWithdrawModal({ ...depositWithdrawModal, isOpen: false })}
                    account={depositWithdrawModal.account}
                    type={depositWithdrawModal.type}
                />
            )}
        </div>
    );
};
