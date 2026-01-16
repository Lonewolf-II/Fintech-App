import React from 'react';

interface RevenueData {
    month: string;
    revenue: number;
    mrr: number;
}

interface RevenueChartProps {
    data: RevenueData[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    const maxRevenue = Math.max(...data.map(d => Math.max(d.revenue, d.mrr)));
    const chartHeight = 250;
    const chartWidth = 100; // percentage

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 12 Months)</h2>

            {/* Legend */}
            <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center">
                    <div className="w-4 h-1 bg-purple-600 mr-2"></div>
                    <span className="text-sm text-gray-600">Total Revenue</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-1 bg-green-600 mr-2"></div>
                    <span className="text-sm text-gray-600">MRR</span>
                </div>
            </div>

            {/* Chart */}
            <div className="relative" style={{ height: `${chartHeight}px` }}>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
                    <span>${(maxRevenue / 1000).toFixed(0)}k</span>
                    <span>${(maxRevenue / 2000).toFixed(0)}k</span>
                    <span>$0</span>
                </div>

                {/* Chart area */}
                <div className="ml-12 h-full relative border-l border-b border-gray-200">
                    {/* Grid lines */}
                    <div className="absolute inset-0">
                        {[0, 25, 50, 75, 100].map((percent) => (
                            <div
                                key={percent}
                                className="absolute w-full border-t border-gray-100"
                                style={{ bottom: `${percent}%` }}
                            />
                        ))}
                    </div>

                    {/* Revenue line */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <polyline
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                            points={data.map((d, i) => {
                                const x = (i / (data.length - 1)) * 100;
                                const y = 100 - (d.revenue / maxRevenue) * 100;
                                return `${x}%,${y}%`;
                            }).join(' ')}
                        />
                        {data.map((d, i) => {
                            const x = (i / (data.length - 1)) * 100;
                            const y = 100 - (d.revenue / maxRevenue) * 100;
                            return (
                                <circle
                                    key={`revenue-${i}`}
                                    cx={`${x}%`}
                                    cy={`${y}%`}
                                    r="4"
                                    fill="#8b5cf6"
                                />
                            );
                        })}
                    </svg>

                    {/* MRR line */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <polyline
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2"
                            points={data.map((d, i) => {
                                const x = (i / (data.length - 1)) * 100;
                                const y = 100 - (d.mrr / maxRevenue) * 100;
                                return `${x}%,${y}%`;
                            }).join(' ')}
                        />
                        {data.map((d, i) => {
                            const x = (i / (data.length - 1)) * 100;
                            const y = 100 - (d.mrr / maxRevenue) * 100;
                            return (
                                <circle
                                    key={`mrr-${i}`}
                                    cx={`${x}%`}
                                    cy={`${y}%`}
                                    r="4"
                                    fill="#10b981"
                                />
                            );
                        })}
                    </svg>
                </div>

                {/* X-axis labels */}
                <div className="ml-12 mt-2 flex justify-between text-xs text-gray-500">
                    {data.map((d, i) => (
                        <span key={i}>{d.month}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RevenueChart;
