import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button } from 'antd';
import { useExamAttempt } from '~/hooks/useExamAttempt';
import ResultSummary from '~/components/test-result/ResultSummary';
import AdvancedReport from '~/components/test-result/AdvancedReport';
import Loading from '~/components/common/Loading';

const TeacherAttemptResultPage: React.FC = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const navigate = useNavigate();
    const { fetchAttemptResult, loading, error, attemptResultDetail } = useExamAttempt();

    useEffect(() => {
        if (attemptId) {
            fetchAttemptResult(attemptId);
        }
    }, [attemptId, fetchAttemptResult]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert message="Error" description={error} type="error" showIcon />
            </div>
        );
    }

    if (!attemptResultDetail) {
        return (
            <div className="p-6">
                <Alert
                    message="No Data"
                    description="Could not load exam attempt result."
                    type="warning"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center justify-between w-full gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Student Exam Result
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Viewing result for: <span className="font-medium">{attemptResultDetail.doneBy}</span>
                        </p>
                    </div>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/teacher/exam-attempts')}
                    >
                        Back to Attempts
                    </Button>
                </div>
            </div>

            {/* Result Summary */}
            <div className="mb-6">
                <ResultSummary
                    isPractice={false}
                    attemptResultDetail={attemptResultDetail}
                />
            </div>

            {/* Advanced Report */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <AdvancedReport attemptResultDetail={attemptResultDetail} />
            </div>
        </div>
    );
};

export default TeacherAttemptResultPage;
