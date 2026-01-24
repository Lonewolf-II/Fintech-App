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
export function formatDate(date: Date | string | undefined | null, formatStr: string = 'PPP'): string {
    if (!date) return '-';
    try {
        // Handle SQL timestamp strings (replace space with T or ensure valid parsing)
        const dateObj = typeof date === 'string' && !date.includes('T') && date.includes(' ')
            ? new Date(date.replace(' ', 'T')) // "2023-01-01 12:00:00" -> "2023-01-01T12:00:00"
            : new Date(date);

        if (isNaN(dateObj.getTime())) return 'Invalid Date';
        return format(dateObj, formatStr);
    } catch (error) {
        return 'Invalid Date';
    }
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

/**
 * Format 24h time string to 12h format
 */
export function formatTime12Hour(time24: string | null | undefined): string {
    if (!time24) return '';
    // Handle full ISO string or time string
    const timeStr = time24.includes('T') ? time24.split('T')[1] : time24;

    // Remove seconds if present (HH:mm:ss -> HH:mm)
    const [hours, minutes] = timeStr.split(':');
    if (!hours || !minutes) return time24;

    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
}
