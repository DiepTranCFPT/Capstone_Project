import React, { useState, useEffect, useMemo } from "react";
import { Button, Input, Card, Select, Switch, Table, Space, InputNumber, Tag, Tooltip, Modal, Spin } from "antd";
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
    numberOfQuestions: 1, // Direct input - số câu hỏi
    points: 1,
    percentage: 0, // Will be calculated from numberOfQuestions
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
      fetchBySubjectId(selectedSubjectId, { pageNo: 0, pageSize: 1000 });
    }
  }, [selectedSubjectId, fetchTopicsBySubject, fetchBySubjectId]);

  // Calculate question stats
  const questionStats = useMemo(() => {
    const stats: Record<string, { total: number; easy: number; medium: number; hard: number; mcq: number; frq: number }> = {};

    subjectQuestions.forEach((q: QuestionBankItem) => {
      let topicName = q.topic || 'Uncategorized';

      // Resolve topic name if q.topic is an ID
      const matchingTopic = topics.find(t => t.id === topicName || t.name === topicName);
      if (matchingTopic) {
        topicName = matchingTopic.name;
      }

      if (!stats[topicName]) {
        stats[topicName] = { total: 0, easy: 0, medium: 0, hard: 0, mcq: 0, frq: 0 };
      }

      stats[topicName].total++;

      const difficulty = q.difficulty?.toLowerCase();
      if (difficulty === 'easy') stats[topicName].easy++;
      else if (difficulty === 'medium') stats[topicName].medium++;
      else if (difficulty === 'hard') stats[topicName].hard++;

      const type = q.type?.toLowerCase();
      if (type === 'mcq') stats[topicName].mcq++;
      else if (type === 'frq') stats[topicName].frq++;
    });

    return stats;
  }, [subjectQuestions, topics]);

  // Get available count for current rule form selection
  const getAvailableCount = () => {
    if (!ruleForm.topicName) return 0;

    const topicStats = questionStats[ruleForm.topicName];
    if (!topicStats) return 0;

    // Filter by difficulty if selected (though we might want to just show total for topic)
    // But the rule is specific to difficulty and type

    // We need to filter the actual questions list to get the precise count
    // because stats above are aggregated separately
    const selectedTopic = topics.find(t => t.name === ruleForm.topicName);
    const selectedTopicId = selectedTopic?.id;

    const filteredQuestions = subjectQuestions.filter(q =>
      (q.topic === ruleForm.topicName || (selectedTopicId && q.topic === selectedTopicId)) &&
      (q.difficulty?.toLowerCase() === ruleForm.difficultyName.toLowerCase()) &&
      (q.type?.toLowerCase() === ruleForm.questionType.toLowerCase())
    );

    return filteredQuestions.length;
  };

  const availableCount = useMemo(() => getAvailableCount(), [ruleForm, subjectQuestions]);

  // Helper: count questions by topic + difficulty + type
  const getTypeCountForDifficulty = (type: 'mcq' | 'frq') => {
    if (!ruleForm.topicName || !ruleForm.difficultyName) return 0;

    const selectedTopic = topics.find(t => t.name === ruleForm.topicName);
    const selectedTopicId = selectedTopic?.id;

    return subjectQuestions.filter(q =>
      (q.topic === ruleForm.topicName || (selectedTopicId && q.topic === selectedTopicId)) &&
      q.difficulty?.toLowerCase() === ruleForm.difficultyName.toLowerCase() &&
      q.type?.toLowerCase() === type
    ).length;
  };

  // Calculate percentage from number of questions
  const calculatePercentage = (numQuestions: number) => {
    if (totalQuestions <= 0) return 0;
    return Math.round((numQuestions / totalQuestions) * 100);
  };


  // Distribution summary by difficulty
  const distributionSummary = useMemo(() => {
    const summary = { Easy: 0, Medium: 0, Hard: 0, MCQ: 0, FRQ: 0 };
    rules.forEach(rule => {
      // Use logical OR with 0 to ensure we don't count undefined
      // Removed fallback to calculateQuestions(percentage) because numberOfQuestions is the source of truth
      const numQ = rule.numberOfQuestions || 0;
      summary[rule.difficultyName as keyof typeof summary] = (summary[rule.difficultyName as keyof typeof summary] || 0) + numQ;
      if (rule.questionType === 'mcq') summary.MCQ += numQ;
      else summary.FRQ += numQ;
    });
    return summary;
  }, [rules]); // Removed totalQuestions dependency as we don't recalculate based on it anymore


  // Check if any rule exceeds available questions
  const rulesWithAvailability = useMemo(() => {
    return rules.map(rule => {
      const topicObj = topics.find(t => t.name === rule.topicName);
      const topicId = topicObj?.id;

      const filteredQuestions = subjectQuestions.filter(q =>
        (q.topic === rule.topicName || (topicId && q.topic === topicId)) &&
        (q.difficulty?.toLowerCase() === rule.difficultyName.toLowerCase()) &&
        (q.type?.toLowerCase() === rule.questionType.toLowerCase())
      );
      const available = filteredQuestions.length;
      const needed = rule.numberOfQuestions || 0;
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
      numberOfQuestions: 1,
      points: 1,
      percentage: 0,
      numberOfContexts: 0,
    });
    setEditingRuleIndex(null);
  };

  const handleAddRule = () => {
    if (!ruleForm.topicName.trim()) {
      toast.error('Please select a topic');
      return;
    }

    const numQuestions = ruleForm.numberOfQuestions || 0;
    const percentage = calculatePercentage(numQuestions);

    if (numQuestions > availableCount) {
      toast.error(`Need ${numQuestions} questions but only ${availableCount} available in bank`);
      return;
    }

    if (numQuestions <= 0) {
      toast.error('Number of questions must be greater than 0');
      return;
    }

    // Check total questions does not exceed totalQuestions
    const currentTotalQuestions = editingRuleIndex !== null
      ? rules.reduce((sum, r, i) => sum + (i === editingRuleIndex ? 0 : (r.numberOfQuestions || 0)), 0)
      : rules.reduce((sum, r) => sum + (r.numberOfQuestions || 0), 0);

    if (currentTotalQuestions + numQuestions > totalQuestions) {
      toast.error(`Total questions cannot exceed ${totalQuestions} (current: ${currentTotalQuestions})`);
      return;
    }

    // Save rule with calculated percentage
    const ruleToSave = {
      ...ruleForm,
      numberOfQuestions: numQuestions,
      percentage: percentage,
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
    // Validate total allocated questions must equal totalQuestions
    const currentTotalAllocated = rules.reduce((sum, r) => sum + (r.numberOfQuestions || 0), 0);
    if (currentTotalAllocated !== totalQuestions) {
      setRulesError(`Total allocated questions (${currentTotalAllocated}) must equal Total Questions (${totalQuestions})`);
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
        // Use numberOfQuestions directly and remove percentage from payload
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const processedRules = rules.map(({ percentage, ...rule }) => ({
          ...rule,
          numberOfQuestions: rule.numberOfQuestions,
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
      // Use numberOfQuestions directly and remove percentage from payload
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const processedRules = rules.map(({ percentage, ...rule }) => ({
        ...rule,
        numberOfQuestions: rule.numberOfQuestions,
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
          <div title="Question Rules" className="shadow-sm">
            <div className="space-y-4">
              {/* Total Questions + Preset Buttons */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Questions *
                      <Tooltip title="Total number of questions in the exam. Add rules to allocate questions.">
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

                  {/* Allocated Questions Count */}
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Allocated</div>
                    <div className={`text-2xl font-bold ${rules.reduce((sum, r) => sum + (r.numberOfQuestions || 0), 0) === totalQuestions ? 'text-green-600' : 'text-orange-500'}`}>
                      {rules.reduce((sum, r) => sum + (r.numberOfQuestions || 0), 0)} / {totalQuestions}
                    </div>
                  </div>
                </div>



                {/* Distribution Summary Bar */}
                {rules.length > 0 && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">Current Distribution:</div>
                    <div className="flex gap-4 flex-wrap justify-center">
                      <Tag color="green" className="px-3 py-1">
                        Easy: <strong>{distributionSummary.Easy}</strong>
                      </Tag>
                      <Tag color="orange" className="px-3 py-1">
                        Medium: <strong>{distributionSummary.Medium}</strong>
                      </Tag>
                      <Tag color="red" className="px-3 py-1">
                        Hard: <strong>{distributionSummary.Hard}</strong>
                      </Tag>
                      <Tag color="blue" className="px-3 py-1">
                        MCQ: <strong>{distributionSummary.MCQ}</strong>
                      </Tag>
                      <Tag color="purple" className="px-3 py-1">
                        FRQ: <strong>{distributionSummary.FRQ}</strong>
                      </Tag>
                    </div>
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
                  + Add Rule
                </Button>
              ) : (
                <Card size="small" className="border-dashed">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
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
                          {[
                            { value: 'Easy', label: 'Easy' },
                            { value: 'Medium', label: 'Medium' },
                            { value: 'Hard', label: 'Hard' }
                          ].map(item => {
                            const topicStats = questionStats[ruleForm.topicName];
                            const count = topicStats ? topicStats[item.value.toLowerCase() as 'easy' | 'medium' | 'hard'] : 0;
                            return (
                              <Select.Option key={item.value} value={item.value}>
                                <div className="flex justify-between items-center">
                                  <span>{item.label}</span>
                                  {ruleForm.topicName && (
                                    <span className="text-xs text-gray-500">({count} Qs)</span>
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
                              <span>Multiple Choice (MCQ)</span>
                              {ruleForm.topicName && ruleForm.difficultyName && (
                                <span className="text-xs text-gray-500">
                                  ({getTypeCountForDifficulty('mcq')})
                                </span>
                              )}
                            </div>
                          </Select.Option>
                          <Select.Option value="frq">
                            <div className="flex justify-between items-center">
                              <span>Free Response (FRQ)</span>
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
                          Number of Questions *
                          <Tooltip title={`${availableCount} matching questions available in bank`}>
                            <InfoCircleOutlined className="ml-1 text-gray-400" />
                          </Tooltip>
                        </label>
                        <InputNumber
                          min={1}
                          max={Math.min(availableCount, totalQuestions)}
                          value={ruleForm.numberOfQuestions || 1}
                          onChange={(value) => setRuleForm({ ...ruleForm, numberOfQuestions: value || 1 })}
                          style={{ width: '100%' }}
                        />
                        <div className={`text-xs mt-1 ${(ruleForm.numberOfQuestions || 0) > availableCount ? 'text-red-500' : 'text-gray-500'}`}>
                          {availableCount > 0 ? (
                            <>
                              Available: <strong>{availableCount}</strong> |
                              Equiv: <strong>{calculatePercentage(ruleForm.numberOfQuestions || 0)}%</strong>
                            </>
                          ) : (
                            <span className="text-red-500">No matching questions</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Points/Question</label>
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
                          <Tooltip title="E.g., 2 contexts x 1 question/context = 2 questions from passage. 0 if not needed.">
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
                            {ruleForm.numberOfContexts} contexts × {ruleForm.numberOfQuestions || 0} = {(ruleForm.numberOfContexts || 0) * (ruleForm.numberOfQuestions || 0)} questions
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="primary"
                        onClick={handleAddRule}
                        size="small"
                        disabled={(ruleForm.numberOfQuestions || 0) > availableCount || (ruleForm.numberOfQuestions || 0) <= 0 || availableCount === 0}
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
          </div>
        )}
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
