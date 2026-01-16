import React, { useState } from 'react';
import Modal from '../common/Modal';
import { subscriptionsApi } from '../../api/apiClient';

interface RenewSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenantId: number;
    currentSubscription: any;
}

const RenewSubscriptionModal: React.FC<RenewSubscriptionModalProps> = ({ isOpen, onClose, tenantId, currentSubscription }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        endDate: currentSubscription ? currentSubscription.endDate : '',
        autoRenew: currentSubscription ? currentSubscription.autoRenew : false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (currentSubscription) {
                await subscriptionsApi.update(currentSubscription.id, {
                    endDate: formData.endDate,
                    autoRenew: formData.autoRenew
                });
            } else {
                // Create new subscription logic could be here, but for "Renew" usually implies existing.
                // If no subscription exists, this modal might need to be "Create Subscription"
                // For now, let's assume we are just updating the date or creating a fresh default one.
                await subscriptionsApi.create({
                    tenantId,
                    planName: 'starter', // Default or select
                    startDate: new Date(),
                    endDate: formData.endDate,
                    billingCycle: 'monthly',
                    pricePerMonth: 0
                });
            }

            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to renew subscription');
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <>
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
            >
                Cancel
            </button>
            <button
                type="submit"
                form="renew-subscription-form"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Updating...' : 'Update Subscription'}
            </button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Renew / Update Subscription" size="md" footer={footer}>
            <form id="renew-subscription-form" onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subscription End Date
                    </label>
                    <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="autoRenew"
                        checked={formData.autoRenew}
                        onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="autoRenew" className="ml-2 text-sm text-gray-700">
                        Auto-renew
                    </label>
                </div>
            </form>
        </Modal>
    );
};

export default RenewSubscriptionModal;
