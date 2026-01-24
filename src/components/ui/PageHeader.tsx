import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
    title: string;
    showBackButton?: boolean;
    onBack?: () => void;
    actions?: React.ReactNode;
    className?: string;
}

/**
 * PageHeader component matching SSOT design
 * Clean header with back button and title
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    showBackButton = false,
    onBack,
    actions,
    className = ''
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className={`flex items-center justify-between mb-6 ${className}`}>
            <div className="flex items-center gap-3">
                {showBackButton && (
                    <button
                        onClick={handleBack}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                )}
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
            {actions && (
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
};
