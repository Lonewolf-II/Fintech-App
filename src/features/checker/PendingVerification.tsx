import React, { useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPendingRequests } from './checkerSlice';
import { formatDateTime } from '../../utils/formatters';

import { useNavigate } from 'react-router-dom';

export const PendingVerification: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { pendingData, isLoading, error } = useAppSelector((state) => state.checker);

    useEffect(() => {
        dispatch(fetchPendingRequests());
    }, [dispatch]);



    if (isLoading && !pendingData) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    const kycRequests = pendingData?.kyc || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Pending Account Verification</h1>
                <Button onClick={() => dispatch(fetchPendingRequests())} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4">
                {kycRequests.length === 0 ? (
                    <Card className="p-8 text-center text-slate-500">
                        No pending account verifications.
                    </Card>
                ) : (
                    kycRequests.map((req) => (
                        <Card key={req.id} className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-slate-900">{req.fullName}</h3>
                                    <p className="text-sm text-slate-500">{req.email}</p>
                                    <p className="text-xs text-slate-400 mt-1">Submitted: {formatDateTime(req.created_at || req.createdAt || new Date().toISOString())}</p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Badge variant="warning">Pending KYC</Badge>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => navigate(`/checker/customers/${req.id}`)}
                                    >
                                        Review
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
