import React from 'react';
import { Card, Tag, List, Avatar } from 'antd';
import type { Booking } from '~/types/tutoring';

// Mock Data
const mockBookings: Booking[] = [
    { id: '1', studentId: 'student1', tutorId: '1', time: '2025-10-10T14:00:00Z', status: 'upcoming' },
    { id: '2', studentId: 'student1', tutorId: '2', time: '2025-10-12T10:00:00Z', status: 'upcoming' },
    { id: '3', studentId: 'student1', tutorId: '1', time: '2025-09-20T16:00:00Z', status: 'completed' },
    { id: '4', studentId: 'student1', tutorId: '3', time: '2025-09-15T11:00:00Z', status: 'cancelled' },
];

// Mock tutor data to display in bookings
const mockTutors = {
    '1': { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
    '2': { name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
    '3': { name: 'Sam Wilson', avatar: 'https://i.pravatar.cc/150?img=3' },
};

const MyBookingsPage: React.FC = () => {
    const getStatusColor = (status: Booking['status']) => {
        switch (status) {
            case 'upcoming': return 'blue';
            case 'completed': return 'green';
            case 'cancelled': return 'red';
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bookings</h1>
                <List
                    itemLayout="horizontal"
                    dataSource={mockBookings}
                    renderItem={item => (
                        <List.Item
                            actions={[<Tag color={getStatusColor(item.status)}>{item.status.toUpperCase()}</Tag>]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar src={mockTutors[item.tutorId as keyof typeof mockTutors].avatar} />}
                                title={<a href="#">{mockTutors[item.tutorId as keyof typeof mockTutors].name}</a>}
                                description={`Date: ${new Date(item.time).toLocaleDateString()} - Time: ${new Date(item.time).toLocaleTimeString()}`}
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default MyBookingsPage;
