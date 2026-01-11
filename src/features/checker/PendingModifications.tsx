import React, { useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { RefreshCw, CheckCircle, XCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPendingRequests, actionRequest } from './checkerSlice';
import { formatDateTime } from '../../utils/formatters';

export const PendingModifications: React.FC = () => {
    const dispatch = useAppDispatch();
    const { pendingData, isLoading, error } = useAppSelector((state) => state.checker);

    useEffect(() => {
        dispatch(fetchPendingRequests());
    }, [dispatch]);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        try {
            await dispatch(actionRequest({ id, action, notes: 'Processed via Dashboard' })).unwrap();
        } catch (err) {
            console.error('Failed to action request:', err);
        }
    };

    if (isLoading && !pendingData) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    const modifications = pendingData?.modifications || [];

    // Helper to render comparison
    const renderComparison = (req: any) => {
        const changes = req.requestedChanges || {};
        const current = req.currentData || {};

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Current Value</h4>
                    {Object.keys(changes).map(key => (
                        <div key={key} className="mb-2">
                            <span className="text-xs text-slate-400 block">{key}</span>
                            <span className="text-sm font-medium text-slate-600">
                                {String(current[key] !== undefined ? current[key] : 'N/A')}
                            </span>
                        </div>
                    ))}
                </div>
                <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Requested Value</h4>
                    {Object.keys(changes).map(key => (
                        <div key={key} className="mb-2">
                            <span className="text-xs text-slate-400 block">{key}</span>
                            <span className="text-sm font-bold text-blue-600 flex items-center gap-2">
                                {String(changes[key])}
                                <ArrowRight className="w-3 h-3 text-blue-400" />
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Pending Modifications</h1>
                <Button onClick={() => dispatch(fetchPendingRequests())} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4">
                {modifications.length === 0 ? (
                    <Card className="p-8 text-center text-slate-500">
                        No pending modification requests.
                    </Card>
                ) : (
                    modifications.map((req) => (
                        <Card key={req.id} className="p-4 transition-all hover:shadow-md">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant={req.changeType === 'update' ? 'warning' : 'info'}>
                                                {req.changeType.toUpperCase()}
                                            </Badge>
                                            <span className="font-medium text-slate-900">
                                                {req.targetModel} #{req.targetId}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            Requested by: <span className="font-medium">{req.requester?.name}</span>
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {formatDateTime(req.created_at || req.createdAt || new Date().toISOString())}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleAction(req.id, 'approve')}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleAction(req.id, 'reject')}
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                            <XCircle className="w-4 h-4 mr-1" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>

                                {renderComparison(req)}

                                {req.changeType === 'delete' && (
                                    <div className="bg-red-50 p-3 rounded text-red-700 text-sm flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        This action will permanently delete this record.
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
