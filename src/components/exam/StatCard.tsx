import React from 'react';
import type { IconType } from 'react-icons';

interface StatCardProps {
    icon: IconType;
    value: string;
    label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, value, label }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 flex items-center space-x-4">
            <div className="bg-teal-100 text-teal-500 p-3 rounded-full">
                <Icon size={24} />
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
        </div>
    );
};

export default StatCard;