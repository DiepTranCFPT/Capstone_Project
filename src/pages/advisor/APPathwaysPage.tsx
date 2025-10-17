import React from 'react';
import APPathwayPlanner from '../../components/advisor/APPathwayPlanner';

const APPathwaysPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Định Hướng Lộ Trình AP</h1>
            <p className="text-gray-600 mb-6">
                Sử dụng công cụ này để xác định các môn AP phù hợp nhất với mục tiêu học tập và nghề nghiệp của học sinh.
            </p>
            <APPathwayPlanner />
        </div>
    );
};

export default APPathwaysPage;
