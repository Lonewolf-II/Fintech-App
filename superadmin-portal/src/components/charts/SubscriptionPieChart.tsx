import React from 'react';

interface SubscriptionData {
    name: string;
    value: number;
    color: string;
}

interface SubscriptionPieChartProps {
    data: SubscriptionData[];
}

const SubscriptionPieChart: React.FC<SubscriptionPieChartProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    const createArc = (startAngle: number, endAngle: number) => {
        const start = polarToCartesian(50, 50, 40, endAngle);
        const end = polarToCartesian(50, 50, 40, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
        return `M 50 50 L ${start.x} ${start.y} A 40 40 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
    };

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians),
        };
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Distribution</h2>

            <div className="flex items-center justify-center mb-6">
                <svg viewBox="0 0 100 100" className="w-64 h-64">
                    {data.map((item, index) => {
                        const percentage = (item.value / total) * 100;
                        const angle = (percentage / 100) * 360;
                        const path = createArc(currentAngle, currentAngle + angle);
                        currentAngle += angle;

                        return (
                            <g key={index}>
                                <path
                                    d={path}
                                    fill={item.color}
                                    stroke="white"
                                    strokeWidth="0.5"
                                    className="hover:opacity-80 transition-opacity cursor-pointer"
                                />
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {data.map((item, index) => {
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    return (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-gray-600">{item.name}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-medium text-gray-900">{item.value}</span>
                                <span className="text-gray-500 text-xs ml-1">({percentage}%)</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubscriptionPieChart;
