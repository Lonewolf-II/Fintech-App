import apiClient from './apiClient';
import type { Account, Transaction } from '../types/business.types';

export const bankingApi = {
    // Accounts
    getAllAccounts: async (): Promise<Account[]> => {
        const response = await apiClient.get('/banking/accounts');
        return response.data;
    },

    createAccount: async (accountData: {
        customerId: string;
        accountType: string;
        accountNumber?: string;
        bankName?: string;
        branch?: string;
        accountName?: string;
        status?: string;
    }): Promise<Account> => {
        const response = await apiClient.post('/banking/accounts', accountData);
        return response.data;
    },

    // Transactions
    getAccountTransactions: async (accountId: string): Promise<Transaction[]> => {
        const response = await apiClient.get(`/banking/accounts/${accountId}/transactions`);
        return response.data;
    },

    createTransaction: async (transactionData: {
        accountId: string;
        transactionType: string;
        amount: number;
        description?: string;
    }): Promise<Transaction> => {
        const response = await apiClient.post('/banking/transactions', transactionData);
        return response.data;
    },
};
