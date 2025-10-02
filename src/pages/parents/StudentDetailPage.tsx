import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Tabs } from 'antd';
import DetailedReport from '~/components/parents/DetailedReport';
import { studentReportData } from '~/data/studentReportData';

const { TabPane } = Tabs;

const StudentDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();

  // In a real application, you would fetch data based on studentId
  // For now, we use the mock data
  const studentData = studentReportData; // Assuming studentId matches the mock data for now

  if (!studentData) {
    return <div>Loading student data...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Student Detail: {studentData.studentInfo.name}</h1>
      <Card title="Student Information" className="mb-4">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Name">{studentData.studentInfo.name}</Descriptions.Item>
          <Descriptions.Item label="Grade">{studentData.studentInfo.grade}</Descriptions.Item>
          <Descriptions.Item label="Parent">{studentData.studentInfo.parentName}</Descriptions.Item>
          <Descriptions.Item label="Student ID">{studentData.studentInfo.id}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Overall Performance" key="1">
          <DetailedReport data={studentData} />
        </TabPane>
        <TabPane tab="Test Results" key="2">
          <Card title="Recent Test Results">
            {/* You can map through studentData.testResults here to display individual test cards */}
            <p>Displaying test results for {studentData.studentInfo.name}</p>
            {studentData.testResults.map((test) => (
              <Card key={test.id} size="small" title={test.testName} style={{ marginBottom: 10 }}>
                <p>Score: {test.score}%</p>
                <p>Date: {test.date}</p>
                {/* Add a link to detailed test report if available */}
              </Card>
            ))}
          </Card>
        </TabPane>
        {/* Add more tabs for other sections like Progress Over Time */}
      </Tabs>
    </div>
  );
};

export default StudentDetailPage;