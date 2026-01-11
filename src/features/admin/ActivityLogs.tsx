import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchActivityLogs } from './adminSlice';
import { formatDateTime } from '../../utils/formatters';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export const ActivityLogs: React.FC = () => {
    const dispatch = useAppDispatch();
    const { logs, totalPages, currentPage, isLoading } = useAppSelector((state) => state.admin);
    const [page, setPage] = useState(1);
    const [filterAction, setFilterAction] = useState('');

    useEffect(() => {
        dispatch(fetchActivityLogs({ page, action: filterAction || undefined }));
    }, [dispatch, page, filterAction]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on search
        dispatch(fetchActivityLogs({ page: 1, action: filterAction || undefined }));
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Activity Logs</h1>

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Action</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="e.g. LOGIN, APPROVE_KYC"
                                className="pl-9 w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                            />
                        </div>
                    </div>
                </form>
            </Card>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Entity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">IP</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-slate-500">Loading logs...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-slate-500">No logs found</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {formatDateTime(log.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{log.user?.name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">{log.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {log.entityType ? `${log.entityType} (${log.entityId})` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                                            {JSON.stringify(log.details)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {log.ipAddress || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <Button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || isLoading}
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || isLoading}
                        >
                            Next
                        </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-slate-700">
                                Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1 || isLoading}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
                                >
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || isLoading}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
                                >
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
