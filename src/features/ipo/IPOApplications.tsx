import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchApplications, verifyApplication, fetchListings } from '../ipoSlice';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { IPOApplicationForm } from './components/IPOApplicationForm';
import { AllotmentModal } from './components/AllotmentModal';
import { Check, X, Search, Filter } from 'lucide-react';
import type { IPOApplication } from '../../types/business.types';

export const IPOApplications: React.FC = () => {
    const dispatch = useAppDispatch();
    const { applications, listings, isLoading } = useAppSelector((state) => state.ipo);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<IPOApplication | null>(null);
    const [isAllotModalOpen, setIsAllotModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchApplications());
        dispatch(fetchListings());
    }, [dispatch]);

    const filteredApplications = applications.filter((app) => {
        const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
        const matchesSearch =
            app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.customerId.toString().includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    const handleVerify = async (id: number) => {
        if (window.confirm('Are you sure you want to verify this application? This will block funds.')) {
            await dispatch(verifyApplication({ id, status: 'verified' }));
        }
    };

    const handleReject = async (id: number) => {
        if (window.confirm('Are you sure you want to reject this application?')) {
            await dispatch(verifyApplication({ id, status: 'rejected' }));
        }
    };

    const handleAllot = (app: IPOApplication) => {
        setSelectedApplication(app);
        setIsAllotModalOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'verified': return 'bg-blue-100 text-blue-800';
            case 'allotted': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">IPO Applications</h1>
                    <p className="text-slate-600">Process and manage IPO applications</p>
                </div>
                <Button onClick={() => setIsApplyModalOpen(true)}>
                    New Application
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by company or customer ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="text-slate-400 w-5 h-5" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="allotted">Allotted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <p className="text-slate-600">Loading applications...</p>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-slate-600">No applications found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">App ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredApplications.map((app) => (
                                <tr key={app.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">#{app.id}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">ID: {app.customerId}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900">{app.companyName}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{app.quantity}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">NPR {Number(app.totalAmount).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {app.status === 'pending' && (
                                            <>
                                                <Button size="sm" onClick={() => handleVerify(app.id)} className="bg-green-600 hover:bg-green-700">
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleReject(app.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                        {app.status === 'verified' && (
                                            <Button size="sm" onClick={() => handleAllot(app)}>
                                                Allot
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Apply Modal */}
            <Modal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                title="New IPO Application"
                size="lg"
            >
                <IPOApplicationForm
                    listing={null}
                    listings={listings}
                    onSuccess={() => setIsApplyModalOpen(false)}
                    onCancel={() => setIsApplyModalOpen(false)}
                />
            </Modal>

            {/* Allotment Modal */}
            <Modal
                isOpen={isAllotModalOpen}
                onClose={() => {
                    setIsAllotModalOpen(false);
                    setSelectedApplication(null);
                }}
                title="Process IPO Allotment"
            >
                {selectedApplication && (
                    <AllotmentModal
                        application={selectedApplication}
                        onSuccess={() => {
                            setIsAllotModalOpen(false);
                            setSelectedApplication(null);
                        }}
                        onCancel={() => {
                            setIsAllotModalOpen(false);
                            setSelectedApplication(null);
                        }}
                    />
                )}
            </Modal>
        </div>
    );
};
