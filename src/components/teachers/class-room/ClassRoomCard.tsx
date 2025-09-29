import React from 'react';
import { Card, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { Classroom } from '~/types/teacher';

const { Meta } = Card;

interface ClassroomCardProps {
    classroom: Classroom;
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({ classroom }) => {
    return (
        <Link to={`/teacher/classes/${classroom.id}`}>
            <Card
                hoverable
                cover={<Avatar alt={classroom.name} src={classroom.coverImage} className="h-40 object-cover" />}
            >
                <Meta
                    title={classroom.name}
                    description={
                        <div>
                            <p className="text-gray-700 italic font-bold">{classroom.classCode}</p>
                            <p className="text-gray-500">{classroom.subject}</p>
                            <div className="flex items-center mt-2">
                                <UserOutlined className="mr-2" />
                                <span>{classroom.studentCount} students</span>
                            </div>
                        </div>
                    }
                />
            </Card>
        </Link>
    );
};

export default ClassroomCard;
