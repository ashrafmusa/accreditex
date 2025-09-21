
import React, { FC } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ElementType;
    color?: string; // Tailwind color class e.g., 'bg-blue-500'
}

const StatCard: FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
    return (
        <div className="bg-brand-surface dark:bg-dark-brand-surface p-5 rounded-xl shadow-sm border border-brand-border dark:border-dark-brand-border flex items-center space-x-4 rtl:space-x-reverse transition-all hover:shadow-md hover:-translate-y-0.5">
            {Icon && (
                <div className={`text-white p-3 rounded-lg ${color || 'bg-brand-primary'}`}>
                    <Icon className="h-6 w-6" />
                </div>
            )}
            <div>
                <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold text-brand-text-primary dark:text-dark-brand-text-primary">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;