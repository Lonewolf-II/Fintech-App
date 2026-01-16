import React from 'react';

interface GrowthData {
    month: string;
    count: number;
    cumulative: number;
}

interface TenantGrowthChartProps {
    data: GrowthData[];
}

const TenantGrowthChart: React.FC<TenantGrowthChartProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    const maxCount = Math.max(...data.map(d => Math.max(d.count, d.cumulative)));
    const chartHeight = 250;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tenant Growth</h2>

            {/* Legend */}
            <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center">
                    <div className="w-4 h-3 bg-blue-500 opacity-50 mr-2"></div>
                    <span className="text-sm text-gray-600">New Tenants</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-3 bg-green-500 opacity-50 mr-2"></div>
                    <span className="text-sm text-gray-600">Total Tenants</span>
                </div>
            </div>

            {/* Chart */}
            <div className="relative" style={{ height: `${chartHeight}px` }}>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
                    <span>{maxCount}</span>
                    <span>{Math.floor(maxCount / 2)}</span>
                    <span>0</span>
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

                    {/* New Tenants Area */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                            </linearGradient>
                        </defs>
                        <polygon
                            fill="url(#blueGradient)"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            points={
                                `0,100 ` +
                                data.map((d, i) => {
                                    const x = (i / (data.length - 1)) * 100;
                                    const y = 100 - (d.count / maxCount) * 100;
                                    return `${x},${y}`;
                                }).join(' ') +
                                ` 100,100`
                            }
                        />
                    </svg>

                    {/* Total Tenants Area */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                            </linearGradient>
                        </defs>
                        <polygon
                            fill="url(#greenGradient)"
                            stroke="#10b981"
                            strokeWidth="2"
                            points={
                                `0,100 ` +
                                data.map((d, i) => {
                                    const x = (i / (data.length - 1)) * 100;
                                    const y = 100 - (d.cumulative / maxCount) * 100;
                                    return `${x},${y}`;
                                }).join(' ') +
                                ` 100,100`
                            }
                        />
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

export default TenantGrowthChart;
