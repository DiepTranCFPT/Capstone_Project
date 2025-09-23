import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Statistic, Progress, Tag, Descriptions } from 'antd';
import {  CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { completedTests } from '~/data/mockTest';

const TestReportDetailPage: React.FC = () => {
    const { reportId } = useParams<{ reportId: string }>();
    const reportData = completedTests.find(test => test.id.toString() === reportId);

    if (!reportData) {
        return <div>Test report not found.</div>;
    }

    const correctAnswers = (reportData.score / 100) * 50; // Assuming 50 questions total
    const incorrectAnswers = 50 - correctAnswers;

    const apScoreGoals = [
        { score: 1, percentage: 0 },
        { score: 2, percentage: 40 },
        { score: 3, percentage: 60 },
        { score: 4, percentage: 75 },
        { score: 5, percentage: 90 },
    ];

    const currentAPLevel = apScoreGoals.slice().reverse().find(level => reportData.score >= level.percentage);
    const nextAPLevel = apScoreGoals.find(level => reportData.score < level.percentage);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-2">{reportData.title}</h1>
            <p className="text-gray-500 mb-6">Detailed report for the test taken on {reportData.date}</p>

            <Row gutter={[16, 16]}>
                {/* Score and Time */}
                <Col span={24}>
                    <Card title="Overall Performance">
                        <Row gutter={16}>
                            <Col span={6}><Statistic title="Overall Score" value={reportData.score} suffix="%" /></Col>
                            <Col span={6}><Statistic title="AP Score" value={reportData.apScore} suffix="/ 5" /></Col>
                            <Col span={6}><Statistic title="MCQ Time" value={reportData.mcqTime} suffix="min" /></Col>
                            <Col span={6}><Statistic title="FRQ Time" value={reportData.frqTime} suffix="min" /></Col>
                        </Row>
                    </Card>
                </Col>

                {/* Correct/Incorrect */}
                <Col xs={24} md={12}>
                    <Card title="Answer Analysis">
                        <Row>
                            <Col span={12} className="text-center">
                                <Statistic
                                    title="Correct Answers"
                                    value={correctAnswers}
                                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                />
                            </Col>
                            <Col span={12} className="text-center">
                                <Statistic
                                    title="Incorrect Answers"
                                    value={incorrectAnswers}
                                    prefix={<CloseCircleOutlined style={{ color: '#f5222d' }} />}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>

                {/* Strengths and Weaknesses */}
                <Col xs={24} md={12}>
                    <Card title="Strengths & Weaknesses vs. AP Standard">
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Strength">Grammar</Descriptions.Item>
                            <Descriptions.Item label="Weakness">Reading Comprehension</Descriptions.Item>
                            <Descriptions.Item label="AP Standard Comparison">
                                <Tag color="success">Exceeds standard in Grammar</Tag>
                                <Tag color="warning">Needs improvement in Reading</Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                {/* Progress towards goal */}
                <Col span={24}>
                    <Card title="Progress Towards AP Score Goal">
                        <div className="text-center">
                            <Progress
                                type="dashboard"
                                percent={reportData.score}
                                format={() => `${reportData.apScore}/5`}
                            />
                            <p className="font-semibold mt-4">Current AP Score: {currentAPLevel?.score}</p>
                            {nextAPLevel && (
                                <p className="text-gray-600">
                                    You need <strong>{nextAPLevel.percentage - reportData.score}%</strong> more to reach AP Score {nextAPLevel.score}.
                                </p>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default TestReportDetailPage;