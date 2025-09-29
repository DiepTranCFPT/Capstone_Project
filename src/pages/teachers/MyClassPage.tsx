import { Button } from "antd";
import type React from "react";
import { useState } from "react";
import ClassroomCard from "~/components/teachers/class-room/ClassRoomCard";
import CreateClassModal from "~/components/teachers/class-room/CreateClassModal";
import type { Classroom } from "~/types/teacher";
import { PlusOutlined } from '@ant-design/icons';
// Mock data
const mockClasses: Classroom[] = [
    { id: '1', name: 'AP Physics C: Mechanics', subject: 'Physics', studentCount: 28, coverImage: 'https://placehold.co/600x400/3498db/ffffff?text=Physics', classCode: 'PHY-101' },
    { id: '2', name: 'AP Calculus BC', subject: 'Mathematics', studentCount: 32, coverImage: 'https://placehold.co/600x400/2ecc71/ffffff?text=Math', classCode: 'MTH-202' },
    { id: '3', name: 'AP Computer Science A', subject: 'Computer Science', studentCount: 25, coverImage: 'https://placehold.co/600x400/e74c3c/ffffff?text=Code', classCode: 'CS-301' },
]
const MyClassesPage: React.FC = () => {
    const [classes, setClasses] = useState<Classroom[]>(mockClasses);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const handleCreateClass = (values: { name: string; subject: string; }) => {
        const newClass: Classroom = {
            id: (classes.length + 1).toString(),
            name: values.name,
            subject: values.subject,
            studentCount: 0,
            coverImage: 'https://placehold.co/600x400/95a5a6/ffffff?text=New+Class',
            classCode: `${values.subject.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`
        };
        setClasses(prev => [...prev, newClass]);
        setIsModalVisible(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Classes</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => setIsModalVisible(true)}
                >
                    Create New Class
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(classroom => (
                    <ClassroomCard key={classroom.id} classroom={classroom} />
                ))}
            </div>
            <CreateClassModal
                visible={isModalVisible}
                onCreate={handleCreateClass}
                onCancel={() => setIsModalVisible(false)}
            />
        </div>
    )
}
export default MyClassesPage;