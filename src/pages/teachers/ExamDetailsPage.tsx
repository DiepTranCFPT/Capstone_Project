import React, { useEffect } from "react";
import { Button, Card, Tag, Descriptions, List, Typography, Space, Divider, Spin } from "antd";
import { EditOutlined, ArrowLeftOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useExams } from "~/hooks/useExams";

const { Title, Text, Paragraph } = Typography;

const ExamDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const { currentExam, loading, fetchExamById } = useExams();

  useEffect(() => {
    if (examId) {
      fetchExamById(examId);
    }
  }, [examId, fetchExamById]);

  const handleEdit = () => {
    navigate(`/teacher/edit-exam/${examId}`);
  };

  const handleBack = () => {
    navigate('/teacher/exams');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentExam) {
    return (
      <div className="text-center py-12">
        <Title level={3}>Exam not found</Title>
        <Button onClick={handleBack} icon={<ArrowLeftOutlined />}>
          Back to Exams
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            type="text"
          >
            Back
          </Button>
          <div>
            <Title level={2} className="mb-0">{currentExam.title}</Title>
            <Text type="secondary">
              Created on {new Date(currentExam.createdAt).toLocaleDateString()}
            </Text>
          </div>
        </div>
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={handleEdit}
            size="large"
          >
            Edit Exam
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Exam Overview */}
          <Card title="Exam Overview">
            <Descriptions column={2}>
              <Descriptions.Item label="Duration">
                <Space>
                  <ClockCircleOutlined />
                  {currentExam.duration} minutes
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Passing Score">
                {currentExam.passingScore}%
              </Descriptions.Item>
              <Descriptions.Item label="Total Questions">
                {currentExam.questionContents?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={currentExam.isActive ? 'green' : 'red'}>
                  {currentExam.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {currentExam.description && (
              <>
                <Divider />
                <div>
                  <Text strong>Description:</Text>
                  <Paragraph className="mt-2">
                    {currentExam.description}
                  </Paragraph>
                </div>
              </>
            )}
          </Card>

          {/* Subjects */}
          <Card title="Subjects">
            <div className="flex flex-wrap gap-2">
              {currentExam.subjectNames?.map((subject, index) => (
                <Tag key={index} color="blue">
                  {subject}
                </Tag>
              )) || <Text type="secondary">No subjects specified</Text>}
            </div>
          </Card>

          {/* Questions Preview */}
          <Card title="Questions Preview">
            <List
              dataSource={currentExam.questionContents || []}
              renderItem={(question, index) => (
                <List.Item>
                  <div className="w-full">
                    <div className="flex items-start gap-3">
                      <Text strong className="text-blue-600 min-w-[24px]">
                        {index + 1}.
                      </Text>
                      <div className="flex-1">
                        <Text>{question}</Text>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: 'No questions available' }}
            />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card title="Quick Stats">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Text>Questions:</Text>
                <Text strong>{currentExam.questionContents?.length || 0}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Duration:</Text>
                <Text strong>{currentExam.duration} min</Text>
              </div>
              <div className="flex justify-between">
                <Text>Passing Score:</Text>
                <Text strong>{currentExam.passingScore}%</Text>
              </div>
              <div className="flex justify-between">
                <Text>Status:</Text>
                <Tag color={currentExam.isActive ? 'green' : 'red'}>
                  {currentExam.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card title="Actions">
            <Space direction="vertical" className="w-full">
              <Button
                type="primary"
                icon={<EditOutlined />}
                block
                onClick={handleEdit}
              >
                Edit Exam
              </Button>
              <Button block onClick={handleBack}>
                Back to Exam List
              </Button>
            </Space>
          </Card>

          {/* Exam Info */}
          <Card title="Exam Information">
            <div className="space-y-2 text-sm">
              <div>
                <Text type="secondary">Created:</Text>
                <br />
                <Text>{new Date(currentExam.createdAt).toLocaleString()}</Text>
              </div>
              <div>
                <Text type="secondary">Last Updated:</Text>
                <br />
                <Text>{new Date(currentExam.createdAt).toLocaleString()}</Text>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailsPage;
