import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, subtitle, color, trend, onClick }) => {
    const iconColorClass = `text-${color.split('-')[1]}-600`;
    const iconBgClass = `bg-${color.split('-')[1]}-100`;

    return (
        <div className={`hazop-stat-card ${onClick ? 'stat-card-clickable' : ''}`} onClick={onClick}>
            <div className="hazop-stat-header">
                <div className="flex-1">
                    <p className="hazop-stat-title">{title}</p>
                    <p className={`hazop-stat-value ${iconColorClass}`}>{value}</p>
                    {subtitle && <p className="hazop-stat-subtitle">{subtitle}</p>}
                </div>
                <div className={`hazop-icon-wrapper ${iconBgClass}`}>
                    <Icon className={`w-6 h-6 ${iconColorClass}`} style={{ width: 24, height: 24 }} />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
                    <TrendingUp style={{ width: 16, height: 16, color: '#16a34a', marginRight: 4 }} />
                    <span style={{ color: '#16a34a', fontWeight: 500 }}>{trend}</span>
                    <span style={{ color: '#6b7280', marginLeft: 4 }}>vs last period</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;