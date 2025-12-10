import React from 'react';
import { Card, Badge, Button, Spin, Empty } from 'antd';
import {
  BookOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  FireOutlined,
  StarOutlined,
  RightOutlined,
  GiftOutlined,
  BarChartOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
// import CardAnalytics from './CardAnalytics';
import { useAuth } from '~/hooks/useAuth';
import { useStudentDashboardStats } from '~/hooks/useStudentDashboardStats';
import { useNavigate } from 'react-router-dom';
import AIDashboardChatBubble from './AIDashboardChatBubble';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats, loading } = useStudentDashboardStats();
  const navigate = useNavigate();

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
        <Spin size="large" tip="Loading dashboard data..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fd] p-6">
      <div className="max-w-7xl mx-auto md:ml-0 ml-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.firstName} {user?.lastName} 👋</h1>
          <p className="text-gray-600">Here's your learning progress overview</p>
          {stats?.recommendedTopic && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
              <StarOutlined className="mr-2" />
              Recommended focus based on your performance: <span className="font-bold ml-1">{stats.recommendedTopic}</span>
            </div>
          )}
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <ClockCircleOutlined />
              </div>
            </div>
            {/* Mocking study time for now as it's not in API yet */}
            <div className="text-2xl font-bold text-gray-900">12h</div>
            <div className="text-sm text-gray-500">Study Time</div>
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

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

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
                        {attempt.score !== undefined ? `${attempt.score}%` : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <Empty description="No recent attempts" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button type="text" className="w-full text-blue-600 hover:bg-blue-50" onClick={() => navigate('/practice')}>
                View All Exams <RightOutlined className="ml-2" />
              </Button>
            </div>
          </Card>

          {/* Token Balance Card (Kept as is/Mocked for now as requested) */}
          <Card className="bg-white rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <TrophyOutlined className="text-xl text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Token Balance</h3>
                  <p className="text-sm text-gray-500">Learning rewards</p>
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <StarOutlined className="text-2xl text-yellow-500" />
                <span className="text-4xl font-bold text-gray-900">1,247</span>
              </div>
              <p className="text-sm text-gray-500">Total tokens earned</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <FireOutlined className="text-lg text-green-600 mb-1" />
                <p className="text-lg font-semibold text-green-600">+45</p>
                <p className="text-xs text-gray-500">This week</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <GiftOutlined className="text-lg text-blue-600 mb-1" />
                <p className="text-lg font-semibold text-blue-600">250</p>
                <p className="text-xs text-gray-500">Available</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Recent activity:</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Quiz completed</span>
                  <span className="text-green-600 font-medium">+15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Assignment submitted</span>
                  <span className="text-green-600 font-medium">+20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Daily login bonus</span>
                  <span className="text-green-600 font-medium">+10</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Button type="primary" className="w-full bg-yellow-500 hover:bg-yellow-600 border-0 rounded-xl">
                Redeem Rewards
              </Button>
            </div>
          </Card>
        </div>
        {/* Test Analytics Section (Assuming this is a separate component that might also need updates later) */}
        {/* <CardAnalytics /> */}
      </div>

      {/* AI Chat Bubble */}
      <AIDashboardChatBubble />
    </div>
  );
};

export default StudentDashboard;