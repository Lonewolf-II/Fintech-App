import React, { useEffect, useState } from 'react';
import axios from '../../api/apiClient';
import { RefreshCw, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface SpecialAccount {
    id: number;
    accountNumber: string;
    accountName: string;
    shortName: string;
    balance: string;
    accountType: string;
    status: string;
}

export const ChargeAccounts: React.FC = () => {
    const [accounts, setAccounts] = useState<SpecialAccount[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAccounts = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/admin/charge-accounts');
            setAccounts(response.data);
        } catch (error) {
            console.error('Failed to fetch charge accounts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Charge Collection Accounts</h1>
                    <p className="text-slate-500">Monitor balances of administrative collection accounts</p>
                </div>
                <button
                    onClick={fetchAccounts}
                    className="p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-full hover:bg-slate-100"
                    title="Refresh"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {accounts.map((account) => (
                    <div key={account.id} className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-indigo-50 rounded-lg">
                                    <Wallet className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">{account.accountName}</h3>
                                    <p className="text-sm text-slate-500">{account.shortName}</p>
                                </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {account.status.toUpperCase()}
                            </span>
                        </div>

                        <div className="mt-6">
                            <p className="text-sm text-slate-500 mb-1">Current Balance</p>
                            <div className="text-3xl font-bold text-slate-900">
                                {formatCurrency(parseFloat(account.balance))}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                            <span className="text-slate-500">Account Number:</span>
                            <span className="font-mono font-medium text-slate-700">{account.accountNumber}</span>
                        </div>
                    </div>
                ))}
            </div>

            {accounts.length === 0 && !isLoading && (
                <div className="text-center py-12 text-slate-500">
                    No charge accounts found. Please run the seeder script.
                </div>
            )}
        </div>
    );
};
