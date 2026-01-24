import React, { useEffect, useState } from 'react';
import { ipoApi, type IPOListing } from '../../api/ipoApi';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Plus, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { IPOListingForm } from '../../features/ipo/components/IPOListingForm';

export const IPOManagement: React.FC = () => {
    const [listings, setListings] = useState<IPOListing[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState<IPOListing | null>(null);

    const fetchListings = async () => {
        try {
            const data = await ipoApi.getListings();
            setListings(data);
        } catch (error) {
            console.error('Failed to fetch IPO listings:', error);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const onUpdateStatus = async (id: number, status: string) => {
        try {
            await ipoApi.updateStatus(id, status);
            fetchListings();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleSuccess = () => {
        setIsCreateModalOpen(false);
        setSelectedListing(null);
        fetchListings();
    };

    const onDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this IPO listing?')) {
            try {
                await ipoApi.deleteListing(id); // Using direct API to match existing pattern, or dispatch if we switch
                fetchListings();
            } catch (error) {
                console.error('Failed to delete listing:', error);
            }
        }
    };

    const onEdit = (ipo: IPOListing) => {
        setSelectedListing(ipo);
        setIsCreateModalOpen(true);
    };

    const onView = (ipo: IPOListing) => {
        // For now, view can just be opening the edit modal in a "read" context or just showing it
        // We'll reuse the edit modal for viewing details as it populates the form
        setSelectedListing(ipo);
        setIsCreateModalOpen(true);
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">IPO Management</h1>
                    <p className="text-slate-500">Create and manage Initial Public Offerings</p>
                </div>
                <Button onClick={() => {
                    setSelectedListing(null);
                    setIsCreateModalOpen(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New IPO
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Shares</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timeline</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {listings.map((ipo) => (
                            <tr key={ipo.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                            <TrendingUp className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">{ipo.companyName}</div>
                                            <div className="text-xs text-slate-500 line-clamp-1">{ipo.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">
                                    {formatCurrency(ipo.pricePerShare)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                    {ipo.totalShares.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    <div className="flex flex-col">
                                        <span className="flex items-center text-xs">
                                            <span className="w-12">Open:</span>
                                            <span className="font-medium text-slate-700">{ipo.openDate}</span>
                                        </span>
                                        <span className="flex items-center text-xs mt-1">
                                            <span className="w-12">Close:</span>
                                            <span className="font-medium text-slate-700">{ipo.closeDate}</span>
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${ipo.status === 'open' ? 'bg-green-100 text-green-800' :
                                            ipo.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                                ipo.status === 'closed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {ipo.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <div className="flex items-center space-x-2">
                                        {/* Status Actions */}
                                        {ipo.status === 'upcoming' && (
                                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => onUpdateStatus(ipo.id, 'open')}>
                                                Open
                                            </Button>
                                        )}
                                        {ipo.status === 'open' && (
                                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => onUpdateStatus(ipo.id, 'closed')}>
                                                Close
                                            </Button>
                                        )}
                                        {ipo.status === 'closed' && (
                                            <Button size="sm" variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50" onClick={() => onUpdateStatus(ipo.id, 'allotted')}>
                                                Allot
                                            </Button>
                                        )}

                                        {/* Management Actions */}
                                        <button type="button" onClick={() => onView(ipo)} className="p-1 text-slate-400 hover:text-blue-600 transition-colors" title="View Details">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={() => onEdit(ipo)} className="p-1 text-slate-400 hover:text-orange-600 transition-colors" title="Edit">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={() => onDelete(ipo.id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {listings.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No IPO listings found. Create one to get started.
                    </div>
                )}
            </div>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={selectedListing ? "Edit IPO Listing" : "Create New IPO"}
                size="lg"
            >
                <IPOListingForm
                    listing={selectedListing}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>
        </div>
    );
};
