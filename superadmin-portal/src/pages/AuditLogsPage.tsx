import React, { useEffect, useState } from 'react';
import { auditApi } from '../api/apiClient';
import { FileText } from 'lucide-react';

const AuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            setIsLoading(true);
            const data = await auditApi.getLogs({ limit: 100 });
            setLogs(data);
        } catch (error) {
            console.error('Failed to load audit logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getActionBadge = (action: string) => {
        const colors: Record<string, string> = {
            created_tenant: 'bg-green-100 text-green-700',
            suspended_tenant: 'bg-red-100 text-red-700',
            activated_tenant: 'bg-blue-100 text-blue-700',
            approved_payment: 'bg-green-100 text-green-700',
            rejected_payment: 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[action] || 'bg-gray-100 text-gray-700'}`}>
                {action.replace(/_/g, ' ').toUpperCase()}
            </span>
        );
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
                <p className="text-gray-600 mt-1">Track all superadmin actions</p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-gray-500">Loading logs...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getActionBadge(log.action)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {log.superadmin?.name || 'System'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {log.tenant?.companyName || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                {log.ipAddress || 'N/A'}
                                            </code>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogsPage;
