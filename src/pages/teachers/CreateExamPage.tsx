import React, { useState, useEffect, useMemo } from "react";
import { Button, Input, Card, Select, Switch, Table, Space, InputNumber, Tag, Tooltip, Slider, Progress, Alert, Modal, Spin } from "antd";
import { PlusOutlined, InfoCircleOutlined, RobotOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import { useParams, useNavigate } from "react-router-dom";
import type { CreateExamRulePayload, CreateExamTemplatePayload, ExamRule, ScoreMapping } from "~/types/test";
// import { useAuth } from "~/hooks/useAuth";
import { useExamTemplates } from "~/hooks/useExams";
import { useSubjects } from "~/hooks/useSubjects";
import { toast } from "~/components/common/Toast";
import useQuestionTopics from "~/hooks/useQuestionTopics";
import { useQuestionBank } from "~/hooks/useQuestionBank";
import type { QuestionBankItem } from "~/types/question";
import { useGlobalLoading } from "~/context/GlobalLoadingContext";

const CreateExamPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(examId);

  // const { user } = useAuth();
  const { createNewTemplate, updateTemplateDetails, fetchTemplateById, currentTemplate, loading: savingTemplate, analyzeTemplate } = useExamTemplates();
  const { subjects } = useSubjects();
  const { topics, fetchTopicsBySubject } = useQuestionTopics();

  // Use useQuestionBank to fetch questions for stats
  const {
    questions: subjectQuestions,
    fetchBySubjectId,
    loading: loadingQuestions
  } = useQuestionBank();
  const { showLoading, hideLoading } = useGlobalLoading();

  // Template form states
  const [templateTitle, setTemplateTitle] = useState<string>('');
  const [templateDescription, setTemplateDescription] = useState<string>('');
  const [templateDuration, setTemplateDuration] = useState<number>(60);
  const [passingScore, setPassingScore] = useState<number>(70);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [tokenCost, setTokenCost] = useState<number>(0);
  const [rules, setRules] = useState<CreateExamRulePayload[]>([]);
  const [totalQuestions, setTotalQuestions] = useState<number>(20); // Total desired questions

  // Score Mapping state - default AP Score 1-5
  const [scoreMapping, setScoreMapping] = useState<ScoreMapping>({
    '5': { min: 90, max: 100 },
    '4': { min: 75, max: 89 },
    '3': { min: 60, max: 74 },
    '2': { min: 45, max: 59 },
    '1': { min: 0, max: 44 },
  });

  // Rule form states
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [ruleForm, setRuleForm] = useState<CreateExamRulePayload>({
    topicName: '',
    difficultyName: 'Easy',
    questionType: 'mcq',
    numberOfQuestions: 0,
    points: 1,
    percentage: 10, // Default 10%
    numberOfContexts: 0, // 0 = no context grouping
  });

  // Error states
  const [titleError, setTitleError] = useState<string>('');
  const [durationError, setDurationError] = useState<string>('');
  const [passingScoreError, setPassingScoreError] = useState<string>('');
  const [rulesError, setRulesError] = useState<string>('');
  const [tokenCostError, setTokenCostError] = useState<string>('');
  const [totalQuestionsError, setTotalQuestionsError] = useState<string>('');

  // Analysis modal state
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

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
      setTokenCost(currentTemplate.tokenCost);
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

  // Fetch topics and questions when subject is selected
  useEffect(() => {
    if (selectedSubjectId) {
      fetchTopicsBySubject(selectedSubjectId);
      fetchBySubjectId(selectedSubjectId);
    }
  }, [selectedSubjectId, fetchTopicsBySubject, fetchBySubjectId]);

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

  // Get available count for current rule form selection
  const getAvailableCount = () => {
    if (!ruleForm.topicName) return 0;

    const topicStats = questionStats[ruleForm.topicName];
    if (!topicStats) return 0;

    // Filter by difficulty if selected (though we might want to just show total for topic)
    // But the rule is specific to difficulty and type

    // We need to filter the actual questions list to get the precise count
    // because stats above are aggregated separately
    const filteredQuestions = subjectQuestions.filter(q =>
      (q.topic === ruleForm.topicName) &&
      (q.difficulty?.toLowerCase() === ruleForm.difficultyName.toLowerCase()) &&
      (q.type?.toLowerCase() === ruleForm.questionType.toLowerCase())
    );

    return filteredQuestions.length;
  };

  const availableCount = useMemo(() => getAvailableCount(), [ruleForm, subjectQuestions]);

  // Helper: count questions by topic + difficulty + type
  const getTypeCountForDifficulty = (type: 'mcq' | 'frq') => {
    if (!ruleForm.topicName || !ruleForm.difficultyName) return 0;
    return subjectQuestions.filter(q =>
      q.topic === ruleForm.topicName &&
      q.difficulty?.toLowerCase() === ruleForm.difficultyName.toLowerCase() &&
      q.type?.toLowerCase() === type
    ).length;
  };

  // Calculate number of questions from percentage (rounded)
  const calculateQuestions = (percentage: number) => {
    return Math.round((percentage / 100) * totalQuestions);
  };

  // Total percentage of all rules
  const totalPercentage = useMemo(() => {
    return rules.reduce((sum, rule) => sum + (rule.percentage || 0), 0);
  }, [rules]);

  // Check if any rule exceeds available questions
  const rulesWithAvailability = useMemo(() => {
    return rules.map(rule => {
      const filteredQuestions = subjectQuestions.filter(q =>
        (q.topic === rule.topicName) &&
        (q.difficulty?.toLowerCase() === rule.difficultyName.toLowerCase()) &&
        (q.type?.toLowerCase() === rule.questionType.toLowerCase())
      );
      const available = filteredQuestions.length;
      const needed = calculateQuestions(rule.percentage || 0);
      return {
        ...rule,
        available,
        needed,
        isExceeded: needed > available
      };
    });
  }, [rules, subjectQuestions, totalQuestions]);

  // Check for any question availability errors
  const hasAvailabilityErrors = useMemo(() => {
    return rulesWithAvailability.some(r => r.isExceeded);
  }, [rulesWithAvailability]);

  // Calculate total points of all rules
  const totalPoints = useMemo(() => {
    return rules.reduce((sum, rule) => {
      const numQuestions = calculateQuestions(rule.percentage || 0);
      return sum + (numQuestions * (rule.points || 1));
    }, 0);
  }, [rules, totalQuestions]);

  // Check if passingScore is valid (not greater than total points)
  const hasPointsError = useMemo(() => {
    if (rules.length === 0) return false;
    // passingScore is %, totalPoints is absolute total points
    // Score needed = passingScore% * totalPoints / 100
    // Score needed must be <= totalPoints (always true)
    // But if passingScore > 100%, that's an error
    return passingScore > 100;
  }, [passingScore, rules.length]);

  const resetRuleForm = () => {
    setRuleForm({
      topicName: '',
      difficultyName: 'Easy',
      questionType: 'mcq',
      numberOfQuestions: 0,
      points: 1,
      percentage: 10,
      numberOfContexts: 0,
    });
    setEditingRuleIndex(null);
  };

  const handleAddRule = () => {
    if (!ruleForm.topicName.trim()) {
      toast.error('Topic name is required');
      return;
    }

    const percentage = ruleForm.percentage || 0;
    const calculatedQuestions = calculateQuestions(percentage);

    if (calculatedQuestions > availableCount) {
      toast.error(`Need ${calculatedQuestions} questions but only ${availableCount} available in bank`);
      return;
    }

    // Check total percentage does not exceed 100%
    const currentTotalPercentage = editingRuleIndex !== null
      ? totalPercentage - (rules[editingRuleIndex]?.percentage || 0)
      : totalPercentage;

    if (currentTotalPercentage + percentage > 100) {
      toast.error(`Total percentage cannot exceed 100% (current: ${currentTotalPercentage}%)`);
      return;
    }

    // Update numberOfQuestions from percentage
    const ruleToSave = {
      ...ruleForm,
      numberOfQuestions: calculatedQuestions,
      numberOfContexts: ruleForm.numberOfContexts || 0,
    };

    if (editingRuleIndex !== null) {
      const newRules = [...rules];
      newRules[editingRuleIndex] = ruleToSave;
      setRules(newRules);
    } else {
      setRules([...rules, ruleToSave]);
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
    if (tokenCost < 0) {
      setTokenCostError('Cost must be greater than 0');
      hasErrors = true;
    }
    // Validate total percentage must be 100%
    if (totalPercentage !== 100) {
      setRulesError(`Total percentage must equal 100% (current: ${totalPercentage}%)`);
      hasErrors = true;
    }
    // Validate no rule exceeds available questions
    if (hasAvailabilityErrors) {
      setRulesError('Some rules require more questions than available in the bank');
      hasErrors = true;
    }
    // Validate totalQuestions
    if (totalQuestions <= 0) {
      setTotalQuestionsError('Total questions must be greater than 0');
      hasErrors = true;
    }
    // Validate hasPointsError
    if (hasPointsError) {
      setPassingScoreError('Passing score cannot exceed 100%');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      showLoading(isEditMode ? "Updating exam template..." : "Creating exam template...");

      if (isEditMode && examId) {
        // Update existing template
        const updateData = {
          title: templateTitle.trim(),
          description: templateDescription.trim(),
          duration: templateDuration,
          passingScore: passingScore,
          isActive: isActive,
          subjectId: selectedSubjectId,
          tokenCost: tokenCost,
        };

        await updateTemplateDetails(examId, updateData);
        navigate('/teacher/templates');
      } else {
        // Recalculate numberOfQuestions from percentage before sending API
        const processedRules = rules.map(rule => ({
          ...rule,
          numberOfQuestions: calculateQuestions(rule.percentage || 0),
          numberOfContexts: rule.numberOfContexts || 0,
        }));

        // Create new template
        const templateData: CreateExamTemplatePayload = {
          title: templateTitle.trim(),
          description: templateDescription.trim(),
          duration: templateDuration,
          passingScore: passingScore,
          isActive: isActive,
          subjectId: selectedSubjectId,
          rules: processedRules,
          tokenCost: tokenCost,
          scoreMapping: scoreMapping, // Add score mapping
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
        setTokenCost(0);
        setTotalQuestions(20);
        setScoreMapping({
          '5': { min: 90, max: 100 },
          '4': { min: 75, max: 89 },
          '3': { min: 60, max: 74 },
          '2': { min: 45, max: 59 },
          '1': { min: 0, max: 44 },
        });

        // Clear errors
        setTitleError('');
        setDurationError('');
        setPassingScoreError('');
        setRulesError('');
        setTotalQuestionsError('');

        navigate('/teacher/templates');
      }
    } catch (error) {
      console.error('Save template error:', error);
    } finally {
      hideLoading();
    }
  };

  const handleAnalyze = async () => {
    // Validation for analyze - minimal requirements
    if (!templateTitle.trim()) {
      setTitleError('Template title is required for analysis');
      toast.error('Template title is required for analysis');
      return;
    }
    if (!selectedSubjectId) {
      toast.error('Subject must be selected for analysis');
      return;
    }

    setAnalyzing(true);
    try {
      // Recalculate numberOfQuestions from percentage
      const processedRules = rules.map(rule => ({
        ...rule,
        numberOfQuestions: calculateQuestions(rule.percentage || 0),
        numberOfContexts: rule.numberOfContexts || 0,
      }));

      const analysisPayload = {
        title: templateTitle.trim(),
        description: templateDescription.trim(),
        subjectId: selectedSubjectId,
        duration: templateDuration,
        passingScore: passingScore,
        isActive: isActive,
        tokenCost: tokenCost,
        rules: processedRules,
        scoreMapping: scoreMapping,
      };

      const result = await analyzeTemplate(analysisPayload);
      if (result) {
        setAnalysisResult(result);
        setAnalysisModalVisible(true);
      }
    } catch (error) {
      console.error('Analyze template error:', error);
    } finally {
      setAnalyzing(false);
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
      title: 'Ratio',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => (
        <Tag color="blue">{percentage}%</Tag>
      ),
    },
    {
      title: 'Questions',
      key: 'questions',
      render: (_: unknown, __: CreateExamRulePayload, index: number) => {
        const ruleInfo = rulesWithAvailability[index];
        if (!ruleInfo) return '-';
        return (
          <Tooltip title={`Available: ${ruleInfo.available} questions`}>
            <span className={ruleInfo.isExceeded ? 'text-red-500 font-medium' : 'text-green-600'}>
              {ruleInfo.needed} {ruleInfo.isExceeded && '⚠️'}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
    },
    {
      title: 'Contexts',
      dataIndex: 'numberOfContexts',
      key: 'numberOfContexts',
      render: (contexts: number) => (
        <Tag color={contexts > 0 ? 'cyan' : 'default'}>
          {contexts > 0 ? `${contexts} ctx` : 'None'}
        </Tag>
      ),
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
        <Space>
          <Button
            icon={<RobotOutlined />}
            loading={analyzing}
            onClick={handleAnalyze}
            style={{ backgroundColor: '#FFFFFF', color: '#722ed1', borderColor: '#722ed1' }}
            size="large"
          >
            AI Analyze
          </Button>
          <Button
            type="primary"
            size="large"
            loading={savingTemplate}
            onClick={handleSaveTemplate}
          >
            {isEditMode ? 'Update Template' : 'Save Template'}
          </Button>
        </Space>
      </div>

      <div className={`${!isEditMode ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'grid grid-cols-1 gap-6'}`}>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score *</label>
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
                disabled={isEditMode} // Prevent changing subject in edit mode to avoid rule conflicts
              >
                {subjects.map((subject) => (
                  <Select.Option key={subject.id} value={subject.id}>
                    {subject.name}
                  </Select.Option>
                ))}
              </Select>
              {/* {!selectedSubjectId && (
                <div className="text-red-500 text-sm mt-1">Subject must be selected</div>
              )} */}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost *</label>
              <Input
                type="number"
                placeholder="0"
                min={0}
                value={tokenCost}
                onChange={(e) => {
                  setTokenCost(Number(e.target.value));
                }}
                status={tokenCostError ? 'error' : ''}
              />
              {tokenCostError && <div className="text-red-500 text-sm mt-1">{tokenCostError}</div>}
            </div>

            {/* Score Mapping Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score Mapping (AP Score)
                <Tooltip title="Score mapping">
                  <InfoCircleOutlined className="ml-1 text-gray-400" />
                </Tooltip>
              </label>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                {Object.entries(scoreMapping)
                  .sort(([a], [b]) => Number(b) - Number(a)) // Sort from 5 to 1
                  .map(([grade, range]) => (
                    <div key={grade} className="flex items-center gap-3">
                      <Tag color="blue" className="w-8 text-center font-bold">{grade}</Tag>
                      <div className="flex items-center gap-2">
                        <InputNumber
                          min={0}
                          max={100}
                          value={range.min}
                          onChange={(value) => {
                            setScoreMapping(prev => ({
                              ...prev,
                              [grade]: { ...prev[grade], min: value || 0 }
                            }));
                          }}
                          style={{ width: 70 }}
                          size="small"
                        />
                        <span className="text-gray-500">-</span>
                        <InputNumber
                          min={0}
                          max={100}
                          value={range.max}
                          onChange={(value) => {
                            setScoreMapping(prev => ({
                              ...prev,
                              [grade]: { ...prev[grade], max: value || 100 }
                            }));
                          }}
                          style={{ width: 70 }}
                          size="small"
                        />
                        <span className="text-xs text-gray-500"></span>
                      </div>
                    </div>
                  ))}
              </div>
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
        {!isEditMode && (
          <Card title="Question Rules" className="shadow-sm">
            <div className="space-y-4">
              {/* Total Questions Input */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Questions *
                      <Tooltip title="Total number of questions will be divided by the ratio % of each rule">
                        <InfoCircleOutlined className="ml-1 text-gray-400" />
                      </Tooltip>
                    </label>
                    <InputNumber
                      min={1}
                      max={100}
                      value={totalQuestions}
                      onChange={(value) => {
                        setTotalQuestions(value || 20);
                        if (totalQuestionsError) setTotalQuestionsError('');
                      }}
                      style={{ width: 120 }}
                      status={totalQuestionsError ? 'error' : ''}
                    />
                    {totalQuestionsError && <div className="text-red-500 text-xs mt-1">{totalQuestionsError}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Allocated ratio</div>
                    <Progress
                      percent={totalPercentage}
                      status={totalPercentage === 100 ? 'success' : totalPercentage > 100 ? 'exception' : 'active'}
                      size="small"
                      style={{ width: 150 }}
                    />
                  </div>
                </div>
                {totalPercentage !== 100 && rules.length > 0 && (
                  <Alert
                    message={totalPercentage < 100
                      ? `Missing ${100 - totalPercentage}% allocation`
                      : `Exceeds ${totalPercentage - 100}%`
                    }
                    type={totalPercentage > 100 ? 'error' : 'warning'}
                    showIcon
                    className="mt-3"
                  />
                )}
                {rules.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      Total points: <strong>{totalPoints}</strong> points
                      | Passing score ({passingScore}): <strong>{Math.ceil(totalPoints * passingScore / 100)}</strong> points
                    </span>
                  </div>
                )}
              </div>

              {!showRuleForm ? (
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => setShowRuleForm(true)}
                  block
                  disabled={!selectedSubjectId}
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
                        {topics.map((topic) => {
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Points per question</label>
                        <InputNumber
                          min={1}
                          value={ruleForm.points}
                          onChange={(value) => setRuleForm({ ...ruleForm, points: value || 1 })}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Contexts
                          <Tooltip title="E.g. 2 contexts × 1 question/context = 2 questions from reading passages. Set to 0 for no context grouping.">
                            <InfoCircleOutlined className="ml-1 text-gray-400" />
                          </Tooltip>
                        </label>
                        <InputNumber
                          min={0}
                          value={ruleForm.numberOfContexts || 0}
                          onChange={(value) => setRuleForm({ ...ruleForm, numberOfContexts: value || 0 })}
                          style={{ width: '100%' }}
                        />
                        {(ruleForm.numberOfContexts || 0) > 0 && (
                          <div className="text-xs text-cyan-600 mt-1">
                            {ruleForm.numberOfContexts} contexts × {calculateQuestions(ruleForm.percentage || 0)} = {(ruleForm.numberOfContexts || 0) * calculateQuestions(ruleForm.percentage || 0)} questions
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="primary"
                        onClick={handleAddRule}
                        size="small"
                        disabled={calculateQuestions(ruleForm.percentage || 0) > availableCount || calculateQuestions(ruleForm.percentage || 0) === 0}
                      >
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
                  scroll={{ x: 'max-content' }}
                />
              )}

              {rulesError && <div className="text-red-500 text-sm mt-2">{rulesError}</div>}
            </div>
          </Card>
        )
        }
      </div>

      {/* Analysis Result Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <RobotOutlined style={{ color: '#722ed1' }} />
            <span>AI Analysis Result</span>
          </div>
        }
        open={analysisModalVisible}
        onCancel={() => setAnalysisModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setAnalysisModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        <div className="max-h-96 overflow-y-auto">
          {analysisResult ? (
            <div className="prose prose-sm max-w-none bg-gradient-to-br from-purple-50 to-white p-5 rounded-lg border border-purple-100">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-xl font-bold text-purple-800 mb-3 pb-2 border-b border-purple-200">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-semibold text-purple-700 mt-4 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-medium text-gray-800 mt-3 mb-1">{children}</h3>,
                  p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-2">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-purple-700">{children}</strong>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 pl-2">{children}</ul>,
                  li: ({ children }) => <li className="text-gray-700">{children}</li>,
                }}
              >
                {analysisResult}
              </ReactMarkdown>
            </div>
          ) : (
            <Spin />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CreateExamPage;
