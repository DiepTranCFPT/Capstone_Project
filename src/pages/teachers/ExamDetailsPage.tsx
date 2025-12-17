import React, { useEffect, useState, useMemo } from "react";
import { Button, Card, Tag, Descriptions, Table, Typography, Space, Divider, Spin, Modal, Select, InputNumber, Tooltip, Slider } from "antd";
import { EditOutlined, ArrowLeftOutlined, ClockCircleOutlined, DeleteOutlined, ExclamationCircleOutlined, PlusOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useExamTemplates } from "~/hooks/useExams";
import { useQuestionTopics } from "~/hooks/useQuestionTopics";
import { useQuestionBank } from "~/hooks/useQuestionBank";
import type { CreateExamRulePayload, ExamRule } from "~/types/test";
import type { QuestionBankItem } from "~/types/question";

const { Title, Text, Paragraph } = Typography;

const ExamDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const { currentTemplate, loading, fetchTemplateById, removeTemplate, addRule, updateRule, removeRule } = useExamTemplates();
  const { topics: questionTopics } = useQuestionTopics();
  const { questions: subjectQuestions, fetchBySubjectId, loading: loadingQuestions } = useQuestionBank();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<{ id: string; data: CreateExamRulePayload } | null>(null);

  // Inline rule form state (similar to CreateExamPage)
  const [ruleForm, setRuleForm] = useState<CreateExamRulePayload>({
    topicName: '',
    difficultyName: 'Easy',
    questionType: 'mcq',
    numberOfQuestions: 0,
    points: 1,
    percentage: 10, // Mặc định 10%
  });

  // Tổng số câu hỏi mong muốn (lấy từ template hoặc mặc định 20)
  const totalQuestions = currentTemplate?.totalQuestions || 20;

  // Tính số câu hỏi từ percentage
  const calculateQuestions = (percentage: number) => {
    return Math.floor((percentage / 100) * totalQuestions);
  };

  useEffect(() => {
    if (examId) {
      fetchTemplateById(examId);
    }
  }, [examId, fetchTemplateById]);

  // Fetch questions when template is loaded
  useEffect(() => {
    if (currentTemplate?.subject?.id) {
      fetchBySubjectId(currentTemplate.subject.id);
    }
  }, [currentTemplate, fetchBySubjectId]);

  // Calculate question stats
  const questionStats = useMemo(() => {
    const stats: Record<string, { total: number; easy: number; medium: number; hard: number; mcq: number; frq: number }> = {};

    subjectQuestions.forEach((q: QuestionBankItem) => {
      const topic = q.topic || 'Uncategorized';
      if (!stats[topic]) {
        stats[topic] = { total: 0, easy: 0, medium: 0, hard: 0, mcq: 0, frq: 0 };
      }

      stats[topic].total++;

      const difficulty = q.difficulty?.toLowerCase();
      if (difficulty === 'easy') stats[topic].easy++;
      else if (difficulty === 'medium') stats[topic].medium++;
      else if (difficulty === 'hard') stats[topic].hard++;

      const type = q.type?.toLowerCase();
      if (type === 'mcq') stats[topic].mcq++;
      else if (type === 'frq') stats[topic].frq++;
    });

    return stats;
  }, [subjectQuestions]);

  // Get available count for current form selection
  const availableCount = useMemo(() => {
    if (!ruleForm.topicName) return 0;

    // Filter the actual questions list to get the precise count
    const filteredQuestions = subjectQuestions.filter(q =>
      (q.topic === ruleForm.topicName) &&
      (!ruleForm.difficultyName || q.difficulty?.toLowerCase() === ruleForm.difficultyName.toLowerCase()) &&
      (!ruleForm.questionType || q.type?.toLowerCase() === ruleForm.questionType.toLowerCase())
    );

    return filteredQuestions.length;
  }, [subjectQuestions, ruleForm.topicName, ruleForm.difficultyName, ruleForm.questionType]);

  // Helper: đếm số câu hỏi theo topic + difficulty + type
  const getTypeCountForDifficulty = (type: 'mcq' | 'frq') => {
    if (!ruleForm.topicName || !ruleForm.difficultyName) return 0;
    return subjectQuestions.filter(q =>
      q.topic === ruleForm.topicName &&
      q.difficulty?.toLowerCase() === ruleForm.difficultyName.toLowerCase() &&
      q.type?.toLowerCase() === type
    ).length;
  };

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
    setRuleForm({
      topicName: '',
      difficultyName: 'Easy',
      questionType: 'mcq',
      numberOfQuestions: 1,
      points: 1,
    });
    setShowRuleForm(true);
  };

  const handleEditRule = (rule: ExamRule) => {
    setEditingRule({
      id: rule.id, data: {
        topicName: rule.topicName,
        difficultyName: rule.difficultyName,
        questionType: rule.questionType,
        numberOfQuestions: rule.numberOfQuestions,
        points: rule.points,
      }
    });
    setRuleForm({
      topicName: rule.topicName,
      difficultyName: rule.difficultyName,
      questionType: rule.questionType,
      numberOfQuestions: rule.numberOfQuestions,
      points: rule.points,
      percentage: rule.percentage || 10, // Lấy percentage từ rule hoặc mặc định 10%
    });
    setShowRuleForm(true);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!examId) return;
    await removeRule(examId, ruleId);
  };

  const handleSaveRule = async () => {
    try {
      const calculatedQuestions = calculateQuestions(ruleForm.percentage || 0);

      // Validation
      if (!ruleForm.topicName) {
        return;
      }
      if (calculatedQuestions > availableCount) {
        return;
      }
      if (calculatedQuestions === 0) {
        return;
      }

      if (!examId) return;

      // Prepare rule data with calculated numberOfQuestions
      const ruleData = {
        ...ruleForm,
        numberOfQuestions: calculatedQuestions,
      };

      if (editingRule) {
        await updateRule(examId, editingRule.id, ruleData);
      } else {
        await addRule(examId, ruleData);
      }
      setShowRuleForm(false);
      setRuleForm({
        topicName: '',
        difficultyName: 'Easy',
        questionType: 'mcq',
        numberOfQuestions: 0,
        points: 1,
        percentage: 10,
      });
      setEditingRule(null);
    } catch (error) {
      console.error('Rule operation error:', error);
    }
  };

  const handleCancelRule = () => {
    setShowRuleForm(false);
    setRuleForm({
      topicName: '',
      difficultyName: 'Easy',
      questionType: 'mcq',
      numberOfQuestions: 1,
      points: 1,
    });
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
        <span className={`px-2 py-1 rounded text-xs font-medium ${difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
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
        <span className={`px-2 py-1 rounded text-xs font-medium ${type === 'mcq' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
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
                {currentTemplate.passingScore}
              </Descriptions.Item>
              <Descriptions.Item label="Total Rules">
                {currentTemplate.rules?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={currentTemplate.isActive ? 'green' : 'red'}>
                  {currentTemplate.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Token Cost">
                {currentTemplate.tokenCost === 0 ? 'Free' : `${currentTemplate.tokenCost.toLocaleString('vi-VN')} VNĐ`}
              </Descriptions.Item>
              <Descriptions.Item label="Average Rating">
                ⭐ {currentTemplate.averageRating?.toFixed(1) || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Total Ratings">
                {currentTemplate.totalRatings || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Total Takers">
                {currentTemplate.totalTakers || 0}
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

            {/* Score Mapping Display */}
            {currentTemplate.scoreMapping && Object.keys(currentTemplate.scoreMapping).length > 0 && (
              <>
                <Divider />
                <div>
                  <Text strong>Score Mapping (AP Score):</Text>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(currentTemplate.scoreMapping)
                      .sort(([a], [b]) => Number(b) - Number(a))
                      .map(([grade, range]) => (
                        <Tag key={grade} color="blue">
                          <span className="font-bold">{grade}</span>: {range.min}-{range.max}%
                        </Tag>
                      ))}
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Template Rules */}
          <Card title="Question Generation Rules">
            <div className="space-y-4">
              {!showRuleForm ? (
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={handleAddRule}
                  block
                >
                  Add Rule
                </Button>
              ) : (
                <Card size="small" className="border-dashed">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name *</label>
                      <Select
                        placeholder="Select a topic"
                        value={ruleForm.topicName || undefined}
                        onChange={(value) => setRuleForm({ ...ruleForm, topicName: value })}
                        showSearch
                        optionFilterProp="children"
                        style={{ width: '100%' }}
                        loading={loadingQuestions}
                      >
                        {questionTopics.map((topic) => {
                          const stats = questionStats[topic.name];
                          const count = stats ? stats.total : 0;
                          return (
                            <Select.Option key={topic.id} value={topic.name}>
                              <div className="flex justify-between items-center">
                                <span>{topic.name}</span>
                                <Tag color={count > 0 ? "blue" : "default"}>{count} Qs</Tag>
                              </div>
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                        <Select
                          value={ruleForm.difficultyName}
                          onChange={(value) => setRuleForm({ ...ruleForm, difficultyName: value })}
                          style={{ width: '100%' }}
                        >
                          {['Easy', 'Medium', 'Hard'].map(diff => {
                            const topicStats = questionStats[ruleForm.topicName];
                            const count = topicStats ? topicStats[diff.toLowerCase() as 'easy' | 'medium' | 'hard'] : 0;
                            return (
                              <Select.Option key={diff} value={diff}>
                                <div className="flex justify-between items-center">
                                  <span>{diff}</span>
                                  {ruleForm.topicName && (
                                    <span className="text-xs text-gray-500">({count})</span>
                                  )}
                                </div>
                              </Select.Option>
                            );
                          })}
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                        <Select
                          value={ruleForm.questionType}
                          onChange={(value) => setRuleForm({ ...ruleForm, questionType: value })}
                          style={{ width: '100%' }}
                        >
                          <Select.Option value="mcq">
                            <div className="flex justify-between items-center">
                              <span>MCQ</span>
                              {ruleForm.topicName && ruleForm.difficultyName && (
                                <span className="text-xs text-gray-500">
                                  ({getTypeCountForDifficulty('mcq')})
                                </span>
                              )}
                            </div>
                          </Select.Option>
                          <Select.Option value="frq">
                            <div className="flex justify-between items-center">
                              <span>FRQ</span>
                              {ruleForm.topicName && ruleForm.difficultyName && (
                                <span className="text-xs text-gray-500">
                                  ({getTypeCountForDifficulty('frq')})
                                </span>
                              )}
                            </div>
                          </Select.Option>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Percentage (%)
                          <Tooltip title={`Equivalent: ${calculateQuestions(ruleForm.percentage || 0)} questions | Available: ${availableCount} questions`}>
                            <InfoCircleOutlined className="ml-1 text-gray-400" />
                          </Tooltip>
                        </label>
                        <div className="flex items-center gap-3">
                          <Slider
                            min={5}
                            max={100}
                            step={5}
                            value={ruleForm.percentage || 10}
                            onChange={(value) => setRuleForm({ ...ruleForm, percentage: value })}
                            style={{ flex: 1 }}
                          />
                          <InputNumber
                            min={1}
                            max={100}
                            value={ruleForm.percentage || 10}
                            onChange={(value) => setRuleForm({ ...ruleForm, percentage: value || 10 })}
                            style={{ width: 70 }}
                            formatter={(value) => `${value}%`}
                            parser={(value) => Number(value?.replace('%', '') || 10)}
                          />
                        </div>
                        <div className={`text-xs mt-1 ${calculateQuestions(ruleForm.percentage || 0) > availableCount ? 'text-red-500' : 'text-gray-500'}`}>
                          → {calculateQuestions(ruleForm.percentage || 0)} questions
                          {calculateQuestions(ruleForm.percentage || 0) > availableCount &&
                            ` (⚠️ exceeds ${availableCount} available)`
                          }
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Điểm mỗi câu</label>
                        <InputNumber
                          min={1}
                          value={ruleForm.points}
                          onChange={(value) => setRuleForm({ ...ruleForm, points: value || 1 })}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="primary"
                        onClick={handleSaveRule}
                        size="small"
                        disabled={!ruleForm.topicName || calculateQuestions(ruleForm.percentage || 0) > availableCount || calculateQuestions(ruleForm.percentage || 0) === 0}
                      >
                        {editingRule !== null ? 'Update Rule' : 'Add Rule'}
                      </Button>
                      <Button onClick={handleCancelRule} size="small">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <Table
                columns={ruleColumns}
                dataSource={currentTemplate.rules?.map((rule, index) => ({ ...rule, key: index })) || []}
                pagination={false}
                size="small"
                locale={{ emptyText: 'No rules defined' }}
              />
            </div>
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
              <div className="flex justify-between">
                <Text>Cost:</Text>
                <Text strong>{currentTemplate.tokenCost === 0 ? 'Free' : `${currentTemplate.tokenCost.toLocaleString('vi-VN')} VNĐ`}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Average Rating:</Text>
                <Text strong>⭐ {currentTemplate.averageRating?.toFixed(1) || 'N/A'}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Total Ratings:</Text>
                <Text strong>{currentTemplate.totalRatings || 0}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Total Takers:</Text>
                <Text strong>{currentTemplate.totalTakers || 0}</Text>
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
    </div>
  );
};

export default ExamDetailsPage;
