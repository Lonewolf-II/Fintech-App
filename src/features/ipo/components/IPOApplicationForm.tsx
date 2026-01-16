import React, { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { applyForIPO, fetchApplications } from '../ipoSlice';
import { Button } from '../../../components/common/Button';
import { customerApi } from '../../../api/customerApi'; // Direct customer search might be needed
import type { Customer, IPOListing } from '../../../types/business.types';

interface IPOApplicationFormProps {
    listing: IPOListing | null; // Pre-selected listing if available
    listings: IPOListing[]; // All available listings to select from
    onSuccess: () => void;
    onCancel: () => void;
}

export const IPOApplicationForm: React.FC<IPOApplicationFormProps> = ({ listing, listings, onSuccess, onCancel }) => {
    const dispatch = useAppDispatch();
    const [selectedListingId, setSelectedListingId] = useState<number | ''>(listing?.id || '');
    const [customerId, setCustomerId] = useState<string>(''); // For searching
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [quantity, setQuantity] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Get current selected listing object
    const currentListing = listings.find(l => l.id === Number(selectedListingId));

    const handleSearchCustomer = async () => {
        if (!customerId) return;
        setIsSearching(true);
        setError(null);
        try {
            // Simplified: Fetch by ID. In real app, search by name/phone etc.
            // Using existing API that fetches by ID
            const customer = await customerApi.getById(customerId);
            if (customer) {
                // Ensure customer has an account with funds
                // For now just set customer
                setSelectedCustomer(customer);
            } else {
                setError('Customer not found');
            }
        } catch (err) {
            setError('Customer not found or error searching');
            setSelectedCustomer(null);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer || !currentListing || !quantity) {
            setError('Please fill all fields');
            return;
        }

        // Check if customer has a valid account (Simple check)
        const account = selectedCustomer.accounts?.find(a => a.status === 'active' && a.isPrimary);
        if (!account) {
            setError('Customer does not have an active primary account');
            return;
        }

        const totalCost = Number(quantity) * currentListing.pricePerShare;
        // Simple balance check - Backend does safer check
        const availableBalance = account.balance - account.blockedAmount;
        if (availableBalance < totalCost) {
            setError(`Insufficient funds. Cost: ${totalCost}, Available: ${availableBalance}`);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await dispatch(applyForIPO({
                customerId: Number(selectedCustomer.id),
                accountId: Number(account.id),
                companyName: currentListing.companyName,
                quantity: Number(quantity),
                pricePerShare: currentListing.pricePerShare
            })).unwrap();

            // Refresh applications list
            dispatch(fetchApplications());
            onSuccess();
        } catch (err: any) {
            setError(err || 'Failed to submit application');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select IPO Listing</label>
                <select
                    value={selectedListingId}
                    onChange={(e) => setSelectedListingId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    disabled={!!listing} // Disable if passed as prop
                    required
                >
                    <option value="">Select an IPO</option>
                    {listings.filter(l => l.status === 'open').map(l => (
                        <option key={l.id} value={l.id}>
                            {l.companyName} (NPR {l.pricePerShare}/share)
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer ID (Search)</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        placeholder="Enter Customer ID"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <Button type="button" onClick={handleSearchCustomer} isLoading={isSearching} disabled={!customerId}>
                        Search
                    </Button>
                </div>
            </div>

            {selectedCustomer && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-sm font-medium text-slate-900">{selectedCustomer.fullName}</p>
                    <p className="text-xs text-slate-500">{selectedCustomer.email}</p>
                    <p className="text-xs text-slate-500">Phone: {selectedCustomer.phone}</p>
                    {selectedCustomer.accounts && selectedCustomer.accounts.length > 0 ? (
                        <p className="text-xs text-green-600 mt-1">
                            Primary Account Balance: NPR {selectedCustomer.accounts.find(a => a.isPrimary)?.balance.toLocaleString() || 0}
                        </p>
                    ) : (
                        <p className="text-xs text-red-600 mt-1">No accounts found</p>
                    )}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    min="10"
                    step="10"
                    required
                />
                {quantity && currentListing && (
                    <p className="text-sm text-slate-600 mt-1">
                        Total Amount: NPR {(Number(quantity) * currentListing.pricePerShare).toLocaleString()}
                    </p>
                )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading} disabled={!selectedCustomer || !currentListing}>
                    Submit Application
                </Button>
            </div>
        </form>
    );
};
