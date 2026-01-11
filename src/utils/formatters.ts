import { format } from 'date-fns';

/**
 * Format currency in NPR (Nepalese Rupee)
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'NPR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format currency without symbol
 */
export function formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr);
}

/**
 * Format date to short format (DD/MM/YYYY)
 */
export function formatDateShort(date: Date | string): string {
    return formatDate(date, 'dd/MM/yyyy');
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
    return formatDate(date, 'PPP p');
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-IN').format(num);
}
