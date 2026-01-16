import React, { useEffect, useState } from 'react';
import { paymentsApi } from '../api/apiClient';
import { Check, X, Eye } from 'lucide-react';

const PaymentsPage: React.FC = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            setIsLoading(true);
            const data = await paymentsApi.getPending();
            setPayments(data);
        } catch (error) {
            console.error('Failed to load payments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm('Approve this payment and renew subscription?')) return;
        try {
            await paymentsApi.approve(id);
            loadPayments();
            alert('Payment approved successfully!');
        } catch (error) {
            alert('Failed to approve payment');
        }
    };

    const handleReject = async (id: number) => {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;
        try {
            await paymentsApi.reject(id, reason);
            loadPayments();
            alert('Payment rejected');
        } catch (error) {
            alert('Failed to reject payment');
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Payment Verification</h1>
                <p className="text-gray-600 mt-1">Review and approve payment submissions</p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Pending Payments ({payments.length})</h2>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-gray-500">Loading payments...</div>
                ) : payments.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No pending payments</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {payments.map((payment) => (
                            <div key={payment.id} className="p-6 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {payment.tenant?.companyName || 'Unknown Tenant'}
                                            </h3>
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                                PENDING
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Invoice:</span>
                                                <span className="ml-2 font-medium">{payment.invoiceNumber}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Amount:</span>
                                                <span className="ml-2 font-medium">NPR {payment.amount}</span>
                                            </div>
                                            {payment.subscription && (
                                                <>
                                                    <div className="col-span-2 sm:col-span-1">
                                                        <span className="text-gray-500">Package:</span>
                                                        <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs uppercase font-semibold">
                                                            {payment.subscription.planName}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2 sm:col-span-1">
                                                        <span className="text-gray-500">Expiry/Renewal:</span>
                                                        <span className="ml-2 font-medium">
                                                            {new Date(payment.subscription.endDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                            <div>
                                                <span className="text-gray-500">Method:</span>
                                                <span className="ml-2">{payment.paymentMethod === 'qr_code' ? 'UPI/QR' : 'Bank Transfer'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Submitted:</span>
                                                <span className="ml-2">{new Date(payment.submittedAt).toLocaleString()}</span>
                                            </div>
                                            {payment.utrNumber && (
                                                <div className="col-span-2">
                                                    <span className="text-gray-500">UTR:</span>
                                                    <code className="ml-2 bg-gray-100 px-2 py-1 rounded">{payment.utrNumber}</code>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        {payment.paymentSlipUrl && (
                                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Slip">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleApprove(payment.id)}
                                            className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                            <span>Approve</span>
                                        </button>
                                        <button
                                            onClick={() => handleReject(payment.id)}
                                            className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Reject</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentsPage;
