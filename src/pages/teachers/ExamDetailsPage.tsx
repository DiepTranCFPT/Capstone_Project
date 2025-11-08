import React, { useEffect, useState } from "react";
import { Button, Card, Tag, Descriptions, Table, Typography, Space, Divider, Spin, Modal, Select, InputNumber, Form } from "antd";
import { EditOutlined, ArrowLeftOutlined, ClockCircleOutlined, DeleteOutlined, ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useExamTemplates } from "~/hooks/useExams";
import type { CreateExamRulePayload, ExamRule } from "~/types/test";

const { Title, Text, Paragraph } = Typography;

const ExamDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const { currentTemplate, loading, fetchTemplateById, removeTemplate, addRule, updateRule, removeRule, questionTopics, fetchQuestionTopics } = useExamTemplates();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<{ id: string; data: CreateExamRulePayload } | null>(null);
  const [ruleForm] = Form.useForm();

  useEffect(() => {
    if (examId) {
      fetchTemplateById(examId);
    }
    fetchQuestionTopics();
  }, [examId, fetchTemplateById, fetchQuestionTopics]);

  const handleEdit = () => {
    navigate(`/teacher/edit-template/${examId}`);
  };

  const handleBack = () => {
    navigate('/teacher/templates');
  };

  const handleDelete = () => {
    if (!currentTemplate) {
      return;
    }
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await removeTemplate(currentTemplate!.id);
      setDeleteModalVisible(false);
      navigate('/teacher/templates');
    } catch (error) {
      console.error('Delete template error:', error);
      setDeleteModalVisible(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
  };

  const handleAddRule = () => {
    setEditingRule(null);
    ruleForm.resetFields();
    setRuleModalVisible(true);
  };

  const handleEditRule = (rule: ExamRule) => {
    setEditingRule({ id: rule.id, data: {
      topicName: rule.topicName,
      difficultyName: rule.difficultyName,
      questionType: rule.questionType,
      numberOfQuestions: rule.numberOfQuestions,
      points: rule.points,
    }});
    ruleForm.setFieldsValue({
      topicName: rule.topicName,
      difficultyName: rule.difficultyName,
      questionType: rule.questionType,
      numberOfQuestions: rule.numberOfQuestions,
      points: rule.points,
    });
    setRuleModalVisible(true);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!examId) return;
    await removeRule(examId, ruleId);
  };

  const handleRuleModalOk = async () => {
    try {
      const values = await ruleForm.validateFields();
      if (!examId) return;

      if (editingRule) {
        await updateRule(examId, editingRule.id, values);
      } else {
        await addRule(examId, values);
      }
      setRuleModalVisible(false);
      ruleForm.resetFields();
      setEditingRule(null);
    } catch (error) {
      console.error('Rule operation error:', error);
    }
  };

  const handleRuleModalCancel = () => {
    setRuleModalVisible(false);
    ruleForm.resetFields();
    setEditingRule(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentTemplate) {
    return (
      <div className="text-center py-12">
        <Title level={3}>Template not found</Title>
        <Button onClick={handleBack} icon={<ArrowLeftOutlined />}>
          Back to Templates
        </Button>
      </div>
    );
  }

  const ruleColumns = [
    {
      title: 'Topic',
      dataIndex: 'topic',
      key: 'topic',
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty: string) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
          difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {difficulty}
        </span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'questionType',
      key: 'questionType',
      render: (type: string) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          type === 'mcq' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
        }`}>
          {type.toUpperCase()}
        </span>
      ),
    },
    {
      title: 'Questions',
      dataIndex: 'numberOfQuestions',
      key: 'numberOfQuestions',
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (rule: ExamRule) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleEditRule(rule)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            size="small"
            onClick={() => handleDeleteRule(rule.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div>
            <Title level={2} className="mb-0">{currentTemplate.title}</Title>
            <Text type="secondary">
              Created on {currentTemplate.createdAt ? new Date(currentTemplate.createdAt).toLocaleDateString() : 'Unknown'}
            </Text>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 flex flex-col gap-2">
          {/* Template Overview */}
          <Card title="Template Overview">
            <Descriptions column={2}>
              <Descriptions.Item label="Duration">
                <Space>
                  <ClockCircleOutlined />
                  {currentTemplate.duration} minutes
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Passing Score">
                {currentTemplate.passingScore}%
              </Descriptions.Item>
              <Descriptions.Item label="Total Rules">
                {currentTemplate.rules?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={currentTemplate.isActive ? 'green' : 'red'}>
                  {currentTemplate.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {currentTemplate.description && (
              <>
                <Divider />
                <div>
                  <Text strong>Description:</Text>
                  <Paragraph className="mt-2">
                    {currentTemplate.description}
                  </Paragraph>
                </div>
              </>
            )}
          </Card>

          {/* Template Rules */}
          <Card title="Question Generation Rules">
            <div className="mb-4">
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddRule}
              >
                Add Rule
              </Button>
            </div>
            <Table
              columns={ruleColumns}
              dataSource={currentTemplate.rules?.map((rule, index) => ({ ...rule, key: index })) || []}
              pagination={false}
              size="small"
              locale={{ emptyText: 'No rules defined' }}
            />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-2">
          {/* Quick Stats */}
          <Card title="Quick Stats">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Text>Rules:</Text>
                <Text strong>{currentTemplate.rules?.length || 0}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Duration:</Text>
                <Text strong>{currentTemplate.duration} min</Text>
              </div>
              <div className="flex justify-between">
                <Text>Passing Score:</Text>
                <Text strong>{currentTemplate.passingScore}%</Text>
              </div>
              <div className="flex justify-between">
                <Text>Status:</Text>
                <Tag color={currentTemplate.isActive ? 'green' : 'red'}>
                  {currentTemplate.isActive ? 'Active' : 'Inactive'}
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
                Edit Template
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                block
                onClick={handleDelete}
              >
                Delete Template
              </Button>
              <Button block onClick={handleBack}>
                Back to Templates
              </Button>
            </Space>
          </Card>

          {/* Template Info */}
          <Card title="Template Information">
            <div className="space-y-2 text-sm">
              <div>
                <Text type="secondary">Created:</Text>
                <br />
                <Text>{currentTemplate.createdBy || 'Unknown'}</Text>
              </div>
              <div>
                <Text type="secondary">Last Updated:</Text>
                <br />
                <Text>{currentTemplate.createdAt ? new Date(currentTemplate.createdAt).toLocaleString() : 'Unknown'}</Text>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
            <span>Delete Template</span>
          </div>
        }
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete <strong>"{currentTemplate?.title}"</strong>?</p>
        <p className="text-red-600 text-sm mt-2">This action cannot be undone.</p>
      </Modal>

      {/* Rule Modal */}
      <Modal
        title={editingRule ? "Edit Rule" : "Add Rule"}
        open={ruleModalVisible}
        onOk={handleRuleModalOk}
        onCancel={handleRuleModalCancel}
        okText={editingRule ? "Update" : "Add"}
      >
        <Form
          form={ruleForm}
          layout="vertical"
          initialValues={{
            topicName: '',
            difficultyName: 'Easy',
            questionType: 'mcq',
            numberOfQuestions: 1,
            points: 1,
          }}
        >
          <Form.Item
            name="topicName"
            label="Topic Name"
            rules={[{ required: true, message: 'Please select topic name' }]}
          >
            <Select placeholder="Select a topic" showSearch optionFilterProp="children">
              {questionTopics.map((topic) => (
                <Select.Option key={topic.id} value={topic.name}>
                  {topic.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="difficultyName"
            label="Difficulty"
            rules={[{ required: true, message: 'Please select difficulty' }]}
          >
            <Select>
              <Select.Option value="Easy">Easy</Select.Option>
              <Select.Option value="Medium">Medium</Select.Option>
              <Select.Option value="Hard">Hard</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="questionType"
            label="Question Type"
            rules={[{ required: true, message: 'Please select question type' }]}
          >
            <Select>
              <Select.Option value="mcq">MCQ</Select.Option>
              <Select.Option value="frq">FRQ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="numberOfQuestions"
            label="Number of Questions"
            rules={[{ required: true, message: 'Please enter number of questions' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="points"
            label="Points per Question"
            rules={[{ required: true, message: 'Please enter points' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamDetailsPage;
