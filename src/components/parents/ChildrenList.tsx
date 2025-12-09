import React from 'react';
import { Card, Row, Col, Progress, Button, Avatar, Typography, Space, Empty } from 'antd';
import { Link } from 'react-router-dom';
import type { ChildInfo } from '~/types/parent';
import { DisconnectOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import Loading from '../common/Loading';

const { Text, Title } = Typography;

interface ChildrenListProps {
  children: ChildInfo[];
  loading: boolean;
  onUnlink: (email: string, name: string) => void;
  onAddCredits?: (child: ChildInfo) => void;
}

const ChildrenList: React.FC<ChildrenListProps> = ({ 
  children, 
  loading, 
  onUnlink,
  onAddCredits 
}) => {
  if (loading) {
    return (
      <Loading />
    );
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-12">
        <Empty
          image={<UserOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description={
            <div>
              <Title level={4}>No linked students</Title>
              <Text type="secondary">You haven't linked any student accounts yet.</Text>
            </div>
          }
        >
          <Link to="/parent/link-student">
            <Button type="primary" size="large">
              Link Student Account
            </Button>
          </Link>
        </Empty>
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {children.map((child: ChildInfo) => (
        <Col xs={24} sm={12} lg={8} xl={6} key={child.studentId}>
          <Card
            className="h-full shadow-md hover:shadow-lg transition-shadow"
            title={
              <div className="flex items-center gap-3">
                <Avatar src={child.avatarUrl} size="large" icon={<UserOutlined />}>
                  {child.studentName.charAt(0)}
                </Avatar>
                <div>
                  <Text strong className="text-base">{child.studentName}</Text>
                  <br />
                  <Text type="secondary" className="text-xs">{child.email}</Text>
                </div>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="text-center">
                  <Progress
                    type="circle"
                    percent={Number(child.averageScore.toFixed(1))}
                    format={(percent) => `${percent}%`}
                    size={100}
                  />
                  <Text className="block mt-2 text-sm text-gray-600">Average Score</Text>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text type="secondary">Total Exams:</Text>
                  <Text strong>{child.totalExamsTaken}</Text>
                </div>
                {child.lastExamTitle && (
                  <div className="flex justify-between">
                    <Text type="secondary">Last Exam:</Text>
                    <Text className="text-xs" ellipsis style={{ maxWidth: '150px' }}>
                      {child.lastExamTitle}
                    </Text>
                  </div>
                )}
              </div>

              <Space direction="vertical" className="w-full" size="small">
                <Link to={`/parent/student/${child.studentId}`}>
                  <Button type="primary" icon={<EyeOutlined />} block>
                    View Details
                  </Button>
                </Link>
                {onAddCredits && (
                  <Button 
                    onClick={() => onAddCredits(child)} 
                    block
                  >
                    Add Credits
                  </Button>
                )}
                <Button
                  danger
                  icon={<DisconnectOutlined />}
                  onClick={() => onUnlink(child.email, child.studentName)}
                  block
                >
                  Unlink
                </Button>
              </Space>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ChildrenList;

