import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tag, Button, Select } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
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
}

const TestReportsPage: React.FC = () => {
    const navigate = useNavigate();
    const { history, loading: historyLoading, pageInfo, handlePageChange, setSorts } = useExamAttemptHistory();
    const [currentSort, setCurrentSort] = useState('startTime_desc');

    const sortOptions = [
        { label: 'Most Recent', value: 'startTime_desc' },
        { label: 'Oldest First', value: 'startTime_asc' },
        { label: 'Highest Score', value: 'score_desc' },
        { label: 'Lowest Score', value: 'score_asc' },
    ];

    useEffect(() => {
        setSorts([currentSort]);
    }, [currentSort, setSorts]);

    const sortedHistory = useMemo(() => {
        return [...history].sort((a, b) => {
            switch (currentSort) {
                case 'startTime_desc':
                    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
                case 'startTime_asc':
                    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
                case 'score_desc':
                    return b.score - a.score;
                case 'score_asc':
                    return a.score - b.score;
                default:
                    return 0;
            }
        });
    }, [history, currentSort]);

    const handleViewDetails = (record: HistoryRecord) => {
        const attemptId = record.attemptId;
        if (!attemptId) {
            console.error('Attempt ID is undefined for record:', record);
            return;
        }
        navigate(`/test-result/${attemptId}`);
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
            render: (score: number) => <Tag color={score >= 80 ? 'green' : 'volcano'}>{score}</Tag>,
        },
        {
            title: 'Start Time',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (startTime: string) => startTime ? new Date(startTime).toLocaleString('vi-VN') : 'N/A',
        },
        {
            title: 'End Time',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (endTime: string) => endTime ? new Date(endTime).toLocaleString('vi-VN') : 'N/A',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: unknown, record: HistoryRecord) => (
                <div className="flex gap-2">
                    <Button
                        icon={<FileTextOutlined />}
                        onClick={() => handleViewDetails(record)}
                        size="small"
                    >
                        Details
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Exam History</h1>
            <div className="mb-4">
                <Select
                    value={currentSort}
                    onChange={setCurrentSort}
                    style={{ width: 200 }}
                    options={sortOptions}
                />
            </div>
            <Table
                columns={columns}
                dataSource={sortedHistory}
                rowKey="attemptId"
                loading={historyLoading}
                pagination={{
                    current: (pageInfo?.pageNo || 0) + 1,
                    total: pageInfo?.totalElements || pageInfo?.totalElement || 0,
                    pageSize: pageInfo?.pageSize || 10,
                    showSizeChanger: true,
                    onChange: (page, pageSize) => {
                        handlePageChange(page, pageSize);
                    },
                }}
            />
        </div>
    );
};

export default TestReportsPage;
