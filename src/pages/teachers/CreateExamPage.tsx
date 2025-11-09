import React, { useState, useEffect } from "react";
import { Button, Input, Card, Select, Switch, Table, Space, InputNumber } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import type { CreateExamRulePayload, CreateExamTemplatePayload, ExamRule } from "~/types/test";
// import { useAuth } from "~/hooks/useAuth";
import { useExamTemplates } from "~/hooks/useExams";
import { useSubjects } from "~/hooks/useSubjects";
import { toast } from "~/components/common/Toast";
import useQuestionTopics from "~/hooks/useQuestionTopics";

const CreateExamPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(examId);

  // const { user } = useAuth();
  const { createNewTemplate, updateTemplateDetails, fetchTemplateById, currentTemplate, loading: savingTemplate } = useExamTemplates();
  const { subjects } = useSubjects();
  const { topics } = useQuestionTopics();
  // Template form states
  const [templateTitle, setTemplateTitle] = useState<string>('');
  const [templateDescription, setTemplateDescription] = useState<string>('');
  const [templateDuration, setTemplateDuration] = useState<number>(60);
  const [passingScore, setPassingScore] = useState<number>(70);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [rules, setRules] = useState<CreateExamRulePayload[]>([]);

  // Rule form states
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [ruleForm, setRuleForm] = useState<CreateExamRulePayload>({
    topicName: '',
    difficultyName: 'Easy',
    questionType: 'mcq',
    numberOfQuestions: 1,
    points: 1,
  });

  // Error states
  const [titleError, setTitleError] = useState<string>('');
  const [durationError, setDurationError] = useState<string>('');
  const [passingScoreError, setPassingScoreError] = useState<string>('');
  const [rulesError, setRulesError] = useState<string>('');

  // Load template data when in edit mode
  useEffect(() => {
    if (isEditMode && examId) {
      fetchTemplateById(examId);
    }
  }, [isEditMode, examId, fetchTemplateById]);

  // Update form when currentTemplate changes
  useEffect(() => {
    if (isEditMode && currentTemplate) {
      setTemplateTitle(currentTemplate.title);
      setTemplateDescription(currentTemplate.description || '');
      setTemplateDuration(currentTemplate.duration);
      setPassingScore(currentTemplate.passingScore);
      setIsActive(currentTemplate.isActive);
      setSelectedSubjectId(currentTemplate.subject.id);
      // Convert ExamRule[] to CreateExamRulePayload[]
      // API returns ExamRule with topicName/difficultyName for the form
      const convertedRules: CreateExamRulePayload[] = currentTemplate.rules.map((rule: ExamRule) => ({
        topicName: rule.topicName,
        difficultyName: rule.difficultyName,
        questionType: rule.questionType,
        numberOfQuestions: rule.numberOfQuestions,
        points: rule.points,
      }));
      setRules(convertedRules);
    }
  }, [isEditMode, currentTemplate]);

  const resetRuleForm = () => {
    setRuleForm({
      topicName: '',
      difficultyName: 'Easy',
      questionType: 'mcq',
      numberOfQuestions: 1,
      points: 1,
    });
    setEditingRuleIndex(null);
  };

  const handleAddRule = () => {
    if (!ruleForm.topicName.trim()) {
      toast.error('Topic name is required');
      return;
    }

    if (editingRuleIndex !== null) {
      // Edit existing rule
      const newRules = [...rules];
      newRules[editingRuleIndex] = { ...ruleForm };
      setRules(newRules);
      toast.success('Rule updated successfully');
    } else {
      // Add new rule
      setRules([...rules, { ...ruleForm }]);
      toast.success('Rule added successfully');
    }

    resetRuleForm();
    setShowRuleForm(false);
  };

  const handleEditRule = (index: number) => {
    setRuleForm({ ...rules[index] });
    setEditingRuleIndex(index);
    setShowRuleForm(true);
  };

  const handleDeleteRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
    toast.success('Rule deleted successfully');
  };

  const handleSaveTemplate = async () => {
    // Clear previous errors
    setTitleError('');
    setDurationError('');
    setPassingScoreError('');
    setRulesError('');

    // Validation
    let hasErrors = false;

    if (!templateTitle.trim()) {
      setTitleError('Template title is required');
      hasErrors = true;
    }
    if (templateDuration <= 0) {
      setDurationError('Duration must be greater than 0');
      hasErrors = true;
    }
    if (passingScore < 0 || passingScore > 100) {
      setPassingScoreError('Passing score must be between 0 and 100');
      hasErrors = true;
    }
    if (!selectedSubjectId) {
      toast.error('Subject must be selected');
      hasErrors = true;
    }
    if (rules.length === 0) {
      setRulesError('At least one rule must be added');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      if (isEditMode && examId) {
        // Update existing template
        const updateData = {
          title: templateTitle.trim(),
          description: templateDescription.trim(),
          duration: templateDuration,
          passingScore: passingScore,
          isActive: isActive,
          subjectId: selectedSubjectId,
        };

        await updateTemplateDetails(examId, updateData);
        toast.success('Template updated successfully!');
        navigate('/teacher/templates');
      } else {
        // Create new template
        const templateData: CreateExamTemplatePayload = {
          title: templateTitle.trim(),
          description: templateDescription.trim(),
          duration: templateDuration,
          passingScore: passingScore,
          isActive: isActive,
          subjectId: selectedSubjectId,
          rules: rules,
        };

        await createNewTemplate(templateData);

        // Reset form on success
        setTemplateTitle('');
        setTemplateDescription('');
        setTemplateDuration(60);
        setPassingScore(70);
        setIsActive(true);
        setSelectedSubjectId('');
        setRules([]);

        // Clear errors
        setTitleError('');
        setDurationError('');
        setPassingScoreError('');
        setRulesError('');

        toast.success('Template created successfully!');
      }
    } catch (error) {
      console.error('Save template error:', error);
    }
  };




  const ruleColumns = [
    {
      title: 'Topic',
      dataIndex: 'topicName',
      key: 'topicName',
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficultyName',
      key: 'difficultyName',
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
      render: (_: CreateExamRulePayload, __: CreateExamRulePayload, index: number) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleEditRule(index)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            size="small"
            onClick={() => handleDeleteRule(index)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isEditMode ? 'Edit Exam Template' : 'Create Exam Template'}
        </h1>
        <Button
          type="primary"
          size="large"
          loading={savingTemplate}
          onClick={handleSaveTemplate}
        >
          {isEditMode ? 'Update Template' : 'Save Template'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Form */}
        <Card title="Template Information" className="shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Title *</label>
              <Input
                placeholder="Enter template title"
                value={templateTitle}
                onChange={(e) => {
                  setTemplateTitle(e.target.value);
                  if (titleError) setTitleError('');
                }}
                status={titleError ? 'error' : ''}
              />
              {titleError && <div className="text-red-500 text-sm mt-1">{titleError}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Input.TextArea
                placeholder="Enter template description"
                rows={3}
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                <Input
                  type="number"
                  placeholder="60"
                  min={1}
                  value={templateDuration}
                  onChange={(e) => {
                    setTemplateDuration(Number(e.target.value));
                    if (durationError) setDurationError('');
                  }}
                  status={durationError ? 'error' : ''}
                />
                {durationError && <div className="text-red-500 text-sm mt-1">{durationError}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%) *</label>
                <Input
                  type="number"
                  placeholder="70"
                  min={0}
                  max={100}
                  value={passingScore}
                  onChange={(e) => {
                    setPassingScore(Number(e.target.value));
                    if (passingScoreError) setPassingScoreError('');
                  }}
                  status={passingScoreError ? 'error' : ''}
                />
                {passingScoreError && <div className="text-red-500 text-sm mt-1">{passingScoreError}</div>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subjects *</label>
              <Select
                placeholder="Select a subject for this template"
                value={selectedSubjectId}
                onChange={setSelectedSubjectId}
                style={{ width: '100%' }}
                optionFilterProp="children"
              >
                {subjects.map((subject) => (
                  <Select.Option key={subject.id} value={subject.id}>
                    {subject.name}
                  </Select.Option>
                ))}
              </Select>
              {!selectedSubjectId && (
                <div className="text-red-500 text-sm mt-1">Subject must be selected</div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={isActive}
                onChange={setIsActive}
              />
              <label className="text-sm font-medium text-gray-700">Active</label>
            </div>
          </div>
        </Card>

        {/* Rules Management */}
        <Card title="Question Rules" className="shadow-sm">
          <div className="space-y-4">
            {!showRuleForm ? (
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setShowRuleForm(true)}
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
                    >
                      {topics.map((topic) => (
                        <Select.Option key={topic.id} value={topic.name}>
                          {topic.name}
                        </Select.Option>
                      ))}
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
                        <Select.Option value="Easy">Easy</Select.Option>
                        <Select.Option value="Medium">Medium</Select.Option>
                        <Select.Option value="Hard">Hard</Select.Option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                      <Select
                        value={ruleForm.questionType}
                        onChange={(value) => setRuleForm({ ...ruleForm, questionType: value })}
                        style={{ width: '100%' }}
                      >
                        <Select.Option value="mcq">Multiple Choice Questions</Select.Option>
                        <Select.Option value="frq">Free-Response Questions</Select.Option>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                      <InputNumber
                        min={1}
                        value={ruleForm.numberOfQuestions}
                        onChange={(value) => setRuleForm({ ...ruleForm, numberOfQuestions: value || 1 })}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Points per Question</label>
                      <InputNumber
                        min={1}
                        value={ruleForm.points}
                        onChange={(value) => setRuleForm({ ...ruleForm, points: value || 1 })}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="primary" onClick={handleAddRule} size="small">
                      {editingRuleIndex !== null ? 'Update Rule' : 'Add Rule'}
                    </Button>
                    <Button onClick={() => { setShowRuleForm(false); resetRuleForm(); }} size="small">
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {rules && (
              <Table
                columns={ruleColumns}
                dataSource={rules?.map((rule, index) => ({ ...rule, key: index }))}
                pagination={false}
                size="small"
              />
            )}

            {rulesError && <div className="text-red-500 text-sm mt-2">{rulesError}</div>}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreateExamPage;
