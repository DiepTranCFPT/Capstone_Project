import React from 'react';
import type { Tutor } from '~/types/tutoring';
import { Card, Avatar, Tag, Button } from 'antd';
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface TutorCardProps {
    tutor: Tutor;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
    return (
        <Card
            hoverable
            className="shadow-lg"
            actions={[
                <Link to={`/student/tutor/${tutor.id}`}>
                    <Button type="primary">View Profile</Button>
                </Link>
            ]}
        >
            <Card.Meta
                avatar={<Avatar src={tutor.avatar} size={64} />}
                title={<span className="text-lg font-bold">{tutor.name}</span>}
                description={
                    <div>
                        <div className="flex items-center mb-2">
                            <FaStar className="text-yellow-500 mr-1" />
                            <span>{tutor.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-gray-600 mb-2">{tutor.bio.substring(0, 100)}...</p>
                        <div>
                            {tutor.subjects.map(subject => (
                                <Tag color="blue" key={subject}>{subject}</Tag>
                            ))}
                        </div>
                    </div>
                }
            />
        </Card>
    );
};

export default TutorCard;
