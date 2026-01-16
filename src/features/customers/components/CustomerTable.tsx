import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Edit2, Trash2, FileText } from 'lucide-react';
import type { Customer } from '../../../types/business.types';
import { useAppSelector } from '../../../app/hooks';
import { formatCurrency } from '../../../utils/formatters';

interface CustomerTableProps {
    customers: Customer[];
    onEdit: (customer: Customer) => void;
    onDelete: (customer: Customer) => void;
    onViewStatements?: (customer: Customer) => void;
}

const getKycBadgeVariant = (status: string) => {
    switch (status) {
        case 'verified':
            return 'success' as const;
        case 'rejected':
            return 'error' as const;
        case 'pending':
            return 'warning' as const;
        default:
            return 'default' as const;
    }
};

export const CustomerTable: React.FC<CustomerTableProps> = ({
    customers,
    onEdit,
    onDelete,
    onViewStatements
}) => {
    const { user } = useAppSelector((state) => state.auth);
    const basePath = user ? `/${user.role}` : '/admin';

    if (customers.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 text-lg">No customers found</p>
                <p className="text-slate-400 text-sm mt-2">
                    Create your first customer to get started
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Customer ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Name
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Email
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Phone
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Account Number
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Account Name
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                            Balance
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            KYC Status
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => {
                        // Get primary account if available
                        const primaryAccount = customer.accounts?.find(acc => acc.isPrimary) || customer.accounts?.[0];

                        return (
                            <tr
                                key={customer.id}
                                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                            >
                                <td className="py-3 px-4">
                                    <span className="font-mono text-sm text-slate-700">
                                        {customer.customerId}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <Link to={`${basePath}/customers/${customer.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                                        {customer.fullName}
                                    </Link>
                                </td>
                                <td className="py-3 px-4 text-slate-600">{customer.email}</td>
                                <td className="py-3 px-4 text-slate-600">{customer.phone}</td>
                                <td className="py-3 px-4">
                                    <span className="font-mono text-sm text-slate-700">
                                        {primaryAccount?.accountNumber || '-'}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-slate-600 text-sm">
                                    {primaryAccount?.accountName || '-'}
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <span className="font-semibold text-green-600">
                                        {primaryAccount ? formatCurrency(primaryAccount.balance) : '-'}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <Badge variant={getKycBadgeVariant(customer.kycStatus)}>
                                        {customer.kycStatus}
                                    </Badge>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center justify-end space-x-2">
                                        {onViewStatements && primaryAccount && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onViewStatements(customer)}
                                                title="View Statements"
                                            >
                                                <FileText className="w-4 h-4 text-blue-600" />
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onEdit(customer)}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onDelete(customer)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
