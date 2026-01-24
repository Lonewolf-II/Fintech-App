import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { createListing, updateListing } from '../ipoSlice';
import { Button } from '../../../components/common/Button';
import type { IPOListing } from '../../../types/business.types';

interface IPOListingFormProps {
    listing: IPOListing | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export const IPOListingForm: React.FC<IPOListingFormProps> = ({ listing, onSuccess, onCancel }) => {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState({
        companyName: '',
        scripName: '',
        pricePerShare: '',
        totalShares: '',
        openDate: '',
        closeDate: '',
        openTime: '',
        closeTime: '',
        allotmentDate: '',
        allotmentTime: '',
        resultPublishDate: '',
        resultPublishTime: '',
        status: 'upcoming',
        description: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (listing) {
            setFormData({
                companyName: listing.companyName,
                scripName: (listing as any).scripName || '',
                pricePerShare: listing.pricePerShare.toString(),
                totalShares: listing.totalShares.toString(),
                openDate: listing.openDate ? listing.openDate.split('T')[0] : '',
                closeDate: listing.closeDate ? listing.closeDate.split('T')[0] : '',
                openTime: listing.openTime || '',
                closeTime: listing.closeTime || '',
                allotmentDate: listing.allotmentDate ? listing.allotmentDate.split('T')[0] : '',
                allotmentTime: listing.allotmentTime || '',
                resultPublishDate: (listing as any).resultPublishDate ? (listing as any).resultPublishDate.split('T')[0] : '',
                resultPublishTime: (listing as any).resultPublishTime || '',
                status: listing.status,
                description: listing.description || '',
            });
        }
    }, [listing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Auto-update status based on dates if dates change
            if (['openDate', 'closeDate'].includes(name) && newData.openDate && newData.closeDate) {
                const today = new Date().toISOString().split('T')[0];
                if (today < newData.openDate) {
                    newData.status = 'upcoming';
                } else if (today >= newData.openDate && today <= newData.closeDate) {
                    newData.status = 'open';
                } else if (today > newData.closeDate) {
                    newData.status = 'closed';
                }
            }

            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const data = {
                ...formData,
                pricePerShare: parseFloat(formData.pricePerShare),
                totalShares: parseInt(formData.totalShares),
                openTime: formData.openTime || null,
                closeTime: formData.closeTime || null,
                allotmentDate: formData.allotmentDate || null,
                allotmentTime: formData.allotmentTime || null,
                resultPublishDate: formData.resultPublishDate || null,
                resultPublishTime: formData.resultPublishTime || null,
            };

            // Basic validation
            if (!data.companyName || !data.openDate) {
                setError('Company name and open date are required');
                setIsLoading(false);
                return;
            }

            if (listing) {
                // Update existing listing - Note: We might want a dedicated update thunk besides status
                // For now, assuming status update or we'd add a full update endpoint.
                // Since updateListingStatus only does status, let's assume for MVP we only edit basics if status is upcoming
                // or just log that full edit isn't hooked up in slice yet.
                // Assuming createListing logic for now or custom API call if needed.
                // ACTUALLY, checking ipoApi, we didn't add a full `updateListing` method in the Slice, only `updateStatus`.
                // Let's rely on `createListing` for new and maybe just show error for now or implement full update later.
                // To keep it simple, if editing, we might need a direct API call if the thunk isn't there, or mostly creating new ones.
                // Let's just handle creation for Phase 2 strict compliance or use updateStatus if only status changed.

                // For a proper edit, we should have added updateListing to slice. 
                // I will simulate success for edit if it's just a mockup or throw error.
                // Real implementation: Let's assume we can't fully edit details of active IPOs easily without that endpoint.
                // I'll stick to Create logic. If listing exists, I'll display a message.
                if (listing.id) {
                    await dispatch(updateListing({ id: listing.id, data: data as any })).unwrap();
                    onSuccess();
                }
            } else {
                await dispatch(createListing(data as any)).unwrap();
                onSuccess();
            }
        } catch (err: any) {
            setError(err || 'Failed to save IPO listing');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime12Hour = (time24: string) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                    <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Scrip Name *</label>
                    <input
                        type="text"
                        name="scripName"
                        value={formData.scripName}
                        onChange={handleChange}
                        placeholder="e.g., HBL, NBL"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        required
                    />
                    <p className="text-xs text-slate-500 mt-1">Stock symbol/ticker for this IPO</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="upcoming">Upcoming</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="result_published">Result Published</option>
                    </select>
                </div>
                <div></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price Per Share</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500">NPR</span>
                        <input
                            type="number"
                            name="pricePerShare"
                            value={formData.pricePerShare}
                            onChange={handleChange}
                            className="w-full pl-12 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            required
                            min="1"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Total Shares</label>
                    <input
                        type="number"
                        name="totalShares"
                        value={formData.totalShares}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        required
                        min="1"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Open Date</label>
                    <input
                        type="date"
                        name="openDate"
                        value={formData.openDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Open Time {formData.openTime && <span className="text-primary-600 font-bold ml-2">({formatTime12Hour(formData.openTime)})</span>}
                    </label>
                    <input
                        type="time"
                        name="openTime"
                        value={formData.openTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Close Date</label>
                    <input
                        type="date"
                        name="closeDate"
                        value={formData.closeDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Close Time {formData.closeTime && <span className="text-primary-600 font-bold ml-2">({formatTime12Hour(formData.closeTime)})</span>}
                    </label>
                    <input
                        type="time"
                        name="closeTime"
                        value={formData.closeTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Allotment Date</label>
                    <input
                        type="date"
                        name="allotmentDate"
                        value={formData.allotmentDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Allotment Time {formData.allotmentTime && <span className="text-primary-600 font-bold ml-2">({formatTime12Hour(formData.allotmentTime)})</span>}
                    </label>
                    <input
                        type="time"
                        name="allotmentTime"
                        value={formData.allotmentTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Result Publish Date</label>
                    <input
                        type="date"
                        name="resultPublishDate"
                        value={formData.resultPublishDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Result Publish Time {formData.resultPublishTime && <span className="text-primary-600 font-bold ml-2">({formatTime12Hour(formData.resultPublishTime)})</span>}
                    </label>
                    <input
                        type="time"
                        name="resultPublishTime"
                        value={formData.resultPublishTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    {listing ? 'Update Listing' : 'Create Listing'}
                </Button>
            </div>
        </form>
    );
};
