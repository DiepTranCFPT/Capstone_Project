import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { ArrowUpOutlined, UserOutlined } from '@ant-design/icons';
import ParentDashboard from '~/components/parents/ParentDashboard';
import { useParent } from '~/hooks/useParent';

const ParentDashboardPage: React.FC = () => {
  const { children } = useParent();

  // Calculate statistics from children data
  const totalChildren = children.length;
  const totalExams = children.reduce((sum, child) => sum + child.totalExamsTaken, 0);
  const averageScore = totalChildren > 0
    ? children.reduce((sum, child) => sum + child.averageScore, 0) / totalChildren
    : 0;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Parent Dashboard</h1>
      <div className='flex flex-col gap-4'>
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Average Score"
                value={averageScore.toFixed(1)}
                precision={1}
                valueStyle={{ color: averageScore >= 70 ? '#3f8600' : '#cf1322' }}
                prefix={averageScore >= 70 ? <ArrowUpOutlined /> : null}
                suffix="%"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Exams"
                value={totalExams}
                valueStyle={{ color: '#3f8600' }}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Linked Students"
                value={totalChildren}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
        </Row>
        <Card className="mt-4">
          <h2 className="text-xl font-bold mb-4">Your Children Overview</h2>
          <p>Monitor your children's academic progress and performance statistics.</p>
          {/* Future: Add charts when we implement exam history trends */}
        </Card>
      </div>
      <div className="mt-4">
        <ParentDashboard />
      </div>
    </div>
  );
};

export default ParentDashboardPage;
