import React from 'react';
import { Table, Tag, Progress, Button } from 'antd';
import { Link } from 'react-router-dom';
import { completedTests } from '~/data/mockTest';
import { EyeOutlined } from '@ant-design/icons';
import type { CompletedTest } from '~/types/test';

const TestReportsPage: React.FC = () => {
    const columns = [
        {
            title: 'Test Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: CompletedTest) => <Link to={`/student/test-reports/${record.id}`}>{text}</Link>,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'accuracy',
            dataIndex: 'score',
            key: 'score',
            render: (score: number) => <Tag color={score >= 80 ? 'green' : 'volcano'}>{score}%</Tag>,
        },
        {
            title: 'AP Score',
            dataIndex: 'apScore',
            key: 'apScore',
            render: (score: number) => <strong>{score} / 5</strong>,
        },
        {
            title: 'Progress',
            dataIndex: 'progress',
            key: 'progress',
            render: (progress: number) => <Progress percent={progress} size="small" />,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: unknown, record: CompletedTest) => (
                <Link to={`/student/test-reports/${record.id}`}>
                    <Button icon={<EyeOutlined />} type="primary">
                        View Details
                    </Button>
                </Link>
            ),
        },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Test Reports</h1>
            <Table columns={columns} dataSource={completedTests} rowKey="id" pagination={{ pageSize: 10 }} />
        </div>
    );
};

export default TestReportsPage;
