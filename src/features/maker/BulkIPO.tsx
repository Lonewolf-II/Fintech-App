import React, { useEffect, useState } from 'react';
import { ipoApi, type IPOListing } from '../../api/ipoApi';
import { customerApi } from '../../api/customerApi';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import { Check, AlertCircle, Loader2, Search, TrendingUp } from 'lucide-react';

interface CustomerSelection {
    id: number;
    fullName: string;
    customerId: string;
    selected: boolean;
    quantity: number;
    status: 'idle' | 'loading' | 'success' | 'error';
    error?: string;
}

export const BulkIPO: React.FC = () => {
    const [openIPOs, setOpenIPOs] = useState<IPOListing[]>([]);
    const [selectedIPOId, setSelectedIPOId] = useState<number | ''>('');
    const [customers, setCustomers] = useState<CustomerSelection[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [globalMessage, setGlobalMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [ipoData, customerData] = await Promise.all([
                    ipoApi.getOpenListings(),
                    customerApi.getAll()
                ]);
                setOpenIPOs(ipoData);
                setCustomers(customerData.map((c: any) => ({
                    id: c.id,
                    fullName: c.fullName,
                    customerId: c.customerId,
                    selected: false,
                    quantity: 10, // Default quantity
                    status: 'idle'
                })));
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        };
        loadInitialData();
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerId.includes(searchTerm)
    );

    const toggleSelectAll = (selected: boolean) => {
        setCustomers(customers.map(c => {
            const isMatch = filteredCustomers.some(fc => fc.id === c.id);
            return isMatch ? { ...c, selected } : c;
        }));
    };

    const handleBulkApply = async () => {
        if (!selectedIPOId) {
            setGlobalMessage({ type: 'error', text: 'Please select an IPO listing.' });
            return;
        }

        const selectedToApply = customers.filter(c => c.selected);
        if (selectedToApply.length === 0) {
            setGlobalMessage({ type: 'error', text: 'No customers selected.' });
            return;
        }

        setIsSubmitting(true);
        setGlobalMessage(null);

        // Update selected icons to loading
        setCustomers(prev => prev.map(c => c.selected ? { ...c, status: 'loading' } : c));

        try {
            const response = await ipoApi.bulkApply(
                Number(selectedIPOId),
                selectedToApply.map(c => ({ customerId: c.id, quantity: Number(c.quantity) }))
            );

            // Update status based on response
            const successIds = response.success.map((s: any) => s.customerId);
            const errorMap = (response.errors || []).reduce((acc: any, curr: any) => {
                acc[curr.customerId] = curr.error;
                return acc;
            }, {});

            setCustomers(prev => prev.map(c => {
                if (successIds.includes(c.id)) {
                    return { ...c, status: 'success', selected: false };
                }
                if (errorMap[c.id]) {
                    return { ...c, status: 'error', error: errorMap[c.id] };
                }
                return c;
            }));

            setGlobalMessage({
                type: 'success',
                text: `Successfully processed ${successIds.length} applications. ${response.errors?.length || 0} failed.`
            });

        } catch (error) {
            setGlobalMessage({ type: 'error', text: 'Failed to process bulk application.' });
            setCustomers(prev => prev.map(c => c.selected ? { ...c, status: 'idle' } : c));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Bulk IPO Application</h1>
                    <p className="text-slate-500">Apply for a single IPO for multiple customers at once.</p>
                </div>
            </div>

            {globalMessage && (
                <div className={`p-4 rounded-lg flex items-center space-x-2 ${globalMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {globalMessage.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span>{globalMessage.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <h2 className="text-lg font-semibold flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                        1. Select IPO
                    </h2>
                    <select
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
                        value={selectedIPOId}
                        onChange={(e) => setSelectedIPOId(e.target.value ? Number(e.target.value) : '')}
                    >
                        <option value="">-- Choose IPO Listing --</option>
                        {openIPOs.map(ipo => (
                            <option key={ipo.id} value={ipo.id}>
                                {ipo.companyName} ({formatCurrency(Number(ipo.pricePerShare))})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                        <h2 className="text-lg font-semibold">2. Select Customers</h2>
                        <div className="relative w-64">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-primary-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-96">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-primary-600"
                                            onChange={(e) => toggleSelectAll(e.target.checked)}
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredCustomers.map(customer => (
                                    <tr key={customer.id} className={customer.selected ? 'bg-primary-50' : ''}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={customer.selected}
                                                onChange={(e) => setCustomers(prev => prev.map(c =>
                                                    c.id === customer.id ? { ...c, selected: e.target.checked } : c
                                                ))}
                                                className="rounded border-slate-300 text-primary-600"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900">{customer.fullName}</div>
                                            <div className="text-xs text-slate-500">{customer.customerId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-16 px-2 py-1 text-sm border rounded"
                                                value={customer.quantity}
                                                onChange={(e) => setCustomers(prev => prev.map(c =>
                                                    c.id === customer.id ? { ...c, quantity: Number(e.target.value) } : c
                                                ))}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {customer.status === 'loading' && <Loader2 className="w-5 h-5 animate-spin text-primary-600 mx-auto" />}
                                            {customer.status === 'success' && <Check className="w-5 h-5 text-green-600 mx-auto" />}
                                            {customer.status === 'error' && (
                                                <div className="group relative cursor-help">
                                                    <AlertCircle className="w-5 h-5 text-red-600 mx-auto" />
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {customer.error}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
                        <span className="text-sm text-slate-600">
                            {customers.filter(c => c.selected).length} customers selected
                        </span>
                        <Button
                            onClick={handleBulkApply}
                            isLoading={isSubmitting}
                            disabled={!selectedIPOId || customers.filter(c => c.selected).length === 0}
                        >
                            Apply for IPO
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
