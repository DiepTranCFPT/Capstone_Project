import React from 'react';
import { useOngoingExams } from '~/hooks/useOngoingExams';
import type { OngoingExam } from '~/hooks/useOngoingExams';
import { FiClock, FiPlay, FiTrash2, FiBookOpen } from 'react-icons/fi';
import Section from '~/components/exam/Section';

const OngoingExamsPage: React.FC = () => {
  const { ongoingExams, resumeExam, clearExam } = useOngoingExams();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLastAccessed = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return 'Vừa xong';
  };

  const handleResume = (exam: OngoingExam) => {
    resumeExam(exam);
  };

  const handleClear = (exam: OngoingExam) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài thi này? Hành động này không thể hoàn tác.')) {
      clearExam(exam.examId, exam.attemptId);
    }
  };

  return (
    <div className="bg-slate-50">
      {/* Page Title Section */}
      <Section />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📚 Bài Thi Đang Làm</h1>
          <p className="text-gray-600">Tiếp tục hoàn thành các bài thi của bạn</p>
        </div>

        {ongoingExams.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📝</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Không có bài thi nào đang làm
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Bạn chưa có bài thi nào đang dang dở. Hãy bắt đầu một bài thi mới!
            </p>
            <button
              onClick={() => window.location.href = '/exam-test'}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Bắt đầu thi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoingExams.map((exam) => (
              <div
                key={exam.attemptId}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6"
              >
                {/* Exam Title */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">
                    {exam.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <FiBookOpen className="mr-1" size={14} />
                    {exam.examId === 'combo' ? 'Bài thi tổ hợp' : 'Bài thi cá nhân'}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Tiến độ</span>
                    <span className="text-sm text-gray-500">{exam.progress} câu</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((exam.progress / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Time Remaining */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiClock className="mr-1" size={14} />
                      Còn lại
                    </div>
                    <span className={`text-sm font-medium ${
                      exam.remainingTime < 600 ? 'text-red-600' :
                      exam.remainingTime < 1800 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {formatTime(exam.remainingTime)}
                    </span>
                  </div>
                </div>

                {/* Last Accessed */}
                <div className="mb-6">
                  <div className="text-xs text-gray-400">
                    Truy cập lần cuối: {formatLastAccessed(exam.lastAccessed)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResume(exam)}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <FiPlay size={16} />
                    Tiếp tục
                  </button>
                  <button
                    onClick={() => handleClear(exam)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-3 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OngoingExamsPage;
