import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchListings, createListing, updateListingStatus } from './ipoSlice';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { IPOListingForm } from './components/IPOListingForm';
import { Plus, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import type { IPOListing } from '../../types/business.types';

export const IPOManagement: React.FC = () => {
    const dispatch = useAppDispatch();
    const { listings, isLoading } = useAppSelector((state) => state.ipo);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState<IPOListing | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        dispatch(fetchListings());
    }, [dispatch]);

    const filteredListings = listings.filter((listing) => {
        if (statusFilter === 'all') return true;
        return listing.status === statusFilter;
    });

    const handleCreate = () => {
        setSelectedListing(null);
        setIsModalOpen(true);
    };

    const handleEdit = (listing: IPOListing) => {
        setSelectedListing(listing);
        setIsModalOpen(true);
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        await dispatch(updateListingStatus({ id, status: newStatus }));
    };

    const handleFormSuccess = () => {
        setIsModalOpen(false);
        setSelectedListing(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-100 text-blue-700';
            case 'open': return 'bg-green-100 text-green-700';
            case 'closed': return 'bg-slate-100 text-slate-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">IPO Management</h1>
                    <p className="text-slate-600">Manage IPO listings and applications</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create IPO Listing
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Total IPOs</p>
                            <p className="text-2xl font-bold text-slate-900">{listings.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Open</p>
                            <p className="text-2xl font-bold text-green-600">
                                {listings.filter(l => l.status === 'open').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Upcoming</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {listings.filter(l => l.status === 'upcoming').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Closed</p>
                            <p className="text-2xl font-bold text-slate-600">
                                {listings.filter(l => l.status === 'closed').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all'
                                ? 'bg-primary-500 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatusFilter('upcoming')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'upcoming'
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setStatusFilter('open')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'open'
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Open
                    </button>
                    <button
                        onClick={() => setStatusFilter('closed')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'closed'
                                ? 'bg-slate-500 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Closed
                    </button>
                </div>
            </div>

            {/* IPO Listings Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <p className="text-slate-600">Loading IPO listings...</p>
                    </div>
                ) : filteredListings.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-slate-600">No IPO listings found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Price/Share</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Total Shares</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Open Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Close Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredListings.map((listing) => (
                                <tr key={listing.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{listing.companyName}</div>
                                        {listing.description && (
                                            <div className="text-sm text-slate-500 truncate max-w-xs">{listing.description}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-900">NPR {listing.pricePerShare}</td>
                                    <td className="px-6 py-4 text-slate-900">{listing.totalShares.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">
                                        {new Date(listing.openDate).toLocaleDateString()}
                                        {listing.openTime && <div className="text-xs text-slate-500">{listing.openTime}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">
                                        {new Date(listing.closeDate).toLocaleDateString()}
                                        {listing.closeTime && <div className="text-xs text-slate-500">{listing.closeTime}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                                            {listing.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(listing)}
                                        >
                                            Edit
                                        </Button>
                                        {listing.status === 'upcoming' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleStatusChange(listing.id, 'open')}
                                            >
                                                Open
                                            </Button>
                                        )}
                                        {listing.status === 'open' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleStatusChange(listing.id, 'closed')}
                                            >
                                                Close
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedListing(null);
                }}
                title={selectedListing ? 'Edit IPO Listing' : 'Create IPO Listing'}
                size="lg"
            >
                <IPOListingForm
                    listing={selectedListing}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};
