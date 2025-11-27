import React from "react";
import { PiExam } from "react-icons/pi";
import { useBrowseExamTemplates } from "~/hooks/useExamBrowser";

const ExamsSection: React.FC = () => {
  const { templates, loading } = useBrowseExamTemplates({ pageNo: 0, pageSize: 3 });

  if (loading) {
    return (
      <div className="w-full py-16 bg-gradient-to-r from-slate-100 to-white flex items-center justify-center">
        <p className="text-xl">Loading exams...</p>
      </div>
    );
  }
  return (
    <div className="w-full py-16 bg-gradient-to-r from-slate-100 to-white flex flex-col items-center">
      {/* Tiêu đề nhỏ */}
      <div className="flex items-center gap-2 bg-white border border-black/20 rounded-full px-4 py-2 mb-4">
        <div className="w-8 h-8 bg-slate-300/60 rounded-full flex items-center justify-center">
          <PiExam />
        </div>
        <span className="text-black text-base">Free Exams</span>
      </div>

      {/* Tiêu đề lớn */}
      <h2 className="text-black text-3xl font-bold mb-10 text-center">
        Explore 150 Free Online Exams
      </h2>

      {/* Danh sách exams */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        {templates.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-white rounded-full p-8 shadow-lg mb-6">
              <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Exams Available</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              There are currently no exams to display. Please check back later or contact your administrator.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>New exams will appear here once they are created</span>
            </div>
          </div>
        ) : (
          templates.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 flex flex-col h-full"
            >
              {/* Header with Subject Badge */}
              <div className="flex items-start justify-between mb-3">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                  {exam.subject.name}
                </span>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="text-sm font-bold text-gray-700">
                    {exam.averageRating > 0 ? exam.averageRating.toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({exam.totalRatings})
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 flex-grow">
                {exam.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {exam.description || "No description available"}
              </p>

              {/* Metadata */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="truncate">{exam.createdBy}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{exam.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{exam.totalTakers} takers</span>
                  </div>
                </div>
              </div>

              {/* Footer with Passing Score */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Passing Score</span>
                  <span className="text-sm font-bold text-emerald-600">{exam.passingScore}%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Nút điều hướng (trái & phải) */}
      <div className="flex justify-between w-full max-w-6xl mt-10 px-4">
        <button className="w-12 h-12 flex items-center justify-center bg-emerald-700 text-white rounded-full">
          ←
        </button>
        <button className="w-12 h-12 flex items-center justify-center bg-emerald-700 text-white rounded-full">
          →
        </button>
      </div>
    </div>
  );
};

export default ExamsSection;
