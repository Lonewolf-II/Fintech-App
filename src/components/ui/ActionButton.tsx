import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ActionButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    icon?: React.ReactNode;
}

/**
 * ActionButton component matching SSOT design
 * Dark blue primary buttons with consistent styling
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    type = 'button',
    className = '',
    icon
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
        primary: 'bg-blue-900 text-white hover:bg-blue-800 focus:ring-blue-900 disabled:bg-gray-300 disabled:cursor-not-allowed',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed',
        outline: 'bg-white text-blue-900 border border-blue-900 hover:bg-blue-50 focus:ring-blue-900 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed'
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        >
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    );
};
