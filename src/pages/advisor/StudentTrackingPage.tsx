import React from 'react';
import { Table, Progress, Tag, Button, Avatar, message, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { BellOutlined } from '@ant-design/icons';
import { mockAssignedStudents } from '../../data/advisor';
import type { AssignedStudent } from '../../types/advisor';

const StudentTrackingPage: React.FC = () => {

    const handleSendWarning = (studentName: string) => {
        message.success(`Cảnh báo đã được gửi tới ${studentName}`);
    };

    const getStatusTag = (status: AssignedStudent['status']) => {
        switch (status) {
            case 'on_track':
                return <Tag color="green">ĐÚNG TIẾN ĐỘ</Tag>;
            case 'behind':
                return <Tag color="orange">CHẬM TIẾN ĐỘ</Tag>;
            case 'at_risk':
                return <Tag color="red">CÓ RỦI RO</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const columns: ColumnsType<AssignedStudent> = [
        {
            title: 'Sinh viên',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="flex items-center gap-2">
                    <Avatar src={record.avatar} />
                    <span>{text}</span>
                </div>
            )
        },
        {
            title: 'Mục tiêu AP',
            dataIndex: 'apGoal',
            key: 'apGoal',
        },
        {
            title: 'Tiến độ tổng thể',
            dataIndex: 'overallProgress',
            key: 'overallProgress',
            render: (progress) => <Progress percent={progress} />
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Tooltip title="Gửi cảnh báo tiến độ cho sinh viên">
                    <Button
                        icon={<BellOutlined />}
                        onClick={() => handleSendWarning(record.name)}
                        danger={record.status === 'at_risk' || record.status === 'behind'}
                    >
                        Gửi cảnh báo
                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Theo dõi tiến độ sinh viên</h1>
            <Table columns={columns} dataSource={mockAssignedStudents} rowKey="id" />
        </div>
    );
};

export default StudentTrackingPage;

