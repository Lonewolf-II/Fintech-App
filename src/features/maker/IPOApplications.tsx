import React, { useEffect, useState } from 'react';
import { ipoApi, type IPOApplication } from '../../api/ipoApi';
import { Button } from '../../components/common/Button';
import { CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const IPOApplications: React.FC = () => {
    const [applications, setApplications] = useState<IPOApplication[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            // Fetch all, or filter by verified/pending
            // Maker cares about those ready for allotment (Verified) or Pending
            const data = await ipoApi.getApplications();
            // We can filter client side or API side. API supports status filtering.
            // Let's fetch all to show history too.
            setApplications(data);
        } catch (error) {
            console.error('Failed to fetch applications', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAllotment = async (id: string, decision: 'allotted' | 'not_allotted', qty?: number) => {
        if (!window.confirm(`Are you sure you want to mark this application as ${decision.toUpperCase()}?`)) return;

        setProcessingId(id);
        try {
            await ipoApi.allotApplication(id, decision, qty);
            // Refresh list
            fetchApplications();
            alert(`Application marked as ${decision}`);
        } catch (error: any) {
            console.error('Allotment failed', error);
            alert(error.response?.data?.error || 'Allotment action failed');
        } finally {
            setProcessingId(null);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    // Helper: Can allot?
    const canAllot = (app: any) => {
        return app.status === 'verified' && app.listing?.status === 'allotted';
    };

    const filteredApps = applications.filter(app => app.status === 'verified');

    if (isLoading) return <div className="text-slate-500 p-6">Loading applications...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">IPO Allotment Management</h1>
                    <p className="text-slate-500">Manage allotment for verified applications (when Listing is in Allotment Phase)</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Applicant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Req. Qty</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phase</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredApps.map((app: any) => (
                            <tr key={app.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {app.customer?.fullName}
                                    <div className="text-xs text-slate-500">{app.customerId}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {app.companyName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{app.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(Number(app.totalAmount))}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${app.listing?.status === 'allotted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {app.listing?.status?.toUpperCase() || 'UNKNOWN'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {canAllot(app) ? (
                                        <>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                disabled={processingId === String(app.id)}
                                                onClick={() => handleAllotment(String(app.id), 'allotted', app.quantity)}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Allot
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                disabled={processingId === String(app.id)}
                                                onClick={() => handleAllotment(String(app.id), 'not_allotted')}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Reject
                                            </Button>
                                        </>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">
                                            {app.listing?.status !== 'allotted' ? 'Listing not in Allotment phase' : 'Action unavailable'}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredApps.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No verified applications ready for allotment</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
