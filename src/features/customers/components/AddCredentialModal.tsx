import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { useAppDispatch } from '../../../app/hooks';
import { addCustomerCredential } from '../customerSlice';

interface AddCredentialModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: string;
}

export const AddCredentialModal: React.FC<AddCredentialModalProps> = ({ isOpen, onClose, customerId }) => {
    const dispatch = useAppDispatch();
    const [platform, setPlatform] = useState<'mobile_banking' | 'meroshare' | 'tms'>('mobile_banking');
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await dispatch(addCustomerCredential({
                customerId,
                credentialData: {
                    platform,
                    loginId,
                    password
                }
            })).unwrap();
            onClose();
            setLoginId('');
            setPassword('');
            setPlatform('mobile_banking');
        } catch (err: any) {
            setError(err || 'Failed to add credential');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Credential">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as any)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="mobile_banking">Mobile Banking</option>
                        <option value="meroshare">Meroshare</option>
                        <option value="tms">TMS</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Login ID / Username</label>
                    <input
                        type="text"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input
                        type="text" // Keeping as text as per request to "hold the credentials", usually admin wants to see it to read it out in this context. Use password type if security preferred.
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                        required
                    />
                    <p className="text-xs text-slate-500 mt-1">Visible to admin for initial setup/support.</p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>Add Credential</Button>
                </div>
            </form>
        </Modal>
    );
};
