import { Avatar, Button, Card, Input, message, Slider } from "antd";
import { ArrowLeftOutlined, RobotOutlined } from '@ant-design/icons';
import type React from "react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mockSubmissions } from "~/data/teacher";
import AIGradingSupport from "~/components/teachers/AI/AIGradingSupport";
const { TextArea } = Input;

const GradeSubmissionPage: React.FC = () => {

    const { submissionId } = useParams<{ submissionId: string }>();
    const submission = mockSubmissions.find(s => s.id === submissionId);
    const [score, setScore] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>('');
    const [showAISuggestion, setShowAISuggession] = useState<boolean>(false);

    if (!submission) {
        return <div>Submission not found.</div>
    }

    const handleFinishGrading = () => {
        message.success('Grading finished!');
    };

    return (
        <div>
            <Link to={'/teacher/grading'} className="flex items-center text-gray-600 mb-4" >
                <ArrowLeftOutlined className="mr-2" /> Back to Submissions
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Grade Submission</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: student's answer */}
                <div className="lg:col-span-2">
                    <Card title={`Question ${submission.frqAnswers?.[0].questionText}`}>
                        <p className="bg-gray-50 p-4 rounded-md min-h-[200px] whitespace-pre-wrap">
                            {submission.frqAnswers?.[0].answerText}
                        </p>
                    </Card>
                </div>
                {/* Right side: Grading panel */}
                <div>
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar src={submission.student.avatar} size="large" />
                            <div>
                                <p className="font-semibold">{submission.student.name}</p>
                                <p className="text-sm text-gray-500">{submission.exam.title}</p>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="font-semibold">Socre: {score}/100</label>
                            <Slider value={score} onChange={setScore} />
                        </div>
                        <div className="mb-6">
                            <label className="font-semibold">Feedback</label>
                            <TextArea
                                rows={6}
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder='Provider detailed feedback for the student'
                            />
                        </div>

                        <div className="space-y-3">
                            <Button
                                type="dashed"
                                icon={<RobotOutlined />}
                                block
                                onClick={() => setShowAISuggession(!showAISuggestion)}
                            >
                                {showAISuggestion ? 'Hide' : 'Show'} AI Grading Support
                            </Button>
                            <Button type="primary" block size="large" onClick={handleFinishGrading}>
                                Finish Grading
                            </Button>
                        </div>
                    </Card>

                    {showAISuggestion && (
                        <div className="mt-4">
                            <AIGradingSupport
                                studentAnswer={submission.frqAnswers?.[0].answerText || ''}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
};

export default GradeSubmissionPage;