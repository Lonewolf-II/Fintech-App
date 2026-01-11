import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { applyIPO } from '../customerSlice';
import { Button } from '../../../components/common/Button';
import type { Account } from '../../../types/business.types';
import { formatCurrency } from '../../../utils/formatters';
import { ipoApi, type IPOListing } from '../../../api/ipoApi';
import { Input } from '../../../components/common/Input';

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
        accountId: accounts.find(a => a.isPrimary)?.id || accounts[0]?.id || ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                pricePerShare: ipo.pricePerShare
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

            const resultAction = await dispatch(applyIPO({
                customerId: parseInt(customerId),
                accountId: parseInt(formData.accountId),
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

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Apply for IPO</h3>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <select
                    value={formData.companyName}
                    onChange={e => handleIPOSelection(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                >
                    <option value="">Select an Open IPO</option>
                    {openIPOs.map(ipo => (
                        <option key={ipo.id} value={ipo.companyName}>
                            {ipo.companyName} ({formatCurrency(parseFloat(ipo.pricePerShare))})
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Input
                        label="Quantity"
                        type="number"
                        min="1"
                        required
                        value={formData.quantity}
                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price / Share</label>
                    <div className="px-3 py-2 border rounded-md bg-slate-50 text-slate-700">
                        {formData.pricePerShare ? formatCurrency(parseFloat(formData.pricePerShare)) : '-'}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deduct from Account</label>
                <select
                    value={formData.accountId}
                    onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                >
                    {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                            {acc.accountNumber} ({formatCurrency(acc.balance)}) {acc.isPrimary ? '(Primary)' : ''}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex justify-between items-center pt-2">
                <div className="text-sm">
                    <span className="text-slate-500">Total Amount:</span>
                    <span className="font-bold text-slate-900 ml-2">{formatCurrency(totalAmount)}</span>
                </div>
                <Button type="submit" isLoading={submitting} disabled={totalAmount <= 0}>
                    Submit Application
                </Button>
            </div>
        </form>
    );
};
