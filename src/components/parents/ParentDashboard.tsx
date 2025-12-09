import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Progress, Button, Avatar, Typography, Modal, Space } from 'antd';
import { Link } from 'react-router-dom';
import { useParent } from '~/hooks/useParent';
import type { ChildInfo } from '~/types/parent';
import { DisconnectOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Loading from '../common/Loading';

const { Text } = Typography;

const ParentDashboard: React.FC = () => {
  const { children, loading, fetchChildren, unlinkStudent } = useParent();

  // State for unlink confirmation modal
  const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<{ email: string; name: string } | null>(null);
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleUnlink = (email: string, name: string) => {
    setUnlinkTarget({ email, name });
    setIsUnlinkModalOpen(true);
  };

  const handleConfirmUnlink = async () => {
    if (!unlinkTarget) return;

    setUnlinkLoading(true);
    const success = await unlinkStudent(unlinkTarget.email);
    setUnlinkLoading(false);

    if (success) {
      fetchChildren();
    }

    setIsUnlinkModalOpen(false);
    setUnlinkTarget(null);
  };

  const handleCancelUnlink = () => {
    setIsUnlinkModalOpen(false);
    setUnlinkTarget(null);
  };

  if (loading) {
    return <Loading />
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
                  <Progress
                    type="circle"
                    percent={Number(child.averageScore.toFixed(1))}
                    format={(percent) => `${percent}%`}
                  />
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
                        View Detail
                      </Button>
                    </Link>
                    <Button
                      danger
                      icon={<DisconnectOutlined />}
                      onClick={() => handleUnlink(child.email, child.studentName)}
                      block
                    >
                      Unlink
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Unlink Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined className="text-orange-500 text-xl" />
            <span>Confirm Unlink</span>
          </div>
        }
        open={isUnlinkModalOpen}
        onCancel={handleCancelUnlink}
        footer={[
          <Button key="cancel" onClick={handleCancelUnlink}>
            Cancel
          </Button>,
          <Button
            key="unlink"
            type="primary"
            danger
            loading={unlinkLoading}
            onClick={handleConfirmUnlink}
          >
            Unlink
          </Button>,
        ]}
      >
        <p>Are you sure you want to unlink from student <strong>{unlinkTarget?.name}</strong>?</p>
      </Modal>
    </div>
  );
};

export default ParentDashboard;
