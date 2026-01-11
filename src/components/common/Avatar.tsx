import React from 'react';
import { cn } from '../../utils/cn';

interface AvatarProps {
    name: string;
    src?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
    name,
    src,
    size = 'md',
    className,
}) => {
    const sizes = {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
    };

    const getInitials = (name: string): string => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div
            className={cn(
                'inline-flex items-center justify-center rounded-full bg-primary-600 text-white font-semibold',
                sizes[size],
                className
            )}
        >
            {src ? (
                <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
            ) : (
                <span>{getInitials(name)}</span>
            )}
        </div>
    );
};
