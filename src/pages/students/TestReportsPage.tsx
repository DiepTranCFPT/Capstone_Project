import React, { useState } from 'react';
import { Card, Button, Select, Pagination, Spin, Empty, Tag } from 'antd';
import { FileTextOutlined, ClockCircleOutlined, TrophyOutlined, CalendarOutlined, HistoryOutlined, CheckCircleOutlined, LoadingOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useExamAttemptHistory } from '~/hooks/useExamAttempt';

interface HistoryRecord {
    attemptId: string;
    examId: string;
    doneBy: string;
    score: number;
    startTime: string;
    endTime: string | null;
    rating: number | null;
    title?: string;
    status?: 'COMPLETED' | 'PENDING_GRADING';
    isLate?: boolean;
}

// Primary color: #3CBCB2
const PRIMARY_COLOR = '#3CBCB2';
const PRIMARY_LIGHT = '#E8F7F6';

const TestReportsPage: React.FC = () => {
    const navigate = useNavigate();
    const { history, loading: historyLoading, pageInfo, handlePageChange, handleSortChange } = useExamAttemptHistory();
    const [currentSort, setCurrentSort] = useState('startTime:desc');

    const sortOptions = [
        { label: 'Most Recent', value: 'startTime:desc' },
        { label: 'Oldest First', value: 'startTime:asc' },
        { label: 'Highest Score', value: 'score:desc' },
        { label: 'Lowest Score', value: 'score:asc' },
    ];

    // Handle sort change - call API
    const onSortChange = (value: string) => {
        setCurrentSort(value);
        handleSortChange([value]);
    };

    // Use history directly from API (already sorted by server)
    const sortedHistory = history;

    const handleViewDetails = (record: HistoryRecord) => {
        const attemptId = record.attemptId;
        if (!attemptId) {
            console.error('Attempt ID is undefined for record:', record);
            return;
        }
        navigate(`/test-result/${attemptId}`);
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getScoreStyle = (score: number) => {
        if (score >= 80) return {
            bg: '#10b981',
            text: '#ffffff',
            tagColor: 'success'
        };
        if (score >= 60) return {
            bg: '#f8ab25',
            text: '#ffffff',
            tagColor: 'warning'
        };
        return {
            bg: '#fa5d5d',
            text: '#ffffff',
            tagColor: 'error'
        };
    };

    const calculateDuration = (startTime: string, endTime: string | null) => {
        if (!endTime) return 'In Progress';
        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        const diffMs = end - start;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const remainingMins = diffMins % 60;

        if (diffHours > 0) {
            return `${diffHours}h ${remainingMins}m`;
        }
        return `${diffMins} mins`;
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F8FAFA' }}>
            {/* Header Banner */}
            <div
                className="relative overflow-hidden bg-backgroundColor"
                style={{

                    padding: '2rem 1.5rem'
                }}
            >
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <HistoryOutlined className="text-3xl text-white opacity-90" />
                        <h1 className="text-2xl md:text-3xl font-bold text-white m-0">
                            Exam History
                        </h1>
                    </div>
                    <p className="text-white/80 text-base md:text-lg m-0">
                        Track your learning progress and review past exam results
                    </p>
                </div>
                {/* Decorative circles */}
                <div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
                    style={{ backgroundColor: 'white' }}
                />
                <div
                    className="absolute -bottom-20 -left-10 w-60 h-60 rounded-full opacity-10"
                    style={{ backgroundColor: 'white' }}
                />
            </div>

            <div className="p-4 md:p-6 max-w-7xl mx-auto">
                {/* Sort Controls */}
                <div
                    className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl"
                    style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-gray-600 font-medium">Sort by:</span>
                        <Select
                            value={currentSort}
                            onChange={onSortChange}
                            style={{ width: 180 }}
                            options={sortOptions}
                        />
                    </div>
                    <div
                        className="px-4 py-2 rounded-full text-sm font-medium"
                        style={{ backgroundColor: PRIMARY_LIGHT, color: PRIMARY_COLOR }}
                    >
                        {pageInfo?.totalElements || pageInfo?.totalElement || 0} total results
                    </div>
                </div>

                {/* Loading State */}
                {historyLoading && (
                    <div className="flex flex-col justify-center items-center py-20">
                        <Spin size="large" />
                        <p className="mt-4 text-gray-500">Loading your exam history...</p>
                    </div>
                )}

                {/* Empty State */}
                {!historyLoading && sortedHistory.length === 0 && (
                    <div
                        className="py-16 rounded-2xl text-center"
                        style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    >
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div className="text-center">
                                    <p className="text-gray-500 text-lg mb-2">No exam history found</p>
                                    <p className="text-gray-400">Start taking exams to see your results here!</p>
                                </div>
                            }
                        >
                            <Button
                                type="primary"
                                style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                                onClick={() => navigate('/exams')}
                            >
                                Browse Exams
                            </Button>
                        </Empty>
                    </div>
                )}

                {/* Cards Grid - Responsive */}
                {!historyLoading && sortedHistory.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {sortedHistory.map((record: HistoryRecord) => {
                            const scoreStyle = getScoreStyle(record.score);
                            return (
                                <Card
                                    key={record.attemptId}
                                    className="group cursor-pointer"
                                    style={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        transition: 'all 0.3s ease',
                                        overflow: 'hidden'
                                    }}
                                    styles={{ body: { padding: 0 } }}
                                    hoverable
                                    onClick={() => handleViewDetails(record)}
                                >
                                    {/* Score Header with Gradient */}
                                    <div
                                        className="px-5 py-4"
                                        style={{ background: scoreStyle.bg }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <TrophyOutlined className="text-xl text-white/90" />
                                                <span className="text-white/90 font-medium">Score</span>
                                            </div>
                                            <div
                                                className="text-2xl font-bold px-4 py-1 rounded-full"
                                                style={{
                                                    backgroundColor: 'rgba(255,255,255,0.25)',
                                                    color: 'white',
                                                    backdropFilter: 'blur(4px)'
                                                }}
                                            >
                                                {record.score}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5">
                                        {/* Status Badge */}
                                        <div className="mb-3">
                                            {record.status === 'COMPLETED' ? (
                                                <Tag
                                                    icon={<CheckCircleOutlined />}
                                                    color="success"
                                                    style={{ borderRadius: '12px', padding: '2px 10px' }}
                                                >
                                                    Completed
                                                </Tag>
                                            ) : record.status === 'PENDING_GRADING' ? (
                                                <Tag
                                                    icon={<LoadingOutlined spin />}
                                                    color="warning"
                                                    style={{ borderRadius: '12px', padding: '2px 10px' }}
                                                >
                                                    Pending Grading
                                                </Tag>
                                            ) : null}
                                            {record.isLate && (
                                                <Tag
                                                    icon={<WarningOutlined />}
                                                    color="error"
                                                    style={{ borderRadius: '12px', padding: '2px 10px' }}
                                                >
                                                    Late Submission
                                                </Tag>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <h3
                                            className="text-lg font-semibold mb-2 line-clamp-2"
                                            style={{ color: '#1F2937', minHeight: '3.5rem' }}
                                        >
                                            {record.title || 'Untitled Exam'}
                                        </h3>

                                        {/* Time Info */}
                                        <div className="space-y-3 mb-5">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: PRIMARY_LIGHT }}
                                                >
                                                    <CalendarOutlined style={{ color: PRIMARY_COLOR }} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 m-0">Started</p>
                                                    <p className="text-sm font-medium text-gray-700 m-0">
                                                        {formatDateTime(record.startTime)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: '#F3E8FF' }}
                                                >
                                                    <ClockCircleOutlined style={{ color: '#9333EA' }} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 m-0">Duration</p>
                                                    <p className="text-sm font-medium text-gray-700 m-0">
                                                        {calculateDuration(record.startTime, record.endTime)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <Button
                                            type="primary"
                                            icon={<FileTextOutlined />}
                                            className="w-full"
                                            size="large"
                                            style={{
                                                backgroundColor: 'white',
                                                borderColor: PRIMARY_COLOR,
                                                borderRadius: '10px',
                                                height: '44px',
                                                fontWeight: 500,
                                                color: PRIMARY_COLOR
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {!historyLoading && sortedHistory.length > 0 && (
                    <div
                        className="mt-8 flex justify-center p-4 rounded-xl"
                        style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    >
                        <Pagination
                            current={(pageInfo?.pageNo || 0) + 1}
                            total={pageInfo?.totalElements || pageInfo?.totalElement || 0}
                            pageSize={pageInfo?.pageSize || 10}
                            showSizeChanger
                            showTotal={(total, range) => (
                                <span style={{ color: '#6B7280' }}>
                                    Showing <strong>{range[0]}-{range[1]}</strong> of <strong>{total}</strong> results
                                </span>
                            )}
                            onChange={(page, pageSize) => {
                                handlePageChange(page, pageSize);
                            }}
                            responsive
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestReportsPage;
