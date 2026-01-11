import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        'w-full px-3 py-2 border rounded-lg text-slate-900 placeholder-slate-400',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                        'disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500',
                        'transition-all duration-200',
                        error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-slate-300 hover:border-slate-400',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-600">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
