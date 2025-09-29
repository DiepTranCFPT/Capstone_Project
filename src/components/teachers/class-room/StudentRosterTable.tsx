import { Avatar, Button, Progress, Table } from "antd";
import type { } from "antd/es/list";
import React from "react";
import type { StudentInClass } from "~/types/teacher";
import { MessageOutlined } from '@ant-design/icons';
import type { ColumnsType } from "antd/es/table";

const StudentRosterTable: React.FC<{ students: StudentInClass[] }> = ({ students }) => {

    const columns: ColumnsType<StudentInClass> = [
        {
            title: 'Name',
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
            title: 'Overall Progress',
            dataIndex: 'overallProgress',
            key: 'overallProgress',
            render: (progress) => <Progress percent={progress} />
        },
        {
            title: 'Last Active',
            dataIndex: 'lastActive',
            key: 'lastActive',
        },
        {
            title: 'Action',
            key: 'action',
            render: () => (
                <Button icon={<MessageOutlined />} type="dashed">
                    Message
                </Button>
            ),
        },
    ]
    return (
        <Table columns={columns} dataSource={students} rowKey="id"/>
    )
};

export default StudentRosterTable;