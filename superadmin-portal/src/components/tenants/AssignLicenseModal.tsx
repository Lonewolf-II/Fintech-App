import React, { useState } from 'react';
import Modal from '../common/Modal';
import { licensesApi } from '../../api/apiClient';

interface AssignLicenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenantId: number;
}

const AssignLicenseModal: React.FC<AssignLicenseModalProps> = ({ isOpen, onClose, tenantId }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        features: {
            ipo: true,
            portfolio: true,
            bulkUpload: false,
            apiAccess: false
        },
        expiresAt: ''
    });

    const handleFeatureChange = (feature: string) => {
        setFormData({
            ...formData,
            features: {
                ...formData.features,
                [feature as keyof typeof formData.features]: !formData.features[feature as keyof typeof formData.features]
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await licensesApi.generate({
                tenantId,
                featureFlags: formData.features,
                expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined
            });
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to assign license');
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
                form="assign-license-form"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Assigning...' : 'Assign License'}
            </button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assign License" size="md" footer={footer}>
            <form id="assign-license-form" onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feature Flags
                    </label>
                    <div className="space-y-2">
                        {Object.entries(formData.features).map(([key, value]) => (
                            <label key={key} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={() => handleFeatureChange(key)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date (Optional)
                    </label>
                    <input
                        type="date"
                        value={formData.expiresAt}
                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">Leave blank for perpetual license</p>
                </div>
            </form>
        </Modal>
    );
};

export default AssignLicenseModal;
