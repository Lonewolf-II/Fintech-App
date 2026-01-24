import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ipoApi } from '../../api/ipoApi';
import type { IPOApplication, IPOListing } from '../../api/ipoApi';
import { Button } from '../../components/common/Button';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const IPOAllotmentPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [listing, setListing] = useState<IPOListing | null>(null);
    const [applications, setApplications] = useState<IPOApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedApps, setSelectedApps] = useState<number[]>([]);
    const [allotmentQuantity, setAllotmentQuantity] = useState<number>(10); // Default or calculated
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // Fetch Listing
                // Ideally getListings and find, or specific endpoint. 
                // We don't have getListingById in api yet, but we can filter from all listings or just use listing from previous page state if passed.
                // For robustness, let's fetch all listings and find one.
                const listings = await ipoApi.getListings();
                const found = listings.find(l => l.id === parseInt(id));
                setListing(found || null);

                // Fetch Verified Applications
                const apps = await ipoApi.getApplications({
                    ipoListingId: id,
                    status: 'verified'
                });
                setApplications(apps);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedApps(applications.map(a => a.id));
        } else {
            setSelectedApps([]);
        }
    };

    const handleSelect = (appId: number) => {
        if (selectedApps.includes(appId)) {
            setSelectedApps(selectedApps.filter(id => id !== appId));
        } else {
            setSelectedApps([...selectedApps, appId]);
        }
    };

    const processAllotment = async (status: 'allotted' | 'not_allotted') => {
        if (selectedApps.length === 0) return;
        if (!confirm(`Are you sure you want to mark ${selectedApps.length} applications as ${status}?`)) return;

        setIsSubmitting(true);
        let successCount = 0;
        let failCount = 0;

        for (const appId of selectedApps) {
            try {
                await ipoApi.allotApplication(appId, {
                    status,
                    allotmentQuantity: status === 'allotted' ? allotmentQuantity : 0
                });
                successCount++;
            } catch (error) {
                console.error(`Failed to allot app ${appId}`, error);
                failCount++;
            }
        }

        toast.success(`Processed: ${successCount} success, ${failCount} failed`);
        setIsSubmitting(false);
        // Refresh
        const apps = await ipoApi.getApplications({
            ipoListingId: id,
            status: 'verified'
        });
        setApplications(apps);
        setSelectedApps([]);
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!listing) return <div className="p-8 text-center">IPO Listing not found</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Process Allotment: {listing.companyName}</h1>
                    <p className="text-slate-600">Total Verified Applications: {applications.length}</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6 border border-slate-200">
                <div className="flex items-end gap-4 p-4 bg-slate-50 rounded mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Allotment Quantity (Per User)</label>
                        <input
                            type="number"
                            value={allotmentQuantity}
                            onChange={(e) => setAllotmentQuantity(parseInt(e.target.value) || 0)}
                            className="px-3 py-2 border rounded border-slate-300 w-32"
                        />
                    </div>
                    <div>
                        <Button
                            onClick={() => processAllotment('allotted')}
                            disabled={isSubmitting || selectedApps.length === 0}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Allot Selected ({selectedApps.length})
                        </Button>
                    </div>
                    <div>
                        <Button
                            onClick={() => processAllotment('not_allotted')}
                            disabled={isSubmitting || selectedApps.length === 0}
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject / Not Allotted ({selectedApps.length})
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={selectedApps.length > 0 && selectedApps.length === applications.length}
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Applied Qty</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount Blocked</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {applications.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                        No verified applications pending allotment.
                                    </td>
                                </tr>
                            ) : (
                                applications.map(app => (
                                    <tr key={app.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedApps.includes(app.id)}
                                                onChange={() => handleSelect(app.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">{app.customer?.fullName || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">{app.customer?.customerId}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-900 font-mono">{app.quantity}</td>
                                        <td className="px-4 py-3 text-slate-900 font-mono">NPR {app.totalAmount}</td>
                                        <td className="px-4 py-3 text-slate-600 text-sm">{new Date(app.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                {app.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
