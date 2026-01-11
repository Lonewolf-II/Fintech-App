import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAccounts, fetchTransactions } from './bankingSlice';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { TransactionModal } from './components/TransactionModal';
import { DollarSign, TrendingUp, TrendingDown, Plus, Filter, Calendar } from 'lucide-react';
import type { Account } from '../../types/business.types';

export const BankingDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { accounts, transactions, isLoading } = useAppSelector((state) => state.banking);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [showTransactionModal, setShowTransactionModal] = useState(false);

    // Filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        dispatch(fetchAccounts());
    }, [dispatch]);

    useEffect(() => {
        if (selectedAccount) {
            dispatch(fetchTransactions({
                accountId: selectedAccount.id,
                params: {
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                    type: filterType !== 'all' ? filterType : undefined
                }
            }));
        }
    }, [selectedAccount, startDate, endDate, filterType, dispatch]);

    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance.toString()), 0);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Banking Dashboard</h1>
                    <p className="text-slate-600">Manage accounts, view statements and transactions</p>
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
                            <p className="text-2xl font-bold text-slate-900 mt-1">{accounts.length}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Selected Account Balance</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">
                                {selectedAccount ? formatCurrency(selectedAccount.balance) : '-'}
                            </p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <TrendingDown className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Accounts List */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-fit">
                    <div className="p-4 border-b border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-900">Accounts</h2>
                    </div>
                    <div className="p-4">
                        {isLoading && !accounts.length ? (
                            <div className="text-center py-8 text-slate-500">Loading accounts...</div>
                        ) : accounts.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">No accounts found</div>
                        ) : (
                            <div className="space-y-3">
                                {accounts.map((account) => (
                                    <div
                                        key={account.id}
                                        onClick={() => setSelectedAccount(account)}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedAccount?.id === account.id
                                            ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                                            : 'hover:bg-slate-50 border-slate-200'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-sm font-medium text-slate-600">
                                                {account.accountNumber}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${account.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {account.status}
                                            </span>
                                        </div>
                                        <div className="mb-1">
                                            <p className="font-bold text-slate-900 text-lg">
                                                {formatCurrency(parseFloat(account.balance.toString()))}
                                            </p>
                                        </div>
                                        <div className="text-xs text-slate-500 capitalize">
                                            {account.accountType.replace('_', ' ')} • {account.accountName || 'Unnamed'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bank Statement View */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200">
                    {selectedAccount ? (
                        <>
                            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Bank Statement</h2>
                                    <p className="text-sm text-slate-500">
                                        {selectedAccount.accountName} - {selectedAccount.accountNumber}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => setShowTransactionModal(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Transaction
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={() => {
                                        // Simple print/export simulation
                                        window.print();
                                    }}>
                                        Export
                                    </Button>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="date"
                                            className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-primary-500"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="date"
                                            className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-primary-500"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                                    <div className="relative">
                                        <Filter className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                                        <select
                                            className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-primary-500"
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                        >
                                            <option value="all">All Transactions</option>
                                            <option value="deposit">Deposits Only</option>
                                            <option value="withdrawal">Withdrawals Only</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Transactions Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Debit (Dr)</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Credit (Cr)</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {transactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                    No transactions found for the selected period
                                                </td>
                                            </tr>
                                        ) : (
                                            transactions.map((txn) => {
                                                const amount = parseFloat(txn.amount.toString());
                                                const isCredit = txn.transactionType === 'deposit';

                                                return (
                                                    <tr key={txn.id} className="hover:bg-slate-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                            {formatDateTime((txn.createdAt || new Date().toISOString()).toString())}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                            {txn.description || txn.transactionType}
                                                            <div className="text-xs text-slate-400 font-normal">{txn.transactionId}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                                                            {!isCredit ? formatCurrency(amount) : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                                                            {isCredit ? formatCurrency(amount) : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-slate-900">
                                                            {formatCurrency(parseFloat(txn.balanceAfter.toString()))}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-slate-500">
                            <div className="bg-slate-100 p-4 rounded-full mb-4">
                                <DollarSign className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No Account Selected</h3>
                            <p className="mt-1">Select an account from the list to view its statement.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedAccount && (
                <TransactionModal
                    isOpen={showTransactionModal}
                    onClose={() => setShowTransactionModal(false)}
                    account={selectedAccount}
                />
            )}
        </div>
    );
};
