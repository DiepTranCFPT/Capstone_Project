import React from "react";
import {
    Button,
    Tag
} from "antd";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    BookOutlined,
    RightOutlined
} from "@ant-design/icons";
import type { PathwayItem } from "~/types/learningPath";

interface PathwayItemCardProps {
    item: PathwayItem;
    onNavigateToMaterial: (courseId: string) => void;
}

const PathwayItemCard: React.FC<PathwayItemCardProps> = ({
    item,
    onNavigateToMaterial
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'processing';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircleOutlined />;
            case 'in_progress': return <ClockCircleOutlined />;
            default: return <BookOutlined />;
        }
    };

    const getSubjectEmoji = (subjectName: string) => {
        const name = subjectName.toLowerCase();
        if (name.includes('math')) return '🧮';
        if (name.includes('english')) return '📝';
        if (name.includes('chemistry')) return '⚗️';
        if (name.includes('physics')) return '⚡';
        if (name.includes('biology')) return '🧬';
        if (name.includes('history')) return '🏛️';
        if (name.includes('literature')) return '📖';
        if (name.includes('art')) return '🎨';
        return '📒';
    };

    return (
        <div
            className={`
            border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl transform hover:scale-102 hover:-translate-y-1 cursor-pointer
            ${item.status === 'completed' ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 shadow-green-100' :
            item.status === 'in_progress' ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-blue-100 animate-pulse' :
            'border-gray-200 bg-white hover:border-gray-300'}
        `}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-3">
                            <div className={`text-3xl ${item.status === 'completed' ? 'animate-bounce' : ''}`}>
                                {getSubjectEmoji(item.subjectName)}
                            </div>
                            <div>
                                <h4 className={`font-bold text-lg m-0 ${item.status === 'completed' ? 'text-green-800' : item.status === 'in_progress' ? 'text-blue-800' : 'text-gray-800'}`}>
                                    {item.subjectName}
                                </h4>
                                {item.priority === 'Must Have' && (
                                    <Tag color="red" className="mt-1 animate-pulse">
                                        🔴 Bắt buộc AP
                                    </Tag>
                                )}
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 font-medium italic leading-relaxed">
                        💡 {item.reason}
                    </p>

                    <div className="flex items-center gap-2">
                        <Tag
                            icon={getStatusIcon(item.status)}
                            color={getStatusColor(item.status)}
                            className={`text-sm px-3 py-1 rounded-full font-semibold ${
                                item.status === 'completed' ? 'shadow-green-200' :
                                item.status === 'in_progress' ? 'shadow-blue-200 animate-pulse' :
                                'shadow-gray-200'
                            }`}
                        >
                            {item.status === 'completed' ? '✅ Đã chinh phục!' :
                             item.status === 'in_progress' ? '🚀 Đang chinh phục!' :
                             '⏳ Chờ khám phá!'}
                        </Tag>
                    </div>

                    {item.status === 'in_progress' && (
                        <div className="mt-3 bg-blue-100 px-3 py-2 rounded-lg border-l-4 border-blue-400">
                            <span className="text-blue-800 text-sm font-medium">
                                🔥 Tiếp tục con đường chinh phục của bạn!
                            </span>
                        </div>
                    )}
                </div>

                {item.courseId && (
                    <Button
                        type={item.status === 'not_started' ? 'primary' : 'default'}
                        size="large"
                        className={`rounded-full font-bold transition-all duration-300 shadow-md ${
                            item.status === 'completed' ? 'bg-green-500 hover:bg-green-600 border-green-500 text-white hover:shadow-green-200' :
                            item.status === 'in_progress' ? 'bg-blue-500 hover:bg-blue-600 border-blue-500 text-white hover:shadow-blue-200' :
                            'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-none hover:shadow-lg transform hover:scale-105'
                        }`}
                        onClick={() => onNavigateToMaterial(item.courseId!)}
                    >
                        {item.status === 'completed' ? '🔄 Ôn tập lại' : '🚀 Học ngay!'} <RightOutlined />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default PathwayItemCard;
