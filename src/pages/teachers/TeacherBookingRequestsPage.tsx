import React, { useState } from 'react';
import { Card, List, Tag, Avatar, Button, Tabs, Badge, Modal, message, Select, Row, Col, Statistic } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { Booking } from '~/types/tutoring';

// Extended booking interface for teacher view
interface TeacherBooking extends Omit<Booking, 'studentId'> {
    student: {
        id: string;
        name: string;
        avatar: string;
        grade: string;
        school: string;
        phone?: string;
        email: string;
    };
    subject: string;
    sessionType: '1-on-1' | 'group';
}

// Mock data - in real app, this would come from API
const mockTeacherBookings: TeacherBooking[] = [
    {
        id: '1',
        tutorId: 'current-teacher-id',
        time: '2025-11-22T14:00:00Z',
        status: 'upcoming',
        student: {
            id: '1',
            name: 'Nguyen Van A',
            avatar: 'https://i.pravatar.cc/150?img=1',
            grade: 'Grade 11',
            school: 'Truong THPT Nguyen Hue',
            email: 'nguyenvana@email.com'
        },
        subject: 'AP Calculus BC',
        sessionType: '1-on-1'
    },
    {
        id: '2',
        tutorId: 'current-teacher-id',
        time: '2025-11-20T10:00:00Z',
        status: 'completed',
        student: {
            id: '2',
            name: 'Tran Thi B',
            avatar: 'https://i.pravatar.cc/150?img=2',
            grade: 'Grade 12',
            school: 'Truong THPT Le Quy Don',
            phone: '0123456789',
            email: 'tranthib@email.com'
        },
        subject: 'AP Physics C',
        sessionType: '1-on-1'
    },
    {
        id: '3',
        tutorId: 'current-teacher-id',
        time: '2025-11-25T16:30:00Z',
        status: 'upcoming',
        student: {
            id: '3',
            name: 'Le Van C',
            avatar: 'https://i.pravatar.cc/150?img=3',
            grade: 'Grade 10',
            school: 'Truong THPT Tran Phu',
            email: 'levanc@email.com'
        },
        subject: 'SAT Math',
        sessionType: '1-on-1'
    },
    {
        id: '4',
        tutorId: 'current-teacher-id',
        time: '2025-11-15T09:00:00Z',
        status: 'cancelled',
        student: {
            id: '4',
            name: 'Pham Thi D',
            avatar: 'https://i.pravatar.cc/150?img=4',
            grade: 'Grade 11',
            school: 'Truong THPT Nguyen Binh Khiem',
            email: 'phamthid@email.com'
        },
        subject: 'ACT English',
        sessionType: '1-on-1'
    },
    {
        id: '5',
        tutorId: 'current-teacher-id',
        time: '2025-11-28T13:00:00Z',
        status: 'upcoming',
        student: {
            id: '5',
            name: 'Ho Van E',
            avatar: 'https://i.pravatar.cc/150?img=5',
            grade: 'Grade 12',
            school: 'Truong THPT Le Hong Phong',
            phone: '0987654321',
            email: 'hovane@email.com'
        },
        subject: 'AP Chemistry',
        sessionType: 'group'
    }
];

const { TabPane } = Tabs;
const { Option } = Select;

const TeacherBookingRequestsPage: React.FC = () => {
    const [bookings, setBookings] = useState<TeacherBooking[]>(mockTeacherBookings);
    const [selectedAction, setSelectedAction] = useState<{booking: TeacherBooking, action: 'cancel' | 'complete'} | null>(null);
    const [subjectFilter, setSubjectFilter] = useState<string>('all');

    const getStatusColor = (status: Booking['status']) => {
        switch (status) {
            case 'upcoming': return 'blue';
            case 'completed': return 'green';
            case 'cancelled': return 'red';
        }
    };

    const getStatusBadge = (status: Booking['status']) => {
        const counts = {
            upcoming: bookings.filter(b => b.status === 'upcoming').length,
            completed: bookings.filter(b => b.status === 'completed').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length,
        };

        const labels = {
            upcoming: 'Upcoming',
            completed: 'Completed',
            cancelled: 'Cancelled'
        };

        return `${labels[status]} ${counts[status] > 0 ? `(${counts[status]})` : ''}`;
    };

    const handleBookingAction = (booking: TeacherBooking, action: 'cancel' | 'complete') => {
        setSelectedAction({ booking, action });
    };

    const confirmAction = () => {
        if (!selectedAction) return;

        const updatedBookings: TeacherBooking[] = bookings.map(booking =>
            booking.id === selectedAction.booking.id
                ? { ...booking, status: (selectedAction.action === 'complete' ? 'completed' : 'cancelled') as Booking['status'] }
                : booking
        );

        setBookings(updatedBookings);
        message.success(`Booking ${selectedAction.action === 'complete' ? 'completed' : 'cancelled'} successfully`);
        setSelectedAction(null);
    };

    const getFilteredBookings = (status: string) => {
        let filtered = bookings;

        if (status !== 'all') {
            filtered = filtered.filter(b => b.status === status as Booking['status']);
        }

        if (subjectFilter !== 'all') {
            filtered = filtered.filter(b => b.subject === subjectFilter);
        }

        return filtered;
    };

    const getSubjectOptions = () => {
        const subjects = [...new Set(bookings.map(b => b.subject))];
        return subjects;
    };

    const upcomingThisWeek = bookings.filter(b =>
        b.status === 'upcoming' &&
        new Date(b.time) >= new Date() &&
        new Date(b.time) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length;

    const completedThisMonth = bookings.filter(b =>
        b.status === 'completed' &&
        new Date(b.time).getMonth() === new Date().getMonth()
    ).length;

    const renderBookingItem = (booking: TeacherBooking) => (
        <List.Item
            key={booking.id}
            actions={booking.status === 'upcoming' ? [
                <Button
                    key="complete"
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleBookingAction(booking, 'complete')}
                >
                    Complete
                </Button>,
                <Button
                    key="cancel"
                    danger
                    size="small"
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleBookingAction(booking, 'cancel')}
                >
                    Cancel
                </Button>
            ] : booking.status === 'cancelled' ? [
                <Button
                    key="reschedule"
                    type="default"
                    size="small"
                    icon={<CalendarOutlined />}
                >
                    Reschedule
                </Button>
            ] : []
            }
        >
            <List.Item.Meta
                avatar={<Avatar size={48} src={booking.student.avatar} />}
                title={
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-lg">{booking.student.name}</span>
                        <Tag color={getStatusColor(booking.status)}>{booking.status.toUpperCase()}</Tag>
                    </div>
                }
                description={
                    <div className="space-y-2">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <UserOutlined />
                                {booking.student.grade} • {booking.student.school}
                            </span>
                            <span className="flex items-center gap-1">
                                <Badge color={booking.sessionType === 'group' ? 'purple' : 'blue'} />
                                {booking.sessionType} Session
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1 text-gray-700 font-medium">
                                <CalendarOutlined />
                                {new Date(booking.time).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                            <span className="flex items-center gap-1 text-gray-700 font-medium">
                                <ClockCircleOutlined />
                                {new Date(booking.time).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                })}
                            </span>
                            <Badge count={booking.subject} style={{ backgroundColor: '#1890ff' }} />
                        </div>
                    </div>
                }
            />
        </List.Item>
    );

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Booking Requests</h1>
                        <p className="text-gray-600 mt-1">Manage your upcoming and past tutoring sessions</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title="Upcoming This Week"
                                value={upcomingThisWeek}
                                prefix={<CalendarOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title="Completed This Month"
                                value={completedThisMonth}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title="Total Sessions"
                                value={bookings.length}
                                prefix={<UserOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Filters */}
                <Card className="mb-6">
                    <div className="flex gap-4 items-center">
                        <span className="font-medium">Filters:</span>
                        <Select
                            placeholder="Filter by subject"
                            style={{ minWidth: 150 }}
                            onChange={setSubjectFilter}
                            value={subjectFilter}
                        >
                            <Option value="all">All Subjects</Option>
                            {getSubjectOptions().map(subject => (
                                <Option key={subject} value={subject}>{subject}</Option>
                            ))}
                        </Select>
                    </div>
                </Card>

                {/* Booking List with Tabs */}
                <Card className="shadow-sm">
                    <Tabs defaultActiveKey="upcoming" size="large">
                        <TabPane tab={getStatusBadge('upcoming')} key="upcoming">
                            <List
                                dataSource={getFilteredBookings('upcoming')}
                                renderItem={renderBookingItem}
                                locale={{ emptyText: 'No upcoming bookings' }}
                            />
                        </TabPane>
                        <TabPane tab={getStatusBadge('completed')} key="completed">
                            <List
                                dataSource={getFilteredBookings('completed')}
                                renderItem={renderBookingItem}
                                locale={{ emptyText: 'No completed bookings' }}
                            />
                        </TabPane>
                        <TabPane tab={getStatusBadge('cancelled')} key="cancelled">
                            <List
                                dataSource={getFilteredBookings('cancelled')}
                                renderItem={renderBookingItem}
                                locale={{ emptyText: 'No cancelled bookings' }}
                            />
                        </TabPane>
                    </Tabs>
                </Card>

                {/* Confirmation Modal */}
                <Modal
                    title="Confirm Action"
                    open={!!selectedAction}
                    onOk={confirmAction}
                    onCancel={() => setSelectedAction(null)}
                    okButtonProps={{
                        danger: selectedAction?.action === 'cancel',
                        type: selectedAction?.action === 'complete' ? 'primary' : 'default'
                    }}
                    okText={selectedAction?.action === 'complete' ? 'Complete' : 'Cancel'}
                >
                    <p>Are you sure you want to
                        <strong> {selectedAction?.action === 'complete' ? 'mark this booking as completed' : 'cancel this booking'}</strong>?
                    </p>
                    <div className="mt-4">
                        <p><strong>Student:</strong> {selectedAction?.booking.student.name}</p>
                        <p><strong>Subject:</strong> {selectedAction?.booking.subject}</p>
                        <p><strong>Date & Time:</strong>
                            {selectedAction ? ` ${new Date(selectedAction.booking.time).toLocaleDateString()} at ${new Date(selectedAction.booking.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` : ''}
                        </p>
                    </div>
        </Modal>
            </div>
        </div>
    );
};

export default TeacherBookingRequestsPage;
