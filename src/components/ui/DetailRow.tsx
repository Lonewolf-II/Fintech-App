import React from 'react';

interface DetailRowProps {
    label: string;
    value: React.ReactNode;
    className?: string;
}

/**
 * DetailRow component for displaying label-value pairs
 * Matches SSOT two-column detail layout
 */
export const DetailRow: React.FC<DetailRowProps> = ({
    label,
    value,
    className = ''
}) => {
    return (
        <div className={`flex justify-between py-3 border-b border-gray-100 last:border-b-0 ${className}`}>
            <span className="text-sm text-gray-500 font-normal">{label}</span>
            <span className="text-sm text-gray-900 font-medium">{value}</span>
        </div>
    );
};

interface DetailGridProps {
    children: React.ReactNode;
    columns?: 1 | 2;
    className?: string;
}

/**
 * DetailGrid component for organizing multiple DetailRows
 * Supports 1 or 2 column layouts
 */
export const DetailGrid: React.FC<DetailGridProps> = ({
    children,
    columns = 2,
    className = ''
}) => {
    const gridClasses = columns === 2
        ? 'grid grid-cols-1 md:grid-cols-2 gap-x-8'
        : 'grid grid-cols-1';

    return (
        <div className={`${gridClasses} ${className}`}>
            {children}
        </div>
    );
};
