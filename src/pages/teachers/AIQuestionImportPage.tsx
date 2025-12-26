import React, { useState, useCallback, useEffect } from "react";
import {
    Card,
    Select,
    Input,
    Button,
    Steps,
    Result,
    Spin,
    Tag,
    Collapse,
    Empty,
    Tooltip,
    Badge,
    Alert,
    Space,
    Divider,
    Checkbox,
} from "antd";
import {
    RobotOutlined,
    SendOutlined,
    CheckCircleOutlined,
    EditOutlined,
    FileTextOutlined,
    BulbOutlined,
    ThunderboltOutlined,
    CopyOutlined,
    ReloadOutlined,
    InfoCircleOutlined,
    DeleteOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { useSubjects } from "~/hooks/useSubjects";
import { useQuestionTopics } from "~/hooks/useQuestionTopics";
import { useAIQuestionImport } from "~/hooks/useAIQuestionImport";
import type { AIGeneratedQuestion } from "~/types/aiQuestionImport";
import { toast } from "~/components/common/Toast";

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

// Step configuration
const steps = [
    {
        title: "Input",
        icon: <EditOutlined />,
        description: "Enter questions",
    },
    {
        title: "Generate",
        icon: <RobotOutlined />,
        description: "AI processing",
    },
    {
        title: "Review",
        icon: <FileTextOutlined />,
        description: "Preview & confirm",
    },
    {
        title: "Complete",
        icon: <CheckCircleOutlined />,
        description: "Questions created",
    },
];

const AIQuestionImportPage: React.FC = () => {
    // States
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
    const [selectedTopicName, setSelectedTopicName] = useState<string | undefined>(undefined);
    const [inputText, setInputText] = useState<string>("");

    // Hooks
    const { subjects, loading: loadingSubjects } = useSubjects();
    const { topics, fetchTopicsBySubject, loading: loadingTopics } = useQuestionTopics();
    const {
        isGenerating,
        isCreating,
        generatedQuestions,
        createdCount,
        generateQuestions,
        createQuestions,
        updateQuestion,
        reset: resetAI,
    } = useAIQuestionImport();

    // Fetch topics when subject is selected
    useEffect(() => {
        if (selectedSubjectId) {
            fetchTopicsBySubject(selectedSubjectId);
            setSelectedTopicName(undefined); // Reset topic when subject changes
        }
    }, [selectedSubjectId, fetchTopicsBySubject]);

    // Handle generate questions
    const handleGenerate = useCallback(async () => {
        setCurrentStep(1);

        const success = await generateQuestions(selectedSubjectId, inputText, selectedTopicName);

        if (success) {
            setCurrentStep(2);
        } else {
            setCurrentStep(0);
        }
    }, [selectedSubjectId, inputText, selectedTopicName, generateQuestions]);

    // Handle create questions
    const handleCreateQuestions = useCallback(async () => {
        // Validate all questions have topic selected
        const questionsWithoutTopic = generatedQuestions.filter(q => !q.topicName);
        if (questionsWithoutTopic.length > 0) {
            toast.error(`Please select topic for all questions. ${questionsWithoutTopic.length} question(s) missing topic.`);
            return;
        }

        const success = await createQuestions(generatedQuestions);

        if (success) {
            setCurrentStep(3);
        }
    }, [generatedQuestions, createQuestions]);

    // Reset to start
    const handleReset = useCallback(() => {
        setCurrentStep(0);
        setInputText("");
        resetAI();
    }, [resetAI]);

    // Copy sample text
    const handleCopySample = useCallback(() => {
        const sampleText = `
Context:
Read the following questions carefully. The questions below assess general knowledge across geography, mathematics, and literature. Choose the best answer for each question based on your understanding.

Question:

1. Which of the following is the capital of France?
A. London
B. Berlin
C. Paris*
D. Madrid

2. What is 2 + 2?
A. 3
B. 4*
C. 5
D. 6

3. Who wrote “Romeo and Juliet”?
A. Charles Dickens
B. William Shakespeare*
C. Jane Austen
D. Mark Twain`;

        navigator.clipboard.writeText(sampleText);
        toast.success("Copied sample text to clipboard!");
    }, []);

    // Render editable question form
    const renderQuestionPreview = (question: AIGeneratedQuestion, index: number) => {
        const correctAnswers = question.answers.filter((a) => a.isCorrect);
        const hasContext = question.context && question.context.content;

        // Update answer at specific index
        const updateAnswer = (answerIndex: number, updates: Partial<typeof question.answers[0]>) => {
            const newAnswers = [...question.answers];
            newAnswers[answerIndex] = { ...newAnswers[answerIndex], ...updates };
            updateQuestion(index, { answers: newAnswers });
        };

        // Add new answer
        const addAnswer = () => {
            const newAnswers = [...question.answers, { content: "", isCorrect: false, explanation: "" }];
            updateQuestion(index, { answers: newAnswers });
        };

        // Delete answer
        const deleteAnswer = (answerIndex: number) => {
            if (question.answers.length <= 2) {
                toast.error("Question must have at least 2 answers");
                return;
            }
            const newAnswers = question.answers.filter((_, i) => i !== answerIndex);
            updateQuestion(index, { answers: newAnswers });
        };

        // Update context
        const updateContext = (updates: Partial<NonNullable<typeof question.context>>) => {
            updateQuestion(index, {
                context: question.context ? { ...question.context, ...updates } : undefined
            });
        };

        return (
            <Panel
                key={index}
                header={
                    <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                            <Badge
                                count={index + 1}
                                style={{
                                    backgroundColor: "#3CBCB2",
                                    fontWeight: "bold",
                                }}
                            />
                            <span className="font-medium text-gray-700 line-clamp-1 max-w-[500px]">
                                {question.content || "New question..."}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tag color={question.type === "MCQ" ? "blue" : "green"}>
                                {question.type}
                            </Tag>
                            <Tag color="purple">{question.difficultyName}</Tag>
                            {hasContext && (
                                <Tooltip title="Has context">
                                    <Tag color="orange" icon={<FileTextOutlined />}>
                                        Context
                                    </Tag>
                                </Tooltip>
                            )}
                            <Tag color={correctAnswers.length > 0 ? "green" : "red"}>
                                {correctAnswers.length} correct
                            </Tag>
                        </div>
                    </div>
                }
                className="mb-3 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
                <div className="space-y-4">
                    {/* Context - Editable */}
                    {hasContext && (
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <div className="flex items-center gap-2 mb-3 text-amber-700 font-medium">
                                <FileTextOutlined />
                                <span>Context</span>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <Input
                                        value={question.context?.title || ""}
                                        onChange={(e) => updateContext({ title: e.target.value })}
                                        placeholder="Context title..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <TextArea
                                        value={question.context?.content || ""}
                                        onChange={(e) => updateContext({ content: e.target.value })}
                                        placeholder="Context content..."
                                        rows={4}
                                    />
                                </div>
                                {question.context?.imageUrl && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                        <Input
                                            value={question.context?.imageUrl || ""}
                                            onChange={(e) => updateContext({ imageUrl: e.target.value })}
                                            placeholder="Image URL..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Question Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <Select
                                value={question.type}
                                onChange={(value) => updateQuestion(index, { type: value })}
                                className="w-full"
                            >
                                <Option value="MCQ">MCQ (Multiple Choice)</Option>
                                <Option value="FRQ">FRQ (Free Response)</Option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                            <Select
                                value={question.difficultyName}
                                onChange={(value) => updateQuestion(index, { difficultyName: value })}
                                className="w-full"
                            >
                                <Option value="EASY">Easy</Option>
                                <Option value="MEDIUM">Medium</Option>
                                <Option value="HARD">Hard</Option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Topic <span className="text-red-500">*</span>
                            </label>
                            <Select
                                placeholder="Select topic..."
                                value={question.topicName || undefined}
                                onChange={(value) => updateQuestion(index, { topicName: value })}
                                className="w-full"
                                loading={loadingTopics}
                                allowClear
                                showSearch
                                optionFilterProp="children"
                            >
                                {topics.map((topic) => (
                                    <Option key={topic.id} value={topic.name}>
                                        {topic.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    {/* Question content - Editable */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Content <span className="text-red-500">*</span>
                        </label>
                        <TextArea
                            value={question.content}
                            onChange={(e) => updateQuestion(index, { content: e.target.value })}
                            placeholder="Enter question content..."
                            rows={3}
                            className="text-base"
                        />
                    </div>

                    {/* Answers - Editable */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">
                                Answers <span className="text-red-500">*</span>
                            </label>
                            <Button
                                type="dashed"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={addAnswer}
                            >
                                Add Answer
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {question.answers.map((answer, aIndex) => (
                                <div
                                    key={aIndex}
                                    className={`p-3 rounded-lg transition-all ${answer.isCorrect
                                        ? "bg-green-50 border-2 border-green-300"
                                        : "bg-gray-50 border border-gray-200"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex flex-col items-center gap-2">
                                            <span
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${answer.isCorrect
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-300 text-gray-600"
                                                    }`}
                                            >
                                                {String.fromCharCode(65 + aIndex)}
                                            </span>
                                            <Checkbox
                                                checked={answer.isCorrect}
                                                onChange={(e) => updateAnswer(aIndex, { isCorrect: e.target.checked })}
                                            >
                                                <span className="text-xs">Correct</span>
                                            </Checkbox>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                value={answer.content}
                                                onChange={(e) => updateAnswer(aIndex, { content: e.target.value })}
                                                placeholder="Answer content..."
                                                className={answer.isCorrect ? "border-green-300" : ""}
                                            />
                                            <Input
                                                value={answer.explanation || ""}
                                                onChange={(e) => updateAnswer(aIndex, { explanation: e.target.value })}
                                                placeholder="Explanation (optional)..."
                                                prefix={<span className="text-gray-400">💡</span>}
                                                className="text-sm mt-2"
                                            />
                                        </div>
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => deleteAnswer(aIndex)}
                                            disabled={question.answers.length <= 2}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t">
                        <span>
                            Correct answers: <strong className={correctAnswers.length > 0 ? "text-green-600" : "text-red-600"}>
                                {correctAnswers.length}/{question.answers.length}
                            </strong>
                        </span>
                        {!question.topicName && (
                            <Tag color="warning">Topic required</Tag>
                        )}
                        {correctAnswers.length === 0 && (
                            <Tag color="error">No correct answer</Tag>
                        )}
                    </div>
                </div>
            </Panel>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-backgroundColor flex items-center justify-center shadow-lg">
                        <RobotOutlined style={{ color: "white" }} className="text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-backgroundColor bg-clip-text text-transparent">
                            AI Question Import
                        </h1>
                        <p className="text-gray-500">
                            Enter text question → AI automatically format → Create question
                        </p>
                    </div>
                </div>
            </div>

            {/* Steps */}
            <div className="max-w-6xl mx-auto mb-8">
                <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl rounded-2xl">
                    <Steps
                        current={currentStep}
                        items={steps.map((step, index) => ({
                            title: step.title,
                            description: step.description,
                            icon:
                                currentStep === index && (isGenerating || isCreating) ? (
                                    <Spin size="small" />
                                ) : (
                                    step.icon
                                ),
                        }))}
                    />
                </Card>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto">
                {/* Step 0: Input */}
                {currentStep === 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Input Panel */}
                        <div className="lg:col-span-2">
                            <Card
                                title={
                                    <div className="flex items-center gap-2">
                                        <EditOutlined className="text-indigo-500" />
                                        <span>Enter question content</span>
                                    </div>
                                }
                                className="bg-white/70 backdrop-blur-md border-0 shadow-xl rounded-2xl h-full"
                                extra={
                                    <Button
                                        type="text"
                                        icon={<CopyOutlined />}
                                        onClick={handleCopySample}
                                        className="text-indigo-500 hover:text-indigo-600"
                                    >
                                        Copy sample
                                    </Button>
                                }
                            >
                                {/* Subject Selection */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select subject <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        placeholder="Select subject..."
                                        className="w-full"
                                        size="large"
                                        loading={loadingSubjects}
                                        value={selectedSubjectId || undefined}
                                        onChange={setSelectedSubjectId}
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {subjects.map((subject) => (
                                            <Option key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>

                                {/* Topic Selection (Optional) */}
                                {selectedSubjectId && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select topic <span className="text-gray-400">(optional)</span>
                                        </label>
                                        <Select
                                            placeholder="Select topic for all questions..."
                                            className="w-full"
                                            size="large"
                                            loading={loadingTopics}
                                            value={selectedTopicName}
                                            onChange={setSelectedTopicName}
                                            showSearch
                                            optionFilterProp="children"
                                            allowClear
                                        >
                                            {topics.map((topic) => (
                                                <Option key={topic.id} value={topic.name}>
                                                    {topic.name}
                                                </Option>
                                            ))}
                                        </Select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            If selected, all generated questions will be assigned to this topic.
                                        </p>
                                    </div>
                                )}

                                {/* Text Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter question content <span className="text-red-500">*</span>
                                    </label>
                                    <TextArea
                                        rows={15}
                                        placeholder={`Enter question content here...


Context: Enter the reading passage, description, or instructions...

Question: 
1. Which of the following is correct?
A. Option A
B. Option B*
C. Option C
D. Option D

Note: Mark the correct answer with * at the end.`}
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        className="text-base"
                                        style={{ resize: "none" }}
                                    />
                                </div>

                                {/* Generate Button */}
                                <div className="mt-6">
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<ThunderboltOutlined />}
                                        onClick={handleGenerate}
                                        loading={isGenerating}
                                        disabled={!selectedSubjectId || !inputText.trim()}
                                        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 border-0 hover:from-indigo-600 hover:to-purple-700 rounded-xl shadow-lg"
                                    >
                                        {isGenerating ? "Processing..." : "Generate questions with AI"}
                                    </Button>
                                </div>
                            </Card>
                        </div>

                        {/* Instructions Panel */}
                        <div className="lg:col-span-1">
                            <Card
                                title={
                                    <div className="flex items-center gap-2">
                                        <BulbOutlined className="text-amber-500" />
                                        <span>Instructions</span>
                                    </div>
                                }
                                className="bg-white/70 backdrop-blur-md border-0 shadow-xl rounded-2xl"
                            >
                                <div className="space-y-4">
                                    <Alert
                                        message="Mark correct answer"
                                        description="Add * at the end of the correct answer. Example: C. Paris*"
                                        type="info"
                                        showIcon
                                        icon={<InfoCircleOutlined />}
                                        className="rounded-lg"
                                    />

                                    <div className="space-y-3 text-gray-600 mt-2">
                                        <div className="flex items-start gap-2">
                                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                                1
                                            </span>
                                            <span>Select subject for the question set</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                                2
                                            </span>
                                            <span>Paste question content here (can copy from Word, PDF...)</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                                3
                                            </span>
                                            <span>Mark the correct answer with * at the end</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                                4
                                            </span>
                                            <span>Click the generate button to process</span>
                                        </div>
                                    </div>

                                    <Divider className="my-4" />

                                    <div className="text-sm text-gray-500">
                                        <p className="font-medium mb-2">💡 Tip:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Send around 10 questions at a time</li>
                                            <li>AI will automatically recognize questions with context</li>
                                            <li>Can add image links to the question</li>
                                        </ul>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Step 1: Generating */}
                {currentStep === 1 && (
                    <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl rounded-2xl text-center py-16">
                        <Spin size="large" />
                        <p className="mt-6 text-xl text-gray-600">AI is analyzing and creating questions...</p>
                        <p className="text-gray-400 mt-2">This process may take a few seconds</p>
                    </Card>
                )}

                {/* Step 2: Review */}
                {currentStep === 2 && (
                    <div className="flex flex-col gap-4">
                        {/* Summary */}
                        <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl rounded-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-backgroundColor flex items-center justify-center shadow-lg">
                                        <CheckCircleOutlined style={{ color: "white" }} className="text-3xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            AI has created {generatedQuestions.length} questions
                                        </h2>
                                        <p className="text-gray-500">Check and confirm to add to the question bank</p>
                                    </div>
                                </div>
                                <Space>
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={handleReset}
                                        size="large"
                                        className="rounded-xl"
                                    >
                                        Retry
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<SendOutlined />}
                                        onClick={handleCreateQuestions}
                                        loading={isCreating}
                                        size="large"
                                        className="h-12 px-8 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 border-0 hover:from-green-600 hover:to-emerald-700 rounded-xl shadow-lg"
                                    >
                                        {isCreating ? "Creating..." : "Create questions"}
                                    </Button>
                                </Space>
                            </div>
                        </Card>

                        {/* Questions Preview */}
                        <Card
                            title={
                                <div className="flex items-center gap-2">
                                    <FileTextOutlined className="text-indigo-500" />
                                    <span>Preview questions</span>
                                </div>
                            }
                            className="bg-white/70 backdrop-blur-md border-0 shadow-xl rounded-2xl"
                        >
                            {generatedQuestions.length > 0 ? (
                                <Collapse
                                    defaultActiveKey={[0]}
                                    ghost
                                    className="bg-transparent"
                                >
                                    {generatedQuestions.map((q, i) => renderQuestionPreview(q, i))}
                                </Collapse>
                            ) : (
                                <Empty description="No questions generated" />
                            )}
                        </Card>
                    </div>
                )}

                {/* Step 3: Complete */}
                {currentStep === 3 && (
                    <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl rounded-2xl">
                        <Result
                            status="success"
                            title={
                                <span className="text-2xl font-bold text-green-600">
                                    Create questions successfully!
                                </span>
                            }
                            subTitle={
                                <span className="text-lg text-gray-600">
                                    Added {createdCount} questions to the question bank
                                </span>
                            }
                            extra={[
                                <Button
                                    type="primary"
                                    key="continue"
                                    icon={<ThunderboltOutlined />}
                                    onClick={handleReset}
                                    size="large"
                                    className="h-12 px-8 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 border-0 hover:from-indigo-600 hover:to-purple-700 rounded-xl shadow-lg"
                                >
                                    Create more questions
                                </Button>,
                                <Button
                                    key="bank"
                                    size="large"
                                    onClick={() => (window.location.href = "/teacher/question-bank")}
                                    className="h-12 px-8 rounded-xl"
                                >
                                    View question bank
                                </Button>,
                            ]}
                        />
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AIQuestionImportPage;
