import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, Database, Shield, Users, CreditCard } from 'lucide-react';
import { tenantsApi } from '../api/apiClient';
import AssignLicenseModal from '../components/tenants/AssignLicenseModal.tsx';
import RenewSubscriptionModal from '../components/tenants/RenewSubscriptionModal.tsx';
import TenantUsersList from '../components/tenants/TenantUsersList.tsx';

const TenantDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tenant, setTenant] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            loadTenantDetails(parseInt(id));
        }
    }, [id]);

    const loadTenantDetails = async (tenantId: number) => {
        try {
            setIsLoading(true);
            const data = await tenantsApi.getById(tenantId);
            setTenant(data);
        } catch (error) {
            console.error('Failed to load tenant details:', error);
            navigate('/tenants');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="p-12 text-center text-gray-500">Loading tenant details...</div>;
    }

    if (!tenant) return null;

    const currentSubscription = tenant.subscriptions?.[0]; // Assuming latest is first or single subscription
    const currentLicense = tenant.licenses?.[0]; // Assuming latest is first

    return (
        <div className="p-8">
            <button
                onClick={() => navigate('/tenants')}
                className="flex items-center text-gray-600 mb-6 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tenants
            </button>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Building2 className="w-8 h-8 mr-3 text-primary-600" />
                        {tenant.companyName}
                    </h1>
                    <div className="mt-2 flex items-center space-x-4">
                        <span className="bg-gray-100 px-3 py-1 rounded text-sm text-gray-600 font-mono">
                            {tenant.subdomain}.yourapp.com
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${tenant.status === 'active' ? 'bg-green-100 text-green-700' :
                            tenant.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                                tenant.status === 'expired' ? 'bg-orange-100 text-orange-700' :
                                    tenant.status === 'suspended' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                            }`}>
                            {tenant.status === 'active' ? 'LICENSED (ACTIVE)' : tenant.status.toUpperCase()}
                        </span>
                        <span className="text-gray-500 text-sm flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Created: {new Date(tenant.createdAt || tenant.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setIsLicenseModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        Manage License
                    </button>
                    <button
                        onClick={() => setIsRenewModalOpen(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Manage Subscription
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Database Info */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Database className="w-5 h-5 mr-2 text-gray-500" />
                        Database Configuration
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Host</span>
                            <span className="font-mono text-sm">{tenant.databaseHost}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Database</span>
                            <span className="font-mono text-sm">{tenant.databaseName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">User</span>
                            <span className="font-mono text-sm">{tenant.databaseUser}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Port</span>
                            <span className="font-mono text-sm">{tenant.databasePort}</span>
                        </div>
                    </div>
                </div>

                {/* Subscription Info */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                        Current Subscription
                    </h3>
                    {currentSubscription ? (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Plan</span>
                                <span className="font-medium capitalize">{currentSubscription.planName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <span className="text-green-600 font-medium">Active</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Expires</span>
                                <span className="font-medium">
                                    {new Date(currentSubscription.endDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Billing</span>
                                <span className="capitalize">{currentSubscription.billingCycle}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 italic">No active subscription</div>
                    )}
                </div>

                {/* License Info */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-gray-500" />
                        License Details
                    </h3>
                    {currentLicense ? (
                        <div className="space-y-3">
                            <div>
                                <span className="text-gray-500 block text-xs mb-1">License Key</span>
                                <code className="block bg-gray-50 p-2 rounded text-xs break-all border border-gray-100">
                                    {currentLicense.licenseKey}
                                </code>
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-gray-500">Issued</span>
                                <span className="text-sm">{new Date(currentLicense.issuedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 italic">No license assigned</div>
                    )}
                </div>
            </div>

            {/* Users List */}
            <div className="mb-8">
                <TenantUsersList tenantId={tenant.id} />
            </div>

            <AssignLicenseModal
                isOpen={isLicenseModalOpen}
                onClose={() => {
                    setIsLicenseModalOpen(false);
                    if (id) loadTenantDetails(parseInt(id));
                }}
                tenantId={tenant.id}
            />

            <RenewSubscriptionModal
                isOpen={isRenewModalOpen}
                onClose={() => {
                    setIsRenewModalOpen(false);
                    if (id) loadTenantDetails(parseInt(id));
                }}
                tenantId={tenant.id}
                currentSubscription={currentSubscription}
            />
        </div>
    );
};

export default TenantDetailsPage;
