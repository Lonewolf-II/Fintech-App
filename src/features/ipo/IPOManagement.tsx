import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchListings, updateListingStatus } from './ipoSlice';
import { Modal } from '../../components/common/Modal';
import { IPOListingForm } from './components/IPOListingForm';
import { Plus, FileText, Edit2, Trash2, Users } from 'lucide-react';
import type { IPOListing } from '../../types/business.types';
import { formatTime12Hour, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { ipoApi } from '../../api/ipoApi';
import { Card, Badge, ActionButton, PageHeader } from '../../components/ui';

export const IPOManagement: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
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

    const handleFormSuccess = () => {
        setIsModalOpen(false);
        setSelectedListing(null);
    };

    const handleDelete = async (listing: IPOListing) => {
        if (!confirm(`Are you sure you want to delete the IPO listing for "${listing.companyName}"?`)) {
            return;
        }

        try {
            await ipoApi.deleteListing(listing.id);
            toast.success('IPO listing deleted successfully');
            dispatch(fetchListings());
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete IPO listing');
        }
    };

    const handleViewApplications = (listing: IPOListing) => {
        navigate(`/ipo/applications?listing=${listing.id}`);
    };

    const handleCloseIPO = async (listing: IPOListing) => {
        if (!confirm(`Are you sure you want to close the IPO for "${listing.companyName}"?`)) {
            return;
        }

        try {
            await ipoApi.closeListing(listing.id);
            toast.success('IPO closed successfully');
            dispatch(fetchListings());
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to close IPO');
        }
    };

    const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'info' | 'neutral' => {
        switch (status) {
            case 'open': return 'success';
            case 'upcoming': return 'info';
            case 'closed': return 'neutral';
            default: return 'neutral';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <PageHeader
                    title="IPO Management"
                    actions={
                        <ActionButton onClick={handleCreate} icon={<Plus className="w-4 h-4" />}>
                            Create IPO Listing
                        </ActionButton>
                    }
                />

                {/* Filters */}
                <Card className="mb-6" padding="sm">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">Filter:</span>
                        {['all', 'upcoming', 'open', 'closed'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === status
                                        ? 'bg-blue-900 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* IPO Listings */}
                {isLoading ? (
                    <Card>
                        <div className="text-center py-12 text-gray-500">Loading IPO listings...</div>
                    </Card>
                ) : filteredListings.length === 0 ? (
                    <Card>
                        <div className="text-center py-12 text-gray-500">
                            {statusFilter === 'all' ? 'No IPO listings found' : `No ${statusFilter} IPO listings found`}
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredListings.map((listing) => (
                            <Card key={listing.id} padding="none" className="hover:shadow-md transition-shadow">
                                <div className="p-4 flex items-center justify-between">
                                    {/* Left Section - Company Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-base font-semibold text-gray-900">
                                                {listing.companyName}
                                            </h3>
                                            <Badge variant={getStatusBadgeVariant(listing.status)}>
                                                {listing.status.toUpperCase()}
                                            </Badge>
                                            {listing.scripName && (
                                                <Badge variant="neutral">
                                                    {listing.scripName}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-6 text-sm text-gray-600">
                                            <span>
                                                <span className="font-medium">Open:</span> {formatDate(listing.openDate, 'MMM dd, yyyy')} {listing.openTime ? formatTime12Hour(listing.openTime) : ''}
                                            </span>
                                            <span>
                                                <span className="font-medium">Close:</span> {formatDate(listing.closeDate, 'MMM dd, yyyy')} {listing.closeTime ? formatTime12Hour(listing.closeTime) : ''}
                                            </span>
                                            <span>
                                                <span className="font-medium">Price:</span> NPR {listing.pricePerShare}
                                            </span>
                                            <span>
                                                <span className="font-medium">Shares:</span> {listing.totalShares?.toLocaleString() || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Section - Actions */}
                                    <div className="flex items-center gap-2">
                                        <ActionButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewApplications(listing)}
                                            icon={<Users className="w-4 h-4" />}
                                        >
                                            Applications
                                        </ActionButton>
                                        <ActionButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(listing)}
                                            icon={<Edit2 className="w-4 h-4" />}
                                        >
                                            Edit
                                        </ActionButton>
                                        {listing.status === 'open' && (
                                            <ActionButton
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCloseIPO(listing)}
                                            >
                                                Close IPO
                                            </ActionButton>
                                        )}
                                        <ActionButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(listing)}
                                            icon={<Trash2 className="w-4 h-4" />}
                                            className="text-red-600 hover:bg-red-50"
                                        >
                                        </ActionButton>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedListing ? 'Edit IPO Listing' : 'Create IPO Listing'}
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
