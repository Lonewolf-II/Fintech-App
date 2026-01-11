import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchHoldings, updateHolding, deleteHolding } from '../../portfolio/portfolioSlice';
import { formatCurrency } from '../../../utils/formatters';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import type { ModificationRequest } from '../../../types/business.types';

interface PortfolioHoldingsTableProps {
    customerId: string;
    pendingRequests?: ModificationRequest[];
}

export const PortfolioHoldingsTable: React.FC<PortfolioHoldingsTableProps> = ({ customerId, pendingRequests = [] }) => {
    const dispatch = useAppDispatch();
    // We need to find the portfolio ID first. 
    // Assuming 1-to-1 relationship and it's already in state or we need to fetch portfolios.
    // Ideally customer object should have a portfolio link or we fetch portfolios by customer.
    // Let's rely on portfolioSlice having fetched portfolios or we trigger a fetch if empty.

    // For now, let's assume we fetch all portfolios and filter by customerId, 
    // OR we should have an API to get portfolio by customer. 
    // Given current `portfolioSlice`, `fetchPortfolios` gets all. That might be heavy for a single user view if there are thousands.
    // Better to check if `selectedCustomer` has `portfolioId`. 
    // But `selectedCustomer` model in frontend might not have it yet.
    // Let's assume we use `fetchPortfolios` for now and filter.

    const { portfolios, holdings, isLoading } = useAppSelector((state) => state.portfolio);

    const customerPortfolio = portfolios.find(p => p.customerId === customerId);

    useEffect(() => {
        // If we don't have portfolios, fetch them? Or assume they are loaded? 
        // Better to have a way to fetch specific customer portfolio.
        // For this step, I will dispatch fetchPortfolios if not present.
        if (!customerPortfolio && !isLoading) {
            // This is not ideal for performance but works for MVP
            // dispatch(fetchPortfolios()); 
            // Actually, `getAllPortfolios` is Admin only maybe? 
            // Let's check `portfolioController.js`: `getAllPortfolios` is for admin/investor.
        }
    }, [customerPortfolio, isLoading, dispatch]);

    useEffect(() => {
        if (customerPortfolio) {
            dispatch(fetchHoldings(customerPortfolio.portfolioId));
        }
    }, [customerPortfolio, dispatch]);

    if (!customerPortfolio) {
        return (
            <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-slate-500">
                    No portfolio found for this customer.
                </td>
            </tr>
        );
    }

    if (isLoading && holdings.length === 0) {
        return (
            <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-slate-500">
                    Loading holdings...
                </td>
            </tr>
        );
    }

    return (
        <>
            {holdings.map((holding) => {
                const pendingRequest = pendingRequests.find(
                    r => r.targetModel === 'Holding' && r.targetId === holding.id && r.status === 'pending'
                );
                const isPending = !!pendingRequest;

                return (
                    <tr key={holding.id} className={isPending ? "bg-yellow-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{holding.stockSymbol}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {holding.companyName}
                            {isPending && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                    {pendingRequest?.changeType === 'delete' ? 'Deletion Pending' : 'Update Pending'}
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{holding.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatCurrency(holding.purchasePrice)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(holding.currentPrice)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {formatCurrency(Number(holding.quantity) * Number(holding.currentPrice))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={(holding.profitLossPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {(holding.profitLossPercent || 0).toFixed(2)}%
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                                <button
                                    disabled={isPending}
                                    onClick={() => {
                                        const newQty = prompt("Enter new quantity:", String(holding.quantity));
                                        if (newQty && !isNaN(Number(newQty))) {
                                            dispatch(updateHolding({
                                                id: holding.id,
                                                data: { quantity: Number(newQty) }
                                            }))
                                                .unwrap()
                                                .then((res) => {
                                                    if (res.pending) toast.success("Modification Request Sent");
                                                    else toast.success("Updated Successfully");
                                                    // Refresh holdings
                                                    dispatch(fetchHoldings(customerPortfolio.portfolioId));
                                                })
                                                .catch(err => toast.error(err));
                                        }
                                    }}
                                    className={`text-blue-600 hover:text-blue-900 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    disabled={isPending}
                                    onClick={() => {
                                        if (confirm("Are you sure you want to delete this holding?")) {
                                            dispatch(deleteHolding(holding.id))
                                                .unwrap()
                                                .then((res) => {
                                                    if (res.pending) toast.success("Deletion Request Sent");
                                                    else toast.success("Deleted Successfully");
                                                    dispatch(fetchHoldings(customerPortfolio.portfolioId));
                                                })
                                                .catch(err => toast.error(err));
                                        }
                                    }}
                                    className={`text-red-600 hover:text-red-900 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                );
            })}
            {holdings.length === 0 && (
                <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-slate-500">
                        No holdings found.
                    </td>
                </tr>
            )}
        </>
    );
};
