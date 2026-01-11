import React, { useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPendingRequests } from './checkerSlice';
import { formatDateTime } from '../../utils/formatters';

export const PendingApprovals: React.FC = () => {
    const dispatch = useAppDispatch();
    const { pendingData, isLoading, error } = useAppSelector((state) => state.checker);

    useEffect(() => {
        dispatch(fetchPendingRequests());
    }, [dispatch]);

    if (isLoading && !pendingData) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    const ipoRequests = pendingData?.ipo || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Pending Share Approvals</h1>
                <Button onClick={() => dispatch(fetchPendingRequests())} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4">
                {ipoRequests.length === 0 ? (
                    <Card className="p-8 text-center text-slate-500">
                        No pending share applications.
                    </Card>
                ) : (
                    ipoRequests.map((req) => (
                        <Card key={req.id} className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-slate-900">{req.companyName}</h3>
                                    <p className="text-sm text-slate-600">Applicant: {req.customer?.fullName} ({req.customer?.customerId})</p>
                                    <div className="mt-1 text-sm font-medium">
                                        {req.quantity} units @ {req.totalAmount}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Applied: {formatDateTime(req.createdAt || new Date().toISOString())}</p>
                                </div>
                                <Badge variant="warning">{req.status}</Badge>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
