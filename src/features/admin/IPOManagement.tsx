import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ipoApi, type IPOListing, type IPOApplication } from '../../api/ipoApi';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Plus, TrendingUp, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const ipoSchema = z.object({
    companyName: z.string().min(1, 'Company name is required'),
    pricePerShare: z.string().min(1, 'Price per share is required'),
    totalShares: z.string().min(1, 'Total shares is required'),
    openDate: z.string().min(1, 'Open date is required'),
    closeDate: z.string().min(1, 'Close date is required'),
    description: z.string().optional(),
});

type IPOFormData = z.infer<typeof ipoSchema>;

export const IPOManagement: React.FC = () => {
    const [listings, setListings] = useState<IPOListing[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<IPOFormData>({
        resolver: zodResolver(ipoSchema),
    });

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

    const onCreateIPO = async (data: IPOFormData) => {
        try {
            setIsLoading(true);
            await ipoApi.createListing({
                ...data,
                totalShares: parseInt(data.totalShares),
                pricePerShare: data.pricePerShare // Assuming backend handles string/decimal conversion
            });
            fetchListings();
            setIsCreateModalOpen(false);
            reset();
        } catch (error) {
            console.error('Failed to create IPO:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onUpdateStatus = async (id: number, status: string) => {
        try {
            await ipoApi.updateStatus(id, status);
            fetchListings();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">IPO Management</h1>
                    <p className="text-slate-500">Create and manage Initial Public Offerings</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
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
                                    {formatCurrency(parseFloat(ipo.pricePerShare))}
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

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New IPO">
                <form onSubmit={handleSubmit(onCreateIPO)} className="space-y-4">
                    <Input
                        label="Company Name"
                        {...register('companyName')}
                        error={errors.companyName?.message}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Price per Share"
                            type="number"
                            step="0.01"
                            {...register('pricePerShare')}
                            error={errors.pricePerShare?.message}
                        />
                        <Input
                            label="Total Shares"
                            type="number"
                            {...register('totalShares')}
                            error={errors.totalShares?.message}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Open Date"
                            type="date"
                            {...register('openDate')}
                            error={errors.openDate?.message}
                        />
                        <Input
                            label="Close Date"
                            type="date"
                            {...register('closeDate')}
                            error={errors.closeDate?.message}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                        <textarea
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            rows={3}
                            {...register('description')}
                        ></textarea>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Create IPO
                        </Button>
                    </div>

                </form>
            </Modal>

            {/* IPO Applications List - Admin View */}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Applications</h2>
                <IPOApplicationList />
            </div>
        </div >
    );
};

const IPOApplicationList: React.FC = () => {
    const [applications, setApplications] = useState<IPOApplication[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            // Reusing getIPOApplications from ipoApi which fetches all
            // Ideally we might want a specific admin endpoint with pagination, but this works for now
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
            setApplications(prev => prev.filter(app => app.id !== id));
        } catch (error) {
            console.error('Failed to delete application', error);
            alert('Failed to delete application');
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    if (isLoading) return <div className="text-slate-500">Loading applications...</div>;

    return (
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
                                    ${app.status === 'verified' ? 'bg-green-100 text-green-800' :
                                        app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {app.status}
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
                                    onClick={() => handleDelete(app.id)}
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
    );
};
