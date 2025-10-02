import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ParentDashboard from '~/components/parents/ParentDashboard';

const data = [
  {
    name: 'Jan',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Feb',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Mar',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Apr',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'May',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Jun',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Jul',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

const ParentDashboardPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Parent Dashboard</h1>
      <div className='flex flex-col gap-4'>
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Overall Score"
                value={88.2}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                prefix={<ArrowUpOutlined />}
                suffix="%"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Activities"
                value={9.3}
                precision={2}
                valueStyle={{ color: '#cf1322' }}
                prefix={<ArrowDownOutlined />}
                suffix="%"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Tokens" value={112893} />
            </Card>
          </Col>
        </Row>
        <Card className="mt-4">
          <h2 className="text-xl font-bold mb-4">Monthly Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pv" fill="#8884d8" />
              <Bar dataKey="uv" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div className="mt-4">
        <ParentDashboard />
      </div>
    </div>
  );
};

export default ParentDashboardPage;