import { Button, Card, Input, message, Slider, Spin, Alert, Empty, Typography } from "antd";
import { ArrowLeftOutlined } from '@ant-design/icons';
import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useExamAttempt } from "~/hooks/useExamAttempt";
import type { ManualGradeItem } from "~/types/examAttempt";

const { TextArea } = Input;

const GradeSubmissionPage: React.FC = () => {
    const { submissionId: attemptId } = useParams<{ submissionId: string }>();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode'); // 'review' or null

    const {
        fetchAttemptResult,
        gradeAttempt,
        loading,
        error,
        attemptResultDetail,
    } = useExamAttempt();

    const [manualGrades, setManualGrades] = useState<ManualGradeItem[]>([]);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

    console.log('Raw params:', useParams());
    console.log('Extracted attemptId (from submissionId):', attemptId);

    useEffect(() => {
        if (attemptId) {
            console.log('Calling fetchAttemptResult with:', attemptId);
            fetchAttemptResult(attemptId);
        }
    }, [attemptId, fetchAttemptResult]);

    const questionsToGrade = useMemo(() => {
        if (!attemptResultDetail) return [];
        if (mode === 'review') {
            return attemptResultDetail.questions.filter(q => q.question.type === 'frq');
        }
        return attemptResultDetail.questions;
    }, [attemptResultDetail, mode]);
    console.log('ID:', attemptId);
    console.log('Questions to grade:', attemptResultDetail);

    useEffect(() => {
        if (questionsToGrade.length > 0) {
            setManualGrades(questionsToGrade.map(q => ({
                examQuestionId: q.examQuestionId,
                score: q.studentAnswer?.score ?? 0,
                feedback: q.studentAnswer?.feedback ?? '',
            })));
        }
    }, [questionsToGrade]);

    const handleGradeChange = (examQuestionId: string, score: number, feedback: string) => {
        setManualGrades(prev =>
            prev.map(g => (g.examQuestionId === examQuestionId ? { ...g, score, feedback } : g))
        );
    };

    const handleFinishGrading = async () => {
        if (!attemptId) return;
        try {
            await gradeAttempt(attemptId, { grades: manualGrades });
            message.success('Grading finished successfully!');
        } catch (err) {
            console.error("Grading failed:", err);
            message.error('Failed to submit grading.');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon />;
    }

    if (!attemptResultDetail || questionsToGrade.length === 0) {
        return (
            <div style={{ padding: '24px' }}>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <Typography.Text style={{ fontSize: '16px', color: '#8c8c8c' }}>
                            Submission not found or no questions to grade.
                        </Typography.Text>
                    }
                />
            </div>
        );
    }

    const activeQuestion = questionsToGrade[activeQuestionIndex];
    const activeGrade = manualGrades.find(g => g.examQuestionId === activeQuestion.examQuestionId);

    return (
        <div>
            <Link to={'/teacher/review-queue'} className="flex items-center text-gray-600 mb-4" >
                <ArrowLeftOutlined className="mr-2" /> Back to Submissions
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Grade Submission {mode === 'review' && <span className="text-lg font-normal text-blue-500">(Review Mode)</span>}
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: student's answer */}
                <div className="lg:col-span-2">
                    <Card title={`Question: ${activeQuestion.question.content}`}>
                        <p className="bg-gray-50 p-4 rounded-md min-h-[200px] whitespace-pre-wrap">
                            {activeQuestion.studentAnswer?.frqAnswerText || ''}
                        </p>
                    </Card>
                    {/* Navigation */}
                    <div className="flex justify-between mt-4">
                        <Button
                            onClick={() => setActiveQuestionIndex(prev => prev - 1)}
                            disabled={activeQuestionIndex === 0}
                        >
                            Previous
                        </Button>
                        <span>{activeQuestionIndex + 1} / {questionsToGrade.length}</span>
                        <Button
                            onClick={() => setActiveQuestionIndex(prev => prev + 1)}
                            disabled={activeQuestionIndex === questionsToGrade.length - 1}
                        >
                            Next
                        </Button>
                    </div>
                </div>

                {/* Right side: Grading panel */}
                <div>
                    <Card>
                        <div className="mb-4">
                            <p className="font-semibold text-sm text-gray-500">{attemptResultDetail.title}</p>
                        </div>
                        <div className="mb-4">
                            <label className="font-semibold">Score: {activeGrade?.score ?? 0}/{activeQuestion.points}</label>
                            <Slider
                                value={activeGrade?.score ?? 0}
                                max={activeQuestion.points}
                                onChange={(score) => handleGradeChange(activeQuestion.examQuestionId, score, activeGrade?.feedback ?? '')}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="font-semibold">Feedback</label>
                            <TextArea
                                rows={6}
                                value={activeGrade?.feedback ?? ''}
                                onChange={(e) => handleGradeChange(activeQuestion.examQuestionId, activeGrade?.score ?? 0, e.target.value)}
                                placeholder='Provide detailed feedback for the student'
                            />
                        </div>

                        <div className="space-y-3">                          
                            <Button type="primary" block size="large" onClick={handleFinishGrading}>
                                Finish Grading
                            </Button>
                        </div>
                    </Card>
                  
                </div>
            </div>
        </div>
    );
};

export default GradeSubmissionPage;
