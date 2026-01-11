import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'elevated' | 'bordered';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    className,
    variant = 'default',
    padding = 'md',
}) => {
    const variants = {
        default: 'bg-white shadow-card',
        elevated: 'bg-white shadow-soft',
        bordered: 'bg-white border-2 border-slate-200',
    };

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div className={cn('rounded-xl', variants[variant], paddings[padding], className)}>
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
    return <div className={cn('mb-4', className)}>{children}</div>;
};

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
    return <h3 className={cn('text-xl font-semibold text-slate-900', className)}>{children}</h3>;
};

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
    return <div className={cn(className)}>{children}</div>;
};
