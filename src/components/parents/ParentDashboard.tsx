import React from 'react';
import { Card, Row, Col, Progress, Button } from 'antd';
import { Link } from 'react-router-dom';

const ParentDashboard: React.FC = () => {
  // Mock data for student progress
  const students = [
    {
      studentId: '1',
      studentName: 'John Doe',
      lastActivity: 'Completed Math Quiz',
      overallScore: 85,
    },
    {
      studentId: '2',
      studentName: 'Jane Smith',
      lastActivity: 'Practiced English Vocabulary',
      overallScore: 92,
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Children</h2>
      <Row gutter={16}>
        {students.map((student, index) => (
          <Col span={12} key={index}>
            <Card title={student.studentName}>
              <Row gutter={16}>
                <Col span={12}>
                  <Progress type="circle" percent={student.overallScore} />
                </Col>
                <Col span={12}>
                  <p className="text-gray-600 mb-2">Last activity: {student.lastActivity}</p>
                  <Link to={`/parent/student/${student.studentId}`}>
                    <Button type="primary">View Detailed Report</Button>
                  </Link>
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