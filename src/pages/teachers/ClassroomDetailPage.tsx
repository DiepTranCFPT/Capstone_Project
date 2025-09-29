import { Button, Tabs } from "antd";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { useParams } from "react-router-dom";
import type { StudentInClass } from "~/types/teacher";
import { UserAddOutlined } from '@ant-design/icons';
import TabPane from "antd/es/tabs/TabPane";
import StudentRosterTable from "~/components/teachers/class-room/StudentRosterTable";


// Mock data
const mockStudents: StudentInClass[] = [
    { id: 's1', name: 'Nguyen Van A', avatar: 'https://i.pravatar.cc/150?img=1', overallProgress: 85, lastActive: '2 hours ago' },
    { id: 's2', name: 'Tran Thi B', avatar: 'https://i.pravatar.cc/150?img=2', overallProgress: 72, lastActive: '1 day ago' },
    { id: 's3', name: 'Le Van C', avatar: 'https://i.pravatar.cc/150?img=3', overallProgress: 91, lastActive: '5 hours ago' },
];

const ClassroomDetailPage: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();

    //Fake data
    const classroomName = `AP Physics C: Mechanics (ID: ${classId})`;
    const classCode = "PHY-101";


    return (
        <div>
            {/* Page header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 hover:cursor-pointer" onClick={() => window.history.back()}>
                    <ArrowLeft size={20} />
                    <p className="text-gray-600 font-bold">Back</p>
                </div>
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-bold text-gray-800">{classroomName}</h1>
                    <p className="text-gray-600">Class Code: {classCode}</p>
                </div>
                <Button key="1" type="primary" icon={<UserAddOutlined />}>
                    Add Student
                </Button>
            </div>

            <div className="">
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Students" key="1">
                        <StudentRosterTable students={mockStudents} />
                    </TabPane>
                    <TabPane tab="Assignments" key="2">
                        Content for Assignments
                    </TabPane>
                    <TabPane tab="Materials" key="3">
                        Content for Materials
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default ClassroomDetailPage;