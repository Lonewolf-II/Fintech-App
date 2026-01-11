import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAccounts, fetchTransactions } from './bankingSlice';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { DollarSign, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import type { Account } from '../../types/business.types';

export const BankingDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { accounts, transactions, isLoading } = useAppSelector((state) => state.banking);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [showTransactionModal, setShowTransactionModal] = useState(false);

    useEffect(() => {
        dispatch(fetchAccounts());
    }, [dispatch]);

    useEffect(() => {
        if (selectedAccount) {
            dispatch(fetchTransactions(selectedAccount.id));
        }
    }, [selectedAccount, dispatch]);

    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance.toString()), 0);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Banking Dashboard</h1>
                    <p className="text-slate-600">Manage accounts and transactions</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Total Balance</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {formatCurrency(totalBalance)}
                            </p>
                        </div>
                        <DollarSign className="w-10 h-10 text-green-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Total Accounts</p>
                            <p className="text-2xl font-bold text-slate-900">{accounts.length}</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Transactions</p>
                            <p className="text-2xl font-bold text-slate-900">{transactions.length}</p>
                        </div>
                        <TrendingDown className="w-10 h-10 text-purple-600" />
                    </div>
                </div>
            </div>

            {/* Accounts List */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Accounts</h2>
                </div>
                <div className="p-4">
                    {isLoading ? (
                        <p className="text-center py-4">Loading accounts...</p>
                    ) : accounts.length === 0 ? (
                        <p className="text-center py-4 text-slate-500">No accounts found</p>
                    ) : (
                        <div className="space-y-3">
                            {accounts.map((account) => (
                                <div
                                    key={account.id}
                                    className="flex justify-between items-center p-4 border rounded-lg hover:bg-slate-50 cursor-pointer"
                                    onClick={() => setSelectedAccount(account)}
                                >
                                    <div>
                                        <p className="font-semibold">{account.accountNumber}</p>
                                        <p className="text-sm text-slate-600">{account.accountType}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">{formatCurrency(parseFloat(account.balance.toString()))}</p>
                                        <p className="text-sm text-slate-600">{account.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Transactions */}
            {selectedAccount && (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="text-lg font-semibold">
                            Transactions - {selectedAccount.accountNumber}
                        </h2>
                        <Button size="sm" onClick={() => setShowTransactionModal(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            New Transaction
                        </Button>
                    </div>
                    <div className="p-4">
                        {transactions.length === 0 ? (
                            <p className="text-center py-4 text-slate-500">No transactions</p>
                        ) : (
                            <div className="space-y-2">
                                {transactions.map((txn) => (
                                    <div key={txn.id} className="flex justify-between items-center p-3 border-b">
                                        <div>
                                            <p className="font-medium">{txn.transactionType}</p>
                                            <p className="text-sm text-slate-600">{txn.description || '-'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${txn.transactionType === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                                                {txn.transactionType === 'deposit' ? '+' : '-'} {formatCurrency(parseFloat(txn.amount.toString())).replace('NPR', '').trim()}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                Balance: {formatCurrency(parseFloat(txn.balanceAfter.toString()))}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Transaction Modal */}
            <Modal
                isOpen={showTransactionModal}
                onClose={() => setShowTransactionModal(false)}
                title="New Transaction"
            >
                <p className="text-slate-600">Transaction form would go here</p>
                <div className="mt-4 flex justify-end">
                    <Button onClick={() => setShowTransactionModal(false)}>Close</Button>
                </div>
            </Modal>
        </div>
    );
};
