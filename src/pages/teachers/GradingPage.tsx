import { Button, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import React from "react";
import { Link } from "react-router-dom";
import { mockSubmissions } from "~/data/teacher";
import type { StudentSubmission } from "~/types/teacher";


const GradingPage: React.FC = () => {

    const columns: ColumnsType<StudentSubmission> = [
        {
            title: 'Student',
            dataIndex: 'student',
            key: 'student',
            render: (student) => student.name,
        },
        {
            title: 'Exam',
            dataIndex: 'exam',
            key: 'exam',
            render: (exam) => exam.title,
        },
        {
            title: 'Submitted At',
            dataIndex: 'submittedAt',
            key: 'submittedAt',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: 'pending_grading' | 'graded') => (
                <Tag color={status === 'pending_grading' ? 'blue' : 'green'}>
                    {status.replace('_', ' ').toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Actions',

            key: 'action',
            render: (_, record) => (
                record.status === 'pending_grading' ? (
                    <Link to={`/teacher/grading/${record.id}`}>
                        <Button type="primary">Grade</Button>
                    </Link>) : (

                    <Link to={`/teacher/grading/${record.id}`}>
                        <Button type="primary">View</Button>
                    </Link>
                )
            ),
        },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Submissions to Grade</h1>
            <Table columns={columns} dataSource={mockSubmissions} rowKey="id" />
        </div>
    )
};

export default GradingPage; 