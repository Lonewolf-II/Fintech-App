import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPendingRequests } from './checkerSlice';
import {
    Clock,
    CheckCircle,
    FileText,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatsCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    link?: string;
    linkText?: string;
}> = ({ title, value, icon, color, link, linkText }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
            {link && (
                <Link to={link} className={`mt-4 inline-flex items-center text-sm font-medium ${color} hover:opacity-80`}>
                    {linkText} <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('600', '50')} ${color}`}>
            {icon}
        </div>
    </div>
);

export const CheckerDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { pendingData } = useAppSelector((state) => state.checker);
    const { user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchPendingRequests());
    }, [dispatch]);

    const modificationCount = pendingData?.modifications?.length || 0;
    const kycCount = pendingData?.kyc?.length || 0;
    const ipoCount = pendingData?.ipo?.length || 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
                <p className="text-slate-500 mt-1">Here's what needs your attention today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Pending Modifications"
                    value={modificationCount}
                    icon={<FileText className="w-6 h-6" />}
                    color="text-amber-600"
                    link="/checker/modifications"
                    linkText="Review Modifications"
                />
                <StatsCard
                    title="Pending KYC"
                    value={kycCount}
                    icon={<CheckCircle className="w-6 h-6" />}
                    color="text-blue-600"
                    link="/checker/verification"
                    linkText="Review KYC"
                />
                <StatsCard
                    title="Pending IPO Applications"
                    value={ipoCount}
                    icon={<Clock className="w-6 h-6" />}
                    color="text-purple-600"
                    link="/checker/ipo-applications"
                    linkText="Review Applications"
                />
            </div>
        </div>
    );
};
