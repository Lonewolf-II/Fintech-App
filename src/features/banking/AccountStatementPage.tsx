import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchTransactions, fetchAccounts } from './bankingSlice';
import { bankingApi } from '../../api/bankingApi';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { ArrowLeft, Printer, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from '../../components/common/Button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';

export const AccountStatementPage: React.FC = () => {
    const { accountId } = useParams<{ accountId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { accounts, transactions, transactionPagination, isLoading } = useAppSelector((state) => state.banking);

    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        type: 'all'
    });

    // Local state for inputs to avoid refetching on every keystroke
    const [localFilters, setLocalFilters] = useState({
        startDate: '',
        endDate: '',
        type: 'all'
    });

    const account = accounts.find(acc => acc.id.toString() === accountId);

    useEffect(() => {
        if (accounts.length === 0) {
            dispatch(fetchAccounts());
        }
    }, [dispatch, accounts.length]);

    useEffect(() => {
        if (accountId) {
            dispatch(fetchTransactions({
                accountId: accountId,
                params: {
                    page: transactionPagination.currentPage,
                    limit: 25,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    type: filters.type
                }
            }));
        }
    }, [accountId, dispatch, transactionPagination.currentPage, filters]);

    const handleApplyFilters = () => {
        setFilters(localFilters);
        // Reset to page 1 when filters change (implicitly handled if we dispatch fetchTransactions with page 1? 
        // We need to reset pagination in slice or locally. 
        // Actually, useEffect depends on pagination.currentPage. 
        // Ideally we should dispatch an action to set page to 1. But allow useEffect to handle fetch.
        // For now, let's assume slice keeps state. But if we change filter, we likely want page 1.
        // We can manually dispatch fetch with page 1.
        if (accountId) {
            dispatch(fetchTransactions({
                accountId: accountId,
                params: {
                    page: 1,
                    limit: 25,
                    startDate: localFilters.startDate,
                    endDate: localFilters.endDate,
                    type: localFilters.type
                }
            }));
        }
    };

    const handlePageChange = (newPage: number) => {
        if (accountId) {
            dispatch(fetchTransactions({
                accountId: accountId,
                params: {
                    page: newPage,
                    limit: 25,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    type: filters.type
                }
            }));
        }
    };

    if (!account) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-slate-500">Account not found or loading...</p>
                    <Button onClick={() => navigate(-1)} className="mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const availableBalance = account.balance - (account.blockedAmount || 0);

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = async () => {
        try {
            toast.loading('Generating PDF...');
            // Fetch ALL transactions for PDF
            const response: any = await bankingApi.getAccountTransactions(accountId!, {
                startDate: filters.startDate,
                endDate: filters.endDate,
                type: filters.type,
                limit: 1000 // Large limit for PDF
            });
            const allTransactions = response.transactions || response; // Handle both formats if any

            const doc = new jsPDF();

            // Header
            doc.setFontSize(18);
            doc.text('Account Statement', 14, 20);

            doc.setFontSize(10);
            doc.text(`Generated on: ${formatDateTime(new Date())}`, 14, 30);

            // Customer & Account Details
            doc.setFontSize(12);
            doc.text('Customer Details', 14, 40);
            doc.setFontSize(10);
            doc.text(`Name: ${account.accountName || 'N/A'}`, 14, 46);
            doc.text(`Account Number: ${account.accountNumber}`, 14, 52);
            doc.text(`Current Balance: ${formatCurrency(account.balance)}`, 14, 58);

            if (filters.startDate || filters.endDate) {
                doc.text(`Period: ${filters.startDate || 'Start'} to ${filters.endDate || 'Now'}`, 14, 64);
            }

            // Table
            const tableColumn = ["Date", "Txn ID", "Type", "Description", "Debit", "Credit", "Balance"];
            const tableRows: any[] = [];

            allTransactions.forEach((t: any) => {
                const isDebit = ['withdrawal', 'ipo_hold', 'ipo_allotment', 'fee_deduction'].includes(t.transactionType);
                const txnData = [
                    formatDateTime(t.createdAt),
                    t.transactionId,
                    t.transactionType,
                    t.description,
                    isDebit ? formatCurrency(parseFloat(t.amount)) : '-',
                    !isDebit ? formatCurrency(parseFloat(t.amount)) : '-',
                    formatCurrency(parseFloat(t.balanceAfter))
                ];
                tableRows.push(txnData);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 70,
            });

            doc.save(`Statement_${account.accountNumber}.pdf`);
            toast.dismiss();
            toast.success('PDF Downloaded');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to generate PDF');
            console.error(error);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Banking
                </Button>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Account Statement</h1>
                            <p className="text-sm text-slate-500 mt-1">Account Number: {account.accountNumber}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleExportPDF} variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                            <Button onClick={handlePrint} variant="ghost" size="sm">
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Account Name</p>
                            <p className="font-semibold text-slate-900 mt-1">{account.accountName || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Current Balance</p>
                            <p className="font-semibold text-green-600 mt-1">{formatCurrency(account.balance)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Blocked Amount</p>
                            <p className="font-semibold text-orange-600 mt-1">{formatCurrency(account.blockedAmount || 0)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Available Balance</p>
                            <p className="font-semibold text-blue-600 mt-1">{formatCurrency(availableBalance)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
                        <input
                            type="date"
                            value={localFilters.startDate}
                            onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
                        <input
                            type="date"
                            value={localFilters.endDate}
                            onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select
                            value={localFilters.type}
                            onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="all">All Transactions</option>
                            <option value="deposit">Deposit</option>
                            <option value="withdrawal">Withdrawal</option>
                            <option value="ipo_hold">IPO Hold</option>
                        </select>
                    </div>
                    <div>
                        <Button onClick={handleApplyFilters} className="w-full">
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-12 text-center text-slate-500">Loading transactions...</div>
                    ) : (
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transaction ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Debit</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Credit</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            No transactions found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((transaction) => {
                                        const isDebit = ['withdrawal', 'ipo_hold', 'ipo_allotment', 'fee_deduction'].includes(transaction.transactionType);
                                        return (
                                            <tr key={transaction.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                    {formatDateTime(transaction.createdAt || new Date().toISOString())}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                                                    {transaction.transactionId}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${transaction.transactionType === 'deposit' ? 'bg-green-100 text-green-800' :
                                                        transaction.transactionType === 'withdrawal' ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {transaction.transactionType.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                    {transaction.description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                                                    {isDebit ? formatCurrency(parseFloat(transaction.amount.toString())) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                                                    {!isDebit ? formatCurrency(parseFloat(transaction.amount.toString())) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-slate-900">
                                                    {formatCurrency(parseFloat(transaction.balanceAfter.toString()))}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Controls */}
                {transactionPagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                            Showing page <span className="font-medium">{transactionPagination.currentPage}</span> of <span className="font-medium">{transactionPagination.totalPages}</span> ({transactionPagination.total} total)
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={transactionPagination.currentPage === 1}
                                onClick={() => handlePageChange(transactionPagination.currentPage - 1)}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={transactionPagination.currentPage === transactionPagination.totalPages}
                                onClick={() => handlePageChange(transactionPagination.currentPage + 1)}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
