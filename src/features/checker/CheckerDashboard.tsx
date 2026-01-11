import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPendingRequests, actionRequest } from './checkerSlice';
import { formatDateTime } from '../../utils/formatters';

export const CheckerDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { pendingRequests, isLoading, error } = useAppSelector((state) => state.checker);

    useEffect(() => {
        dispatch(fetchPendingRequests());
    }, [dispatch]);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        await dispatch(actionRequest({ id, action, notes: 'Processed via Dashboard' }));
        // Could show toast notification here
    };

    if (isLoading && pendingRequests.length === 0) {
        return <div className="p-8 text-center">Loading pending requests...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">Error: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Checker Dashboard</h2>
                <p className="text-slate-600">Verify and approve modification requests</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-amber-500 p-3 rounded-lg text-white">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">{pendingRequests.length}</h3>
                                <p className="text-sm text-slate-600">Pending Verification</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* Add more stats as needed */}
            </div>

            {/* Verification Queue */}
            <Card>
                <CardHeader>
                    <CardTitle>Verification Queue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {pendingRequests.map((req) => (
                            <div key={req.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-1">
                                            {req.targetModel} Update
                                        </h4>
                                        <div className="text-sm text-slate-600 space-y-1">
                                            <p><span className="font-medium">Type:</span> {req.changeType}</p>
                                            <p><span className="font-medium">Target ID:</span> {req.targetId}</p>
                                            <p><span className="font-medium">Requester:</span> {req.requester?.name || req.requester?.email || 'Unknown'}</p>
                                        </div>

                                        <div className="mt-3 bg-slate-50 p-3 rounded text-xs overflow-x-auto">
                                            <pre>{JSON.stringify(req.requestedChanges, null, 2)}</pre>
                                        </div>

                                        <p className="text-xs text-slate-500 mt-2">
                                            Submitted {formatDateTime(req.createdAt)}
                                        </p>
                                    </div>
                                    <Badge variant="warning">{req.status}</Badge>
                                </div>
                                <div className="flex space-x-2 justify-end">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="flex items-center space-x-1"
                                        onClick={() => handleAction(req.id, 'approve')}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Approve</span>
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        className="flex items-center space-x-1"
                                        onClick={() => handleAction(req.id, 'reject')}
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span>Reject</span>
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {pendingRequests.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                <CheckCircle className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                                All caught up! No pending requests.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
