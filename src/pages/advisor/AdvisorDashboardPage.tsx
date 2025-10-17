import React from 'react';
import { Card, Col, Row, Statistic, List, Avatar, Tag } from 'antd';
import { UserOutlined, BellOutlined, MessageOutlined } from '@ant-design/icons';
import { mockAssignedStudents } from '../../data/advisor';
import { Link } from 'react-router-dom';

const AdvisorDashboardPage: React.FC = () => {
    const studentsAtRisk = mockAssignedStudents.filter(s => s.status === 'at_risk').length;
    const upcomingConsultations = 2; // Mock data

    return (
        <div>
            <h1 className='text-3xl font-bold text-gray-800 mb-6'>Bảng điều khiển của Cố vấn học tập</h1>
            <Row gutter={[16, 16]} className='mb-6'>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic title='Tổng số sinh viên được giao' value={mockAssignedStudents.length} prefix={<UserOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic title="Sinh viên có nguy cơ" value={studentsAtRisk} valueStyle={{ color: '#cf1322' }} prefix={<BellOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic title="Tư vấn sắp tới" value={upcomingConsultations} prefix={<MessageOutlined />} />
                    </Card>
                </Col>
            </Row>

            <Card title="Tổng quan nhanh về sinh viên">
                <List
                    itemLayout="horizontal"
                    dataSource={mockAssignedStudents}
                    renderItem={item => (
                        <List.Item
                            actions={[<Link to={`/advisor/student-tracking`}>Xem chi tiết</Link>]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar src={item.avatar} />}
                                title={<a href="#">{item.name}</a>}
                                description={`Mục tiêu: ${item.apGoal}`}
                            />
                            <div>
                                <Tag color={item.status === 'on_track' ? 'green' : item.status === 'behind' ? 'orange' : 'red'}>
                                    {item.status.replace('_', ' ').toUpperCase()}
                                </Tag>
                            </div>
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    )
}
export default AdvisorDashboardPage;

