import React, { useState } from 'react';
import { Card, Badge, Button, Spin, Empty } from 'antd';
import {
  BookOutlined,
  ClockCircleOutlined,
  StarOutlined,
  RightOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  BulbOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
// import CardAnalytics from './CardAnalytics';
import { useAuth } from '~/hooks/useAuth';
import { useStudentDashboardStats } from '~/hooks/useStudentDashboardStats';
import { useNavigate } from 'react-router-dom';
import StudentDashboardService from '~/services/StudentDashboardService';
import { toast } from '~/components/common/Toast';
import ReactMarkdown from 'react-markdown';

// Helper function to get greeting based on current hour
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return '🌄Good Morning';
  } else if (hour >= 12 && hour < 18) {
    return '🌇Good Afternoon';
  } else if (hour >= 18 && hour < 22) {
    return '🌆Good Evening';
  } else {
    return '🌃Good Night';
  }
};

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats, overall, financial, examStats, loading, refetch } = useStudentDashboardStats();
  const navigate = useNavigate();

  // State for on-demand AI recommendation
  const [onDemandRecommend, setOnDemandRecommend] = useState<string | null>(null);
  const [loadingRecommend, setLoadingRecommend] = useState(false);

  // Handler to get AI recommendation immediately
  const handleGetRecommendation = async () => {
    setLoadingRecommend(true);
    try {
      const response = await StudentDashboardService.getRecommends();
      if (response.code === 1000 || response.code === 0) {
        toast.success('AI recommendation generated!');
        // Refetch the dashboard stats to get the updated examStats.recommend
        await refetch();
        // Mark that we just updated (for UI badge)
        setOnDemandRecommend('updated');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error getting AI recommendation:', error);
      toast.error('Failed to get AI recommendation. Please try again later.');
    } finally {
      setLoadingRecommend(false);
    }
  };

  // Transform topic performance for Radar Chart
  const topicData = React.useMemo(() => {
    if (!stats?.topicPerformance) return [];
    return Object.entries(stats.topicPerformance).map(([subject, score]) => ({
      subject: subject.length > 15 ? subject.substring(0, 15) + '...' : subject,
      fullSubject: subject,
      score: score,
      fullMark: 100
    }));
  }, [stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fd] p-6 flex justify-center items-center">
        <Spin size="large" tip="Loading dashboard data...">
          <div className="p-12" />
        </Spin>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fd] p-6">
      <div className="w-full mx-auto md:ml-0 ml-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{getGreeting()}, {user?.firstName} {user?.lastName}</h1>
          <p className="text-gray-600">Here's your learning progress overview</p>
          {stats?.recommendedTopic && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
              <StarOutlined className="mr-2" />
              Recommended focus based on your performance: <span className="font-bold ml-1">{stats.recommendedTopic}</span>
            </div>
          )}
        </div>

        {/* AI Recommendation Section - Now at the top */}
        <div className="mb-8">
          <Card
            className="bg-white rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <RobotOutlined className="text-3xl text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <BulbOutlined className="text-yellow-500 text-lg animate-pulse" />
                    <span className="text-gray-900 font-semibold text-lg">AI Learning</span>
                  </div>
                  <button
                    onClick={handleGetRecommendation}
                    className='bg-backgroundColor hover:scale-105 transition-all duration-300 text-white py-2 px-4 rounded-md'
                  >
                    {loadingRecommend ? 'Analyzing...' : 'Get AI Advice Now'}
                  </button>
                </div>

                {/* Display recommendation from examStats */}
                {examStats?.recommend ? (
                  <>
                    <div className="text-gray-700 text-base leading-relaxed prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          strong: ({ children }) => (
                            <span className="font-bold text-blue-600 bg-blue-50 px-1 rounded">
                              {children}
                            </span>
                          ),
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          ),
                        }}
                      >
                        {examStats.recommend}
                      </ReactMarkdown>
                    </div>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <div className="px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
                        <span className="text-blue-600 text-xs">✨ Personalized for you</span>
                      </div>
                      {onDemandRecommend && (
                        <div className="px-3 py-1 bg-green-50 rounded-full border border-green-200">
                          <span className="text-green-600 text-xs">🔄 Just updated</span>
                        </div>
                      )}
                      {!onDemandRecommend && (
                        <div className="px-3 py-1 bg-gray-50 rounded-full border border-gray-200">
                          <span className="text-gray-500 text-xs">⏰ Auto-generated at 11:30 AM daily</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 text-base mb-3">
                      No recommendation available yet. Click the button above to get personalized advice from AI!
                    </p>
                    <p className="text-gray-400 text-sm">
                      💡 AI automatically generates recommendations at 11:30 AM daily
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <BookOutlined />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalExamsTaken || 0}</div>
            <div className="text-sm text-gray-500">Exams Taken</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <CheckCircleOutlined />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats?.examsInProgress || 0}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <BarChartOutlined />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats?.averageScore ? Math.round(stats.averageScore * 10) / 10 : 0}</div>
            <div className="text-sm text-gray-500">Avg Score</div>
          </div>
        </div>

        {/* Statistics Cards - Overall, Financial, Exam */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Overall Statistics Card */}
          <Card className="bg-white rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BarChartOutlined className="text-xl text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
                  <p className="text-sm text-gray-500">Overall statistics</p>
                </div>
              </div>
            </div>
            {overall ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Courses enrolled:</span>
                  <span className="text-lg font-bold text-gray-900">{overall.totalCoursesEnrolled ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Courses completed:</span>
                  <span className="text-lg font-bold text-green-600">{overall.totalCompletedCourses ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending assignments:</span>
                  <span className="text-lg font-bold text-orange-600">{overall.totalPendingAssignments ?? 0}</span>
                </div>
              </div>
            ) : (
              <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>

          {/* Financial Statistics Card */}
          <Card className="bg-white rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarOutlined className="text-xl text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Finance</h3>
                  <p className="text-sm text-gray-500">Payment statistics</p>
                </div>
              </div>
            </div>
            {financial ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total spent:</span>
                  <span className="text-lg font-bold text-green-600">{(financial.totalSpent ?? 0).toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Registered materials:</span>
                  <span className="text-lg font-bold text-blue-600">{financial.totalRegisteredMaterials ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current balance:</span>
                  <span className="text-lg font-bold text-purple-600">{(financial.currentBalance ?? 0).toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            ) : (
              <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>

          {/* Exam Statistics Card */}
          <Card className="bg-white rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <BookOutlined className="text-xl text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Exams</h3>
                  <p className="text-sm text-gray-500">Exam statistics</p>
                </div>
              </div>
            </div>
            {examStats ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total attempts:</span>
                  <span className="text-lg font-bold text-gray-900">{examStats.totalExamsTaken ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">In progress:</span>
                  <span className="text-lg font-bold text-orange-600">{examStats.examsInProgress ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed:</span>
                  <span className="text-lg font-bold text-green-600">
                    {examStats.recentAttempts?.filter(a => a.status === 'COMPLETED').length ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-gray-600">Average score:</span>
                  <span className="text-xl font-bold text-blue-600">{(examStats.averageScore ?? 0).toFixed(1)}</span>
                </div>
              </div>
            ) : (
              <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Topic Performance Radar Chart */}
          <Card className="bg-white rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BarChartOutlined className="text-xl text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Topic Performance</h3>
                  <p className="text-sm text-gray-500">Your strengths & weaknesses</p>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              {topicData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={topicData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No topic data yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Weakest Topic</p>
                  {/* Calculate weakest topic */}
                  <p className="text-md font-bold text-gray-900">
                    {topicData.length > 0
                      ? topicData.reduce((min, p) => p.score < min.score ? p : min, topicData[0]).fullSubject
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Strongest Topic</p>
                  {/* Calculate strongest topic */}
                  <p className="text-md font-bold text-gray-900 text-right">
                    {topicData.length > 0
                      ? topicData.reduce((max, p) => p.score > max.score ? p : max, topicData[0]).fullSubject
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Attempts Card */}
          <Card className="bg-white rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <ClockCircleOutlined className="text-xl text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Attempts</h3>
                  <p className="text-sm text-gray-500">Latest exam activity</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
                stats.recentAttempts.map((attempt) => (
                  <div key={attempt.attemptId} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{attempt.title}</h4>
                      <Badge
                        color={attempt.status === 'COMPLETED' ? '#10b981' : '#f59e0b'}
                        text={attempt.status}
                        className="text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {new Date(attempt.startTime).toLocaleDateString()}
                      </div>
                      <div className="text-right font-bold text-blue-600">
                        {attempt.score !== undefined ? `${attempt.score}` : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <Empty description="No recent attempts" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button type="text" className="w-full text-blue-600 hover:bg-blue-50" onClick={() => navigate('/student/test-reports')}>
                View All Exams <RightOutlined className="ml-2" />
              </Button>
            </div>
          </Card>

        </div>
        {/* Test Analytics Section (Assuming this is a separate component that might also need updates later) */}
        {/* <CardAnalytics /> */}
      </div>
    </div>
  );
};

export default StudentDashboard;