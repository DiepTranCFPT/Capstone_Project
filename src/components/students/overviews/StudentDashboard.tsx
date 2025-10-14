import React from 'react';
import { Progress, Card, Badge, Button } from 'antd';
import {
  BookOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  FireOutlined,
  CalendarOutlined,
  StarOutlined,
  RightOutlined,
  GiftOutlined
} from '@ant-design/icons';
import CardAnalytics from './CardAnalytics';
import { useAuth } from '~/hooks/useAuth';

const StudentDashboard: React.FC = () => {

  const { user } = useAuth();
  // Sample data
  const courseProgress = [
    { name: 'AP 2-D Art and Design', progress: 75, color: '#3b82f6' },
    { name: 'Digital Photography', progress: 92, color: '#10b981' },
    { name: 'Graphic Design Basics', progress: 48, color: '#f59e0b' },
    { name: 'Color Theory', progress: 100, color: '#06d6a0' },
  ];

  const upcomingTests = [
    {
      id: 1,
      title: 'AP Art Portfolio Review',
      subject: 'AP 2-D Art and Design',
      date: '2025-09-25',
      time: '14:00',
      type: 'Portfolio',
      difficulty: 'High'
    },
    {
      id: 2,
      title: 'Color Theory Quiz',
      subject: 'Color Theory',
      date: '2025-09-27',
      time: '10:30',
      type: 'Quiz',
      difficulty: 'Medium'
    },
    {
      id: 3,
      title: 'Photography Techniques Test',
      subject: 'Digital Photography',
      date: '2025-09-30',
      time: '09:00',
      type: 'Exam',
      difficulty: 'Medium'
    }
  ];

  const getDaysUntil = (dateStr: string) => {
    const testDate = new Date(dateStr);
    const today = new Date();
    const diffTime = testDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fd] p-6">
      <div className="max-w-7xl mx-auto md:ml-0 ml-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.firstName} {user?.lastName} 👋</h1>
          <p className="text-gray-600">Here's your learning progress overview</p>
        </div>
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-gray-500">Courses Enrolled</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">47h</div>
            <div className="text-sm text-gray-500">Study Time</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">4.8</div>
            <div className="text-sm text-gray-500">Avg Score</div>
          </div>
        </div>
        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Progress Card */}
          <Card className="bg-white rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BookOutlined className="text-xl text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Course Progress</h3>
                  <p className="text-sm text-gray-500">4 courses in progress</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {courseProgress.map((course, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 truncate">{course.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{course.progress}%</span>
                  </div>
                  <Progress
                    percent={course.progress}
                    showInfo={false}
                    strokeColor={course.color}
                    trailColor="#f1f5f9"
                    strokeWidth={8}
                    className="!m-0"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Overall Progress</p>
                  <p className="text-2xl font-bold text-gray-900">79%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 font-medium">+12% this week</p>
                  <p className="text-xs text-gray-500">Keep it up!</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Upcoming Tests Card */}
          <Card className="bg-white rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <ClockCircleOutlined className="text-xl text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Tests</h3>
                  <p className="text-sm text-gray-500">3 tests this week</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {upcomingTests.map((test) => {
                const daysUntil = getDaysUntil(test.date);
                return (
                  <div key={test.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{test.title}</h4>
                      <Badge
                        color={getDifficultyColor(test.difficulty)}
                        text={test.difficulty}
                        className="text-xs"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{test.subject}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarOutlined />
                          {test.date}
                        </span>
                        <span>{test.time}</span>
                      </div>
                      <div className="text-right">
                        {daysUntil === 0 ? (
                          <span className="text-xs font-semibold text-red-600">Today</span>
                        ) : daysUntil === 1 ? (
                          <span className="text-xs font-semibold text-orange-600">Tomorrow</span>
                        ) : (
                          <span className="text-xs text-gray-500">{daysUntil} days</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button type="text" className="w-full text-blue-600 hover:bg-blue-50">
                View All Tests <RightOutlined className="ml-2" />
              </Button>
            </div>
          </Card>

          {/* Token Balance Card */}
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
        {/* Test Analytics Section */}
        <CardAnalytics />
      </div>
    </div>
  );
};

export default StudentDashboard;