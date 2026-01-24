import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Card component matching SSOT design
 * Clean white background with subtle shadow
 */
export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md'
}) => {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-100 ${paddingClasses[padding]} ${className}`}>
            {children}
        </div>
    );
};
