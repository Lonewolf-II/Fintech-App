import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

/**
 * Badge component for status indicators
 * Matches SSOT design with clean, minimal styling
 */
export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'neutral',
    className = ''
}) => {
    const variantClasses = {
        success: 'bg-green-50 text-green-700 border-green-200',
        warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        error: 'bg-red-50 text-red-700 border-red-200',
        info: 'bg-blue-50 text-blue-700 border-blue-200',
        neutral: 'bg-gray-50 text-gray-700 border-gray-200'
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${variantClasses[variant]} ${className}`}>
            {children}
        </span>
    );
};
