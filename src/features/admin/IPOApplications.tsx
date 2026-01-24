import React, { useEffect, useState } from 'react';
import { ipoApi, type IPOApplication } from '../../api/ipoApi';
import { Button } from '../../components/common/Button';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const IPOApplications: React.FC = () => {
    const [applications, setApplications] = useState<IPOApplication[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const data = await ipoApi.getApplications();
            setApplications(data);
        } catch (error) {
            console.error('Failed to fetch applications', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this application? This will unblock any held funds.')) return;

        try {
            await ipoApi.deleteApplication(id);
            setApplications(prev => prev.filter(app => String(app.id) !== id));
        } catch (error) {
            console.error('Failed to delete application', error);
            alert('Failed to delete application');
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    if (isLoading) return <div className="text-slate-500 p-6">Loading applications...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">IPO Applications</h1>
                    <p className="text-slate-500">View and manage all IPO applications</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Applicant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {applications.map((app) => (
                            <tr key={app.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {app.customer?.fullName}
                                    <div className="text-xs text-slate-500">{app.customerId}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{app.companyName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(Number(app.totalAmount))}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${app.status === 'verified' || app.status === 'allotted' ? 'bg-green-100 text-green-800' :
                                            app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {app.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {new Date(app.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-900 hover:bg-red-50"
                                        onClick={() => handleDelete(String(app.id))}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {applications.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No applications found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
