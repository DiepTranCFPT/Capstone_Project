import React from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
// import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProgressDataPoint {
  month: string;
  score: number;
}

interface DetailedReportProps {
  data: {
    overallPerformance: {
      averageScore: number;
      testsTaken: number;
      quizzesTaken: number;
      hoursStudied: number;
    },
    progressOverTime: ProgressDataPoint[];
  };
}

const DetailedReport: React.FC<DetailedReportProps> = ({ data }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Overall Performance</h2>
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic title="Average Score" value={data.overallPerformance.averageScore} precision={2} suffix="%" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Tests Taken" value={data.overallPerformance.testsTaken} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Quizzes Taken" value={data.overallPerformance.quizzesTaken} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Hours Studied" value={data.overallPerformance.hoursStudied} precision={1} />
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <h3 className="text-xl font-bold mb-4">Progress Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data.progressOverTime}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Button type="primary" className="mt-4">
        Download Report as PDF
      </Button>
    </div>
  );
};

export default DetailedReport;
