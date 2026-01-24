import React, { useEffect, useState } from 'react';
import { ipoApi } from '../../api/ipoApi';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface IPOApplication {
    id: number;
    customerId: number;
    companyName: string;
    quantity: number;
    pricePerShare: number;
    totalAmount: number;
    status: string;
    allotmentStatus?: string;
    customer?: {
        fullName: string;
        customerId: string;
    };
}

interface AllotmentRow {
    application: IPOApplication;
    allotmentStatus: 'allotted' | 'not_allotted';
    allotmentQuantity: number;
    isProcessing: boolean;
    isProcessed: boolean;
    error?: string;
}

export const IPOAllotmentProcessing: React.FC = () => {
    const [applications, setApplications] = useState<AllotmentRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'processed'>('pending');

    useEffect(() => {
        loadVerifiedApplications();
    }, []);

    const loadVerifiedApplications = async () => {
        try {
            setIsLoading(true);
            const data = await ipoApi.getApplications();

            // Filter only verified applications
            const verifiedApps = data.filter((app: IPOApplication) => app.status === 'verified');

            setApplications(verifiedApps.map((app: IPOApplication) => ({
                application: app,
                allotmentStatus: 'allotted',
                allotmentQuantity: app.quantity, // Default to full quantity
                isProcessing: false,
                isProcessed: app.allotmentStatus !== 'pending',
            })));
        } catch (error) {
            console.error('Failed to load applications:', error);
            toast.error('Failed to load IPO applications');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAllotmentStatusChange = (index: number, status: 'allotted' | 'not_allotted') => {
        setApplications(prev => prev.map((row, i) =>
            i === index ? { ...row, allotmentStatus: status } : row
        ));
    };

    const handleQuantityChange = (index: number, quantity: number) => {
        setApplications(prev => prev.map((row, i) =>
            i === index ? { ...row, allotmentQuantity: Math.min(quantity, row.application.quantity) } : row
        ));
    };

    const processAllotment = async (index: number) => {
        const row = applications[index];

        setApplications(prev => prev.map((r, i) =>
            i === index ? { ...r, isProcessing: true, error: undefined } : r
        ));

        try {
            await ipoApi.allotApplication(row.application.id, {
                allotmentStatus: row.allotmentStatus,
                allotmentQuantity: row.allotmentStatus === 'allotted' ? row.allotmentQuantity : 0,
            });

            setApplications(prev => prev.map((r, i) =>
                i === index ? { ...r, isProcessing: false, isProcessed: true } : r
            ));

            toast.success(`Allotment processed for ${row.application.customer?.fullName}`);
        } catch (error: any) {
            setApplications(prev => prev.map((r, i) =>
                i === index ? { ...r, isProcessing: false, error: error.response?.data?.error || 'Failed to process' } : r
            ));
            toast.error(`Failed to process allotment: ${error.response?.data?.error || 'Unknown error'}`);
        }
    };

    const filteredApplications = applications.filter(row => {
        if (filter === 'pending') return !row.isProcessed;
        if (filter === 'processed') return row.isProcessed;
        return true;
    });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">IPO Allotment Processing</h1>
                    <p className="text-slate-500">Process allotment results for verified IPO applications</p>
                </div>
                <Button onClick={loadVerifiedApplications} variant="outline">
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Pending</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {applications.filter(r => !r.isProcessed).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Processed</p>
                            <p className="text-2xl font-bold text-green-600">
                                {applications.filter(r => r.isProcessed).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Total</p>
                            <p className="text-2xl font-bold text-slate-900">{applications.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                ? 'bg-primary-500 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending'
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('processed')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'processed'
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Processed
                    </button>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Applied Qty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Total Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Allotment Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Allotted Qty</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredApplications.map((row, index) => {
                                const actualIndex = applications.indexOf(row);
                                return (
                                    <tr key={row.application.id} className={row.isProcessed ? 'bg-slate-50' : 'hover:bg-slate-50'}>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{row.application.customer?.fullName}</div>
                                            <div className="text-xs text-slate-500">{row.application.customer?.customerId}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-900">{row.application.companyName}</td>
                                        <td className="px-6 py-4 text-slate-900">{row.application.quantity}</td>
                                        <td className="px-6 py-4 text-slate-900">{formatCurrency(row.application.totalAmount)}</td>
                                        <td className="px-6 py-4">
                                            {row.isProcessed ? (
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${row.allotmentStatus === 'allotted'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {row.allotmentStatus === 'allotted' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {row.allotmentStatus === 'allotted' ? 'Allotted' : 'Not Allotted'}
                                                </span>
                                            ) : (
                                                <select
                                                    value={row.allotmentStatus}
                                                    onChange={(e) => handleAllotmentStatusChange(actualIndex, e.target.value as 'allotted' | 'not_allotted')}
                                                    className="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500"
                                                    disabled={row.isProcessing}
                                                >
                                                    <option value="allotted">Allotted</option>
                                                    <option value="not_allotted">Not Allotted</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {row.isProcessed ? (
                                                <span className="text-slate-900">{row.allotmentQuantity}</span>
                                            ) : row.allotmentStatus === 'allotted' ? (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={row.application.quantity}
                                                    value={row.allotmentQuantity}
                                                    onChange={(e) => handleQuantityChange(actualIndex, parseInt(e.target.value) || 0)}
                                                    className="w-20 px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500"
                                                    disabled={row.isProcessing}
                                                />
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {row.isProcessed ? (
                                                <span className="text-green-600 text-sm font-medium">✓ Processed</span>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => processAllotment(actualIndex)}
                                                    isLoading={row.isProcessing}
                                                    disabled={row.isProcessing}
                                                >
                                                    Process
                                                </Button>
                                            )}
                                            {row.error && (
                                                <div className="text-xs text-red-600 mt-1">{row.error}</div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
