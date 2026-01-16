import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTenants, activateTenant } from '../store/tenantsSlice';
import { AppDispatch, RootState } from '../store';
import { RotateCcw, AlertCircle } from 'lucide-react';

const InactiveTenantsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { tenants, loading, error } = useSelector((state: RootState) => state.tenants);

    useEffect(() => {
        // Fetch only inactive tenants
        dispatch(fetchTenants({ status: 'inactive' }));
    }, [dispatch]);

    const handleRestore = async (id: number) => {
        if (!confirm('Are you sure you want to restore this tenant? They will be moved back to the active list.')) return;
        try {
            await dispatch(activateTenant(id)).unwrap();
            // Refresh list
            dispatch(fetchTenants({ status: 'inactive' }));
        } catch (error) {
            alert('Failed to restore tenant');
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Inactive Tenants</h1>
                <p className="text-gray-600 mt-1">Manage and restore deleted tenants</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Deleted Tenants ({tenants.length})</h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading tenants...</div>
                ) : tenants.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No inactive tenants found</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {tenants.map((tenant) => (
                            <div key={tenant.id} className="p-6 hover:bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center space-x-3 mb-1">
                                            <h3 className="text-lg font-semibold text-gray-900">{tenant.companyName}</h3>
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full uppercase">
                                                Inactive
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            <p>Subdomain: {tenant.subdomain}</p>
                                            <p>Database: {tenant.databaseName}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRestore(tenant.id)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        <span>Restore Tenant</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InactiveTenantsPage;
