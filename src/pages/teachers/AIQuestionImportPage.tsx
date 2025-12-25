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
        }
    }, [selectedSubjectId, fetchTopicsBySubject]);

    // Handle generate questions
    const handleGenerate = useCallback(async () => {
        setCurrentStep(1);

        const success = await generateQuestions(selectedSubjectId, inputText);

        if (success) {
            setCurrentStep(2);
        } else {
            setCurrentStep(0);
        }
    }, [selectedSubjectId, inputText, generateQuestions]);

    // Handle create questions
    const handleCreateQuestions = useCallback(async () => {
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
        const sampleText = `1. Which of the following is the capital of France?
A. London
B. Berlin
C. Paris*
D. Madrid

2. What is 2 + 2?
A. 3
B. 4*
C. 5
D. 6

3. Who wrote "Romeo and Juliet"?
A. Charles Dickens
B. William Shakespeare*
C. Jane Austen
D. Mark Twain`;

        navigator.clipboard.writeText(sampleText);
        toast.success("Copied sample text to clipboard!");
    }, []);

    // Render question preview
    const renderQuestionPreview = (question: AIGeneratedQuestion, index: number) => {
        const correctAnswers = question.answers.filter((a) => a.isCorrect);
        const hasContext = question.context && question.context.content;

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
                                {question.content}
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
                        </div>
                    </div>
                }
                className="mb-3 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
                <div className="space-y-4">
                    {/* Context */}
                    {hasContext && (
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <div className="flex items-center gap-2 mb-2 text-amber-700 font-medium">
                                <FileTextOutlined />
                                <span>Context: {question.context?.title}</span>
                            </div>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">
                                {question.context?.content}
                            </p>
                            {question.context?.imageUrl && (
                                <img src={question.context?.imageUrl} alt={question.context?.title} />
                            )}
                        </div>
                    )}

                    {/* Question content */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium text-gray-800 mb-3">{question.content}</p>

                        {/* Answers */}
                        <div className="space-y-2">
                            {question.answers.map((answer, aIndex) => (
                                <div
                                    key={aIndex}
                                    className={`flex items-start gap-3 p-3 rounded-lg transition-all ${answer.isCorrect
                                        ? "bg-green-100 border border-green-300"
                                        : "bg-white border border-gray-200"
                                        }`}
                                >
                                    <span
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${answer.isCorrect
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-300 text-gray-600"
                                            }`}
                                    >
                                        {String.fromCharCode(65 + aIndex)}
                                    </span>
                                    <div className="flex-1">
                                        <span
                                            className={`${answer.isCorrect ? "text-green-700 font-medium" : "text-gray-700"
                                                }`}
                                        >
                                            {answer.content}
                                        </span>
                                        {answer.isCorrect && (
                                            <CheckCircleOutlined className="ml-2 text-green-500" />
                                        )}
                                        {answer.explanation && (
                                            <p className="text-gray-500 text-sm mt-1 italic">
                                                💡 {answer.explanation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Meta info - Editable Topic */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span>Topic:</span>
                            {question.topicName ? (
                                <Tag color="blue">{question.topicName}</Tag>
                            ) : (
                                <Select
                                    size="small"
                                    placeholder="Select topic..."
                                    value={question.topicName || undefined}
                                    onChange={(value) => updateQuestion(index, { topicName: value })}
                                    style={{ width: 200 }}
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
                            )}

                        </div>
                        <span>
                            Correct answers: {correctAnswers.length}/{question.answers.length}
                        </span>
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

                                {/* Text Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter question content <span className="text-red-500">*</span>
                                    </label>
                                    <TextArea
                                        rows={15}
                                        placeholder={`Enter question content here...

Example:
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

                                    <div className="space-y-3 text-gray-600">
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
