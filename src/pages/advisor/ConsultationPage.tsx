import React from 'react';
import { Card, List, Tag, Button, Modal, message } from 'antd';
import { mockConsultations } from '../../data/advisor';
import type { Consultation } from '../../types/advisor';
import { VideoCameraAddOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const ConsultationPage: React.FC = () => {
    const { user } = useAuth();

    const handleStartSession = (consultation: Consultation) => {
        Modal.confirm({
            title: `Bắt đầu buổi tư vấn 1-1 với ${consultation.studentName}?`,
            content: 'Điều này sẽ sử dụng một token tư vấn. Một liên kết cuộc họp sẽ được tạo và gửi đi.',
            onOk() {
                console.log('Starting session:', consultation.id);
                message.success('Buổi tư vấn đã bắt đầu và liên kết đã được gửi!');
            },
        });
    };

    const upcomingConsultations = mockConsultations.filter(c => c.status === 'upcoming');
    const completedConsultations = mockConsultations.filter(c => c.status === 'completed');

    return (
        <div className='grid grid-cols-1 gap-4'>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Tư vấn 1-1</h1>
            <Card title="Thông tin tư vấn" className="mb-6">
                <p>Bạn có <Tag color="purple">{user?.tokenBalance ?? 0}</Tag> token có sẵn để tư vấn.</p>
            </Card>

            <Card title="Tư vấn sắp tới" className="mb-6">
                <List
                    dataSource={upcomingConsultations}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                <Button type="primary" icon={<VideoCameraAddOutlined />} onClick={() => handleStartSession(item)}>Bắt đầu buổi tư vấn</Button>
                            ]}
                        >
                            <List.Item.Meta
                                title={item.studentName}
                                description={`Ngày: ${item.date} lúc ${item.time}`}
                            />
                            <Tag color="blue">{item.status.toUpperCase()}</Tag>
                        </List.Item>
                    )}
                />
            </Card>

            <Card title="Tư vấn đã hoàn thành">
                <List
                    dataSource={completedConsultations}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                title={item.studentName}
                                description={`Ngày: ${item.date} lúc ${item.time}`}
                            />
                            <div>
                                <strong>Ghi chú:</strong> {item.notes || 'Không có ghi chú.'}
                            </div>
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default ConsultationPage;

