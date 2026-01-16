import React, { useEffect, useState } from 'react';
import { X, Download, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Button } from './Button';

interface Transaction {
    id: number;
    transactionId: string;
    transactionType: string;
    amount: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
}

interface Account {
    id: number;
    accountNumber: string;
    accountName?: string;
    shortName?: string;
    balance: number;
    blockedAmount: number;
}

interface AccountStatementViewerProps {
    account: Account;
    transactions: Transaction[];
    onClose: () => void;
}

export const AccountStatementViewer: React.FC<AccountStatementViewerProps> = ({
    account,
    transactions,
    onClose
}) => {
    const [filteredTransactions, setFilteredTransactions] = useState(transactions);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        let filtered = [...transactions];

        if (dateFrom) {
            filtered = filtered.filter(t => new Date(t.createdAt) >= new Date(dateFrom));
        }
        if (dateTo) {
            filtered = filtered.filter(t => new Date(t.createdAt) <= new Date(dateTo));
        }
        if (typeFilter !== 'all') {
            filtered = filtered.filter(t => t.transactionType === typeFilter);
        }

        setFilteredTransactions(filtered);
    }, [dateFrom, dateTo, typeFilter, transactions]);

    const availableBalance = account.balance - account.blockedAmount;
    const totalDebits = filteredTransactions
        .filter(t => ['withdrawal', 'ipo_hold', 'ipo_allotment', 'fee_deduction'].includes(t.transactionType))
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    const totalCredits = filteredTransactions
        .filter(t => ['deposit', 'ipo_release', 'profit_distribution', 'principal_return'].includes(t.transactionType))
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        // Simple CSV export
        const headers = ['Date', 'Transaction ID', 'Type', 'Description', 'Debit', 'Credit', 'Balance'];
        const rows = filteredTransactions.map(t => {
            const isDebit = ['withdrawal', 'ipo_hold', 'ipo_allotment', 'fee_deduction'].includes(t.transactionType);
            return [
                formatDate(t.createdAt),
                t.transactionId,
                t.transactionType,
                t.description,
                isDebit ? t.amount : '',
                !isDebit ? t.amount : '',
                t.balanceAfter
            ];
        });

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `statement_${account.accountNumber}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Account Statement</h2>
                            <p className="text-sm text-slate-500 mt-1">Account Number: {account.accountNumber}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Account Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-slate-500">Account Name</p>
                            <p className="font-semibold text-slate-900">{account.accountName || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Current Balance</p>
                            <p className="font-semibold text-green-600">{formatCurrency(account.balance)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Blocked Amount</p>
                            <p className="font-semibold text-orange-600">{formatCurrency(account.blockedAmount)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Available Balance</p>
                            <p className="font-semibold text-blue-600">{formatCurrency(availableBalance)}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-slate-200 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="all">All Types</option>
                                <option value="deposit">Deposit</option>
                                <option value="withdrawal">Withdrawal</option>
                                <option value="ipo_hold">IPO Hold</option>
                                <option value="ipo_release">IPO Release</option>
                                <option value="ipo_allotment">IPO Allotment</option>
                                <option value="profit_distribution">Profit Distribution</option>
                                <option value="principal_return">Principal Return</option>
                                <option value="fee_deduction">Fee Deduction</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button onClick={handleExport} variant="secondary" className="flex-1">
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                            <Button onClick={handlePrint} variant="secondary">
                                <Printer className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="flex-1 overflow-auto p-4">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Transaction ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Debit</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Credit</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                        No transactions found
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((transaction) => {
                                    const isDebit = ['withdrawal', 'ipo_hold', 'ipo_allotment', 'fee_deduction'].includes(transaction.transactionType);
                                    return (
                                        <tr key={transaction.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm text-slate-900">
                                                {formatDate(transaction.createdAt)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                                                {transaction.transactionId}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                    {transaction.transactionType.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {transaction.description}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-red-600 font-semibold">
                                                {isDebit ? formatCurrency(transaction.amount) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">
                                                {!isDebit ? formatCurrency(transaction.amount) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold text-slate-900">
                                                {formatCurrency(transaction.balanceAfter)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                    <div className="grid grid-cols-3 gap-4 max-w-2xl ml-auto">
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Total Debits</p>
                            <p className="text-lg font-semibold text-red-600">{formatCurrency(totalDebits)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Total Credits</p>
                            <p className="text-lg font-semibold text-green-600">{formatCurrency(totalCredits)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Net Change</p>
                            <p className={`text-lg font-semibold ${totalCredits - totalDebits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(totalCredits - totalDebits)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
