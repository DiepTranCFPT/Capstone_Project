import React, { useEffect } from 'react';
import { Card, Row, Col, Progress, Button, Avatar, Typography, Modal, Space } from 'antd';
import { Link } from 'react-router-dom';
import { useParent } from '~/hooks/useParent';
import type { ChildInfo } from '~/types/parent';
import { DisconnectOutlined, EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ParentDashboard: React.FC = () => {
  const { children, loading, fetchChildren, unlinkStudent } = useParent();

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleUnlink = async (email: string, name: string) => {
    Modal.confirm({
      title: 'Xác nhận hủy liên kết',
      content: `Bạn có chắc chắn muốn hủy liên kết với học sinh ${name}?`,
      okText: 'Hủy liên kết',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        const success = await unlinkStudent(email);
        if (success) {
          fetchChildren();
        }
      },
    });
  };

  if (loading) {
    return <div>Loading children data...</div>;
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Your Children</h2>
        <p>No linked student accounts yet.</p>
        <Link to="/parent/link-student">
          <Button type="primary" className="mt-4">
            Link Student Account
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Children</h2>
      <Row gutter={16}>
        {children.map((child: ChildInfo) => (
          <Col span={12} key={child.studentId}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <Avatar src={child.avatarUrl} size="small">
                    {child.studentName.charAt(0)}
                  </Avatar>
                  <Text strong>{child.studentName}</Text>
                </div>
              }
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Progress type="circle" percent={Math.round(child.averageScore)} />
                  <Text className="text-center block mt-2">Average Score</Text>
                </Col>
                <Col span={12}>
                  <p className="text-gray-600 mb-2">Total Exams: {child.totalExamsTaken}</p>
                  {child.lastExamTitle && (
                    <p className="text-gray-600 mb-2">Last Exam: {child.lastExamTitle}</p>
                  )}
                  <Space direction="vertical" className="w-full">
                    <Link to={`/parent/student/${child.studentId}`}>
                      <Button type="primary" icon={<EyeOutlined />} block>
                        Xem chi tiết
                      </Button>
                    </Link>
                    <Button
                      danger
                      icon={<DisconnectOutlined />}
                      onClick={() => handleUnlink(child.email, child.studentName)}
                      block
                    >
                      Hủy liên kết
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ParentDashboard;
