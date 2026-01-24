import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { applyIPO } from '../customerSlice';
import type { Account } from '../../../types/business.types';
import { formatCurrency } from '../../../utils/formatters';
import { ipoApi, type IPOListing } from '../../../api/ipoApi';
import { Card, ActionButton } from '../../../components/ui';
import { Wallet } from 'lucide-react';

interface IPOApplicationFormProps {
    customerId: string;
    accounts: Account[];
    onSuccess: () => void;
}

export const IPOApplicationForm: React.FC<IPOApplicationFormProps> = ({ customerId, accounts, onSuccess }) => {
    const dispatch = useAppDispatch();
    const [openIPOs, setOpenIPOs] = useState<IPOListing[]>([]);
    const [formData, setFormData] = useState({
        companyName: '',
        quantity: '',
        pricePerShare: '',
        accountId: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Set default account when accounts are loaded
    useEffect(() => {
        if (accounts.length > 0 && !formData.accountId) {
            const primaryAccount = accounts.find(a => a.isPrimary);
            const defaultId = primaryAccount ? primaryAccount.id.toString() : accounts[0].id.toString();
            setFormData(prev => ({ ...prev, accountId: defaultId }));
        }
    }, [accounts]);

    useEffect(() => {
        const fetchOpenIPOs = async () => {
            try {
                const listings = await ipoApi.getOpenListings();
                setOpenIPOs(listings);
            } catch (err) {
                console.error('Failed to fetch open IPOs:', err);
            }
        };
        fetchOpenIPOs();
    }, []);

    const handleIPOSelection = (companyName: string) => {
        const ipo = openIPOs.find(i => i.companyName === companyName);
        if (ipo) {
            setFormData(prev => ({
                ...prev,
                companyName: ipo.companyName,
                pricePerShare: ipo.pricePerShare.toString()
            }));
        } else {
            setFormData(prev => ({ ...prev, companyName: '', pricePerShare: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const quantity = parseInt(formData.quantity);
            const price = parseFloat(formData.pricePerShare);

            if (isNaN(quantity) || quantity <= 0) throw new Error('Invalid quantity');
            if (isNaN(price) || price <= 0) throw new Error('Invalid price');
            if (!formData.accountId) throw new Error('Please select an account');

            // DEBUGGING: Explicitly show what is being sent
            const accountToSend = parseInt(formData.accountId);
            const accountDetails = accounts.find(a => a.id.toString() === formData.accountId);
            const isConfirmed = window.confirm(
                `DEBUG CHECK:\n\n` +
                `Selected Account ID: ${accountToSend}\n` +
                `Account Number: ${accountDetails?.accountNumber}\n` +
                `Is Primary: ${accountDetails?.isPrimary}\n\n` +
                `Click OK to proceed with this Account ID.`
            );

            if (!isConfirmed) {
                setSubmitting(false);
                return;
            }

            const resultAction = await dispatch(applyIPO({
                customerId: parseInt(customerId),
                accountId: accountToSend,
                companyName: formData.companyName,
                quantity,
                pricePerShare: price
            }));

            if (applyIPO.fulfilled.match(resultAction)) {
                setFormData({ ...formData, companyName: '', quantity: '', pricePerShare: '' });
                onSuccess();
            } else {
                setError(resultAction.payload as string);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to apply');
        } finally {
            setSubmitting(false);
        }
    };

    const totalAmount = (parseInt(formData.quantity) || 0) * (parseFloat(formData.pricePerShare) || 0);
    const selectedAccount = accounts.find(a => a.id.toString() === formData.accountId);

    return (
        <Card className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Apply for IPO</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* IPO Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select IPO
                    </label>
                    <select
                        value={formData.companyName}
                        onChange={e => handleIPOSelection(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                        required
                    >
                        <option value="">-- Select an IPO --</option>
                        {openIPOs.map(ipo => (
                            <option key={ipo.id} value={ipo.companyName}>
                                {ipo.companyName} - {formatCurrency(ipo.pricePerShare)} per share
                            </option>
                        ))}
                    </select>
                </div>

                {/* Two Column Layout for Quantity and Price */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity
                        </label>
                        <input
                            type="number"
                            min="1"
                            required
                            value={formData.quantity}
                            onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                            placeholder="Enter quantity"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price per Share
                        </label>
                        <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                            {formData.pricePerShare ? formatCurrency(parseFloat(formData.pricePerShare)) : '-'}
                        </div>
                    </div>
                </div>

                {/* Account Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deduct from Account
                    </label>
                    <select
                        value={formData.accountId}
                        onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                        required
                    >
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                                {acc.bankName} - {acc.accountNumber} ({formatCurrency(acc.balance)}) {acc.isPrimary ? '(Primary)' : ''}
                            </option>
                        ))}
                    </select>
                    {selectedAccount && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-center gap-2 text-sm text-blue-900">
                                <Wallet className="w-4 h-4" />
                                <span>
                                    Available Balance: <strong>{formatCurrency(selectedAccount.balance)}</strong>
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Amount:</span>
                        <span className="text-xl font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                    <ActionButton
                        type="submit"
                        disabled={submitting || totalAmount <= 0}
                        className="w-full md:w-auto"
                    >
                        {submitting ? 'Submitting...' : 'Submit Application'}
                    </ActionButton>
                </div>
            </form>
        </Card>
    );
};
