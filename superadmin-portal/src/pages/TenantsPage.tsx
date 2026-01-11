import React, { useEffect, useState } from 'react';
import { tenantsApi } from '../api/apiClient';
import { Plus, Search, Power, PowerOff, Building2 } from 'lucide-react';

const TenantsPage: React.FC = () => {
    const [tenants, setTenants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        loadTenants();
    }, [statusFilter]);

    const loadTenants = async () => {
        try {
            setIsLoading(true);
            const data = await tenantsApi.getAll({ status: statusFilter || undefined, search: searchTerm || undefined });
            setTenants(data);
        } catch (error) {
            console.error('Failed to load tenants:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuspend = async (id: number) => {
        if (!confirm('Are you sure you want to suspend this tenant?')) return;
        try {
            await tenantsApi.suspend(id, 'Suspended by admin');
            loadTenants();
        } catch (error) {
            alert('Failed to suspend tenant');
        }
    };

    const handleActivate = async (id: number) => {
        try {
            await tenantsApi.activate(id);
            loadTenants();
        } catch (error) {
            alert('Failed to activate tenant');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-green-100 text-green-700',
            suspended: 'bg-red-100 text-red-700',
            trial: 'bg-yellow-100 text-yellow-700',
            expired: 'bg-gray-100 text-gray-700'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.trial}`}>
                {status.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
                <p className="text-gray-600 mt-1">Manage all client companies and their access</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tenants..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && loadTenants()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="trial">Trial</option>
                        <option value="suspended">Suspended</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>
            </div>

            {/* Tenants List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">All Tenants ({tenants.length})</h2>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                        <Plus className="w-5 h-5" />
                        <span>Create Tenant</span>
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-gray-500">Loading tenants...</div>
                ) : tenants.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No tenants found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subdomain</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="bg-primary-100 p-2 rounded-lg mr-3">
                                                    <Building2 className="w-5 h-5 text-primary-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{tenant.companyName}</div>
                                                    <div className="text-xs text-gray-500">ID: {tenant.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <code className="bg-gray-100 px-2 py-1 rounded">{tenant.subdomain}</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(tenant.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(tenant.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {tenant.status === 'active' || tenant.status === 'trial' ? (
                                                    <button
                                                        onClick={() => handleSuspend(tenant.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Suspend"
                                                    >
                                                        <PowerOff className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleActivate(tenant.id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Activate"
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
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

export default TenantsPage;
