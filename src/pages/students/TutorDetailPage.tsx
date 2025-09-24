import React from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, Card, Tag, Rate, Button } from 'antd';
import type { Tutor } from '~/types/tutoring';

// Mock Data - in a real app, you'd fetch this
const mockTutors: Tutor[] = [
    { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1', subjects: ['Math', 'Physics'], rating: 4.8, bio: 'Experienced tutor with a passion for science. I have a PhD in Physics and have been tutoring for over 10 years. My goal is to make complex topics accessible and engaging for all students.', hourlyRate: 50 },
    { id: '2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2', subjects: ['English', 'History'], rating: 4.9, bio: 'MA in English Literature, loves to help students find their voice and excel in humanities. I specialize in essay writing and critical analysis.', hourlyRate: 45 },
    { id: '3', name: 'Sam Wilson', avatar: 'https://i.pravatar.cc/150?img=3', subjects: ['Chemistry', 'Biology'], rating: 4.7, bio: 'PhD in Chemistry, making complex topics easy to understand. I use real-world examples to bring science to life.', hourlyRate: 55 },
];

const TutorDetailPage: React.FC = () => {
    const { tutorId } = useParams<{ tutorId: string }>();
    const tutor = mockTutors.find(t => t.id === tutorId);

    if (!tutor) {
        return <div>Tutor not found</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 flex flex-col items-center">
                        <Avatar src={tutor.avatar} size={128} className="mb-4" />
                        <h1 className="text-3xl font-bold">{tutor.name}</h1>
                        <Rate allowHalf defaultValue={tutor.rating} disabled />
                        <span className="ml-2 text-lg">{tutor.rating}</span>
                        <div className="mt-4">
                            {tutor.subjects.map(subject => (
                                <Tag color="blue" key={subject} className="text-base p-1">{subject}</Tag>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-semibold mb-4">About Me</h2>
                        <p className="text-gray-700 mb-6">{tutor.bio}</p>
                        <h2 className="text-2xl font-semibold mb-4">Availability</h2>
                        <div className="bg-gray-100 p-4 rounded-lg h-64 flex items-center justify-center">
                            <p className="text-gray-500">[Calendar Placeholder]</p>
                        </div>
                        <Button type="primary" size="large" className="mt-6">Book a Session</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default TutorDetailPage;
