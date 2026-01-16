import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAppDispatch } from '../../hooks/useRedux';
import { createTenant, fetchTenants } from '../../store/tenantsSlice';

interface CreateTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateTenantModal: React.FC<CreateTenantModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState<any>({
        companyName: '',
        subdomain: '',
        autoProvision: true,
        databaseHost: 'localhost',
        databasePort: '5432',
        databaseName: '',
        databaseUser: '',
        databasePassword: '',
        planName: 'test',
        billingCycle: 'monthly',
        price: 0,
        contactEmail: '',
        adminEmail: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const payload: any = {
                companyName: formData.companyName,
                subdomain: formData.subdomain,
                autoProvision: formData.autoProvision,
                planName: formData.planName,
                billingCycle: formData.billingCycle,
                price: formData.price,
                contactEmail: formData.contactEmail,
                adminEmail: formData.adminEmail
            };

            if (!formData.autoProvision) {
                payload.databaseHost = formData.databaseHost;
                payload.databaseName = formData.databaseName;
                payload.databaseUser = formData.databaseUser;
                payload.databasePassword = formData.databasePassword;
            }

            await dispatch(createTenant(payload)).unwrap();
            await dispatch(fetchTenants({}));
            handleClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create tenant');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            companyName: '',
            subdomain: '',
            autoProvision: true,
            databaseHost: 'localhost',
            databasePort: '5432',
            databaseName: '',
            databaseUser: '',
            databasePassword: '',
            planName: 'test',
            billingCycle: 'monthly',
            price: 0,
            contactEmail: '',
            adminEmail: ''
        });
        setError('');
        onClose();
    };

    const footer = (
        <>
            <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
            >
                Cancel
            </button>
            <button
                type="submit"
                form="create-tenant-form"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Creating...' : 'Create Tenant'}
            </button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create New Tenant" size="xl" footer={footer}>
            <form id="create-tenant-form" onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            placeholder="Acme Corporation"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subdomain *
                        </label>
                        <div className="flex items-center">
                            <input
                                type="text"
                                required
                                value={formData.subdomain}
                                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="acme"
                            />
                            <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                                .yourapp.com
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Email * (For credentials)
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.contactEmail}
                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            placeholder="owner@acme.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Admin User Email * (For login)
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.adminEmail}
                            onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            placeholder="admin@acme.com"
                        />
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="autoProvision"
                        checked={formData.autoProvision}
                        onChange={(e) => setFormData({ ...formData, autoProvision: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="autoProvision" className="ml-2 text-sm text-gray-700">
                        Auto-provision database (recommended)
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Subscription Plan *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { id: 'test', name: 'Test Plan', cycle: 'monthly', price: 0, desc: '1 Month Trial' },
                            { id: 'silver', name: 'Silver', cycle: 'quarterly', price: 5000, desc: 'Quarterly Package' },
                            { id: 'gold', name: 'Gold', cycle: 'semiannually', price: 9000, desc: 'Semiannual Package' },
                            { id: 'platinum', name: 'Platinum', cycle: 'yearly', price: 18000, desc: 'Annual Package' }
                        ].map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => setFormData({
                                    ...formData,
                                    planName: plan.id,
                                    billingCycle: plan.cycle,
                                    price: plan.price
                                })}
                                className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${formData.planName === plan.id
                                    ? `ring-2 ring-primary-500 border-primary-500 bg-primary-50`
                                    : 'border-gray-200 hover:border-primary-300'
                                    }`}
                            >
                                <h3 className={`font-bold text-base ${plan.id === 'test' ? 'text-green-600' :
                                    plan.id === 'silver' ? 'text-gray-500' :
                                        plan.id === 'gold' ? 'text-yellow-600' :
                                            'text-indigo-600'
                                    } uppercase`}>{plan.name}</h3>
                                <div className="mt-1">
                                    <span className="text-lg font-bold">
                                        {plan.price === 0 ? 'Free' : `NPR ${plan.price.toLocaleString()}`}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 capitalize">{plan.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {!formData.autoProvision && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700">Manual Database Configuration</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Database Host *
                                </label>
                                <input
                                    type="text"
                                    required={!formData.autoProvision}
                                    value={formData.databaseHost}
                                    onChange={(e) => setFormData({ ...formData, databaseHost: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Database Name *
                                </label>
                                <input
                                    type="text"
                                    required={!formData.autoProvision}
                                    value={formData.databaseName}
                                    onChange={(e) => setFormData({ ...formData, databaseName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Database User *
                                </label>
                                <input
                                    type="text"
                                    required={!formData.autoProvision}
                                    value={formData.databaseUser}
                                    onChange={(e) => setFormData({ ...formData, databaseUser: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Database Password *
                                </label>
                                <input
                                    type="password"
                                    required={!formData.autoProvision}
                                    value={formData.databasePassword}
                                    onChange={(e) => setFormData({ ...formData, databasePassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </Modal>
    );
};

export default CreateTenantModal;

