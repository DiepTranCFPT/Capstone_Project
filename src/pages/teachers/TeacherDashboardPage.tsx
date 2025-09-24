import { Card, Col, Row, Statistic } from 'antd';
import React from 'react';
import { UsergroupAddOutlined, BookOutlined, CheckSquareOutlined } from '@ant-design/icons';

const TeacherDashboradPage: React.FC = () => {
    return (
        <div>
            <h1 className='text-3xl font-bold text-gray-800 mb-6'>Teacher Dashborad</h1>
            {/* Qick Stats*/}
            <Row gutter={[16, 16]} className='mb-6'>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title='Total Students'
                            value={125}
                            prefix={<UsergroupAddOutlined />}
                        />

                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Classes"
                            value={4}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Pending Gradings"
                            value={12}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<CheckSquareOutlined />}
                        />
                    </Card>
                </Col>
            </Row>
            {/* Other components will be added here later */}
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title="Recent Activity">
                        <p>Student 'Nguyen Van B' submitted 'Mid-term Exam'.</p>
                        <p>You created a new class 'AP Physics C'.</p>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
export default TeacherDashboradPage;