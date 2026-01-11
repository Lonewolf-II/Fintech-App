import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch } from '../../app/hooks';
// Assuming bankingSlice exports createTransaction and bulkDeposit async thunks. 
// If they don't exist yet, we'll need to create them.
// For now, let's assume they might need to be added or we call API directly.
// Let's assume we need to add them to bankingSlice.ts later.
import { createTransaction } from './bankingSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Upload, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import apiClient from '../../api/apiClient';

// Schema for Single Transaction
const transactionSchema = z.object({
    accountNumber: z.string().min(1, 'Account number is required'),
    amount: z.string().min(1, 'Amount is required'), // Input as string, parse later
    description: z.string().min(1, 'Description is required'),
    type: z.enum(['deposit', 'withdrawal']),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export const TransactionOperations: React.FC = () => {
    const dispatch = useAppDispatch();
    const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [bulkFile, setBulkFile] = useState<File | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'deposit',
        },
    });

    const transactionType = watch('type');

    // Helper to find account ID by number - simplified for now
    // Ideally user inputs Account Number, we resolve ID.
    // For this implementation, we might need an endpoint to lookup Account by Number.
    // Or we just send accountNumber to backend and backend resolves it.
    // The backend `createTransaction` expects `accountId`.
    // Let's update frontend to fetch account first? Or modify backend?
    // User requested "deposit and withdrawal amount".
    // Let's lookup account ID on the fly or change backend to accepting accountNumber.
    // For safety, let's lookup.

    const lookupAccount = async (accNum: string) => {
        // This requires an endpoint like GET /banking/accounts?accountNumber=...
        // Or we iterate all accounts. Not efficient.
        // Let's assume we have to implement lookup or just modify backend `createTransaction`?
        // Let's modify frontend to ask for "Account ID" or assume we can find it.
        // Better: We should probably just pass account ID if we select from list, but for manual entry...
        // Let's assume for now the user pastes "Account ID" or we have a search.
        // Given complexity, let's stick to simple "Account Number" and resolve it if possible.
        // Since we don't have a resolve endpoint, let's iterate fetched accounts in Redux store?
        // We probably don't have all accounts.
        // Let's stick with Account Number input and try to resolve via a quick search API call if exists.
        // If not, we might need to add one.
        // Wait, the backend implementation of createTransaction takes `accountId`.
        // Let's add a quick helper: fetch all accounts, find matching number.
        const response = await apiClient.get('/banking/accounts');
        const accounts = response.data;
        const found = accounts.find((a: any) => a.accountNumber === accNum);
        return found ? found.id : null;
    };


    const onSingleSubmit = async (data: TransactionFormData) => {
        setMessage(null);
        try {
            const accountId = await lookupAccount(data.accountNumber);
            if (!accountId) {
                setMessage({ type: 'error', text: 'Account not found with this number.' });
                return;
            }

            // Dispatch
            await dispatch(createTransaction({
                accountId,
                transactionType: data.type,
                amount: parseFloat(data.amount),
                description: data.description,
            })).unwrap();

            setMessage({ type: 'success', text: `${data.type} successful.` });
            reset();
            setValue('type', data.type); // Keep same type
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Transaction failed' });
        }
    };

    const onBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bulkFile) {
            setMessage({ type: 'error', text: 'Please select a CSV file.' });
            return;
        }

        const formData = new FormData();
        formData.append('file', bulkFile);

        try {
            // Manual API call or thunk
            // Let's use apiClient directly as we might not have a thunk yet
            const response = await apiClient.post('/banking/bulk-deposit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setMessage({
                type: 'success',
                text: `Processed. Success: ${response.data.successCount}. Errors: ${response.data.errors ? response.data.errors.length : 0}`
            });
            setBulkFile(null);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Bulk deposit failed' });
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Transaction Operations</h1>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => { setActiveTab('single'); setMessage(null); }}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'single' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Single Transaction
                </button>
                <button
                    onClick={() => { setActiveTab('bulk'); setMessage(null); }}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'bulk' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Bulk Deposit
                </button>
            </div>

            {/* Notifications */}
            {message && (
                <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Single Transaction Form */}
            {activeTab === 'single' && (
                <Card className="max-w-xl">
                    <form onSubmit={handleSubmit(onSingleSubmit)} className="space-y-6 p-6">

                        <div className="flex gap-4 p-1 bg-slate-100 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setValue('type', 'deposit')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${transactionType === 'deposit'
                                    ? 'bg-white text-green-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <ArrowDownLeft className="w-4 h-4" />
                                Deposit
                            </button>
                            <button
                                type="button"
                                onClick={() => setValue('type', 'withdrawal')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${transactionType === 'withdrawal'
                                    ? 'bg-white text-red-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <ArrowUpRight className="w-4 h-4" />
                                Withdrawal
                            </button>
                        </div>

                        <Input
                            label="Account Number"
                            {...register('accountNumber')}
                            error={errors.accountNumber?.message}
                            placeholder="Enter account number"
                        />

                        <Input
                            label="Amount"
                            type="number"
                            step="0.01"
                            {...register('amount')}
                            error={errors.amount?.message}
                            placeholder="0.00"
                        />

                        <Input
                            label="Description"
                            {...register('description')}
                            error={errors.description?.message}
                            placeholder="Transaction remarks"
                        />

                        <div className="pt-4">
                            <Button type="submit" isLoading={isSubmitting} className="w-full">
                                {transactionType === 'deposit' ? 'Deposit Amount' : 'Withdraw Amount'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Bulk Deposit Form */}
            {activeTab === 'bulk' && (
                <Card className="max-w-xl p-6">
                    <form onSubmit={onBulkSubmit} className="space-y-6">
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors">
                            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">Upload Bulk File</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Upload a CSV file with columns: <code className="bg-slate-100 px-1">accountNumber</code>, <code className="bg-slate-100 px-1">amount</code>, <code className="bg-slate-100 px-1">description</code>
                            </p>

                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)}
                                className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary-50 file:text-primary-700
                                hover:file:bg-primary-100"
                            />
                        </div>

                        {bulkFile && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded">
                                <span className="font-semibold">Selected:</span> {bulkFile.name}
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-4">
                            <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                                <Download className="w-4 h-4" />
                                Download Template
                            </button>
                            <Button type="submit" disabled={!bulkFile}>
                                Process Bulk Deposit
                            </Button>
                        </div>
                    </form>
                </Card>
            )}
        </div>
    );
};
