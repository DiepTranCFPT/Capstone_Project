import React from "react";
import { useBrowseExamTemplates } from "~/hooks/useExamBrowser";
import { PiExam } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

const ExamsTrendingSection: React.FC = () => {
  const { templates, loading } = useBrowseExamTemplates({
    pageNo: 0,
    pageSize: 3,
    minRating: 4 // Get highly rated exams for trending section
  });
  const navigate = useNavigate();
  const handleExamClick = () => {
    // Navigate to exam details page
    navigate(`/exam-test`);
  };

  if (loading) {
    return (
      <div className="w-full bg-zinc-200 py-20 flex items-center justify-center">
        <p className="text-xl">Loading trending exams...</p>
      </div>
    );
  }



  return (
    <div className="w-full bg-gradient-to-br from-teal-300 to-emerald-400 relative overflow-hidden py-20">
      {/* background shapes */}
      {/* <img
        src="https://placehold.co/602x527"
        alt="bg-shape"
        className="absolute right-0 bottom-0 opacity-40 rotate-180"
      />
      <img
        src="https://placehold.co/447x391"
        alt="bg-shape"
        className="absolute left-0 bottom-0 opacity-40"
      /> */}

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* badge */}
        <div className="w-full flex items-center justify-center mb-4">
          <div className="flex items-center justify-center gap-2 bg-white border border-black/20 rounded-full px-4 py-2 inline-flex">
            <div className="w-7 h-7 bg-slate-300/60 rounded-full flex items-center justify-center">
              <PiExam />
            </div>
            <span className="text-black text-sm">Trending Exams</span>
          </div>
        </div>

        {/* heading + arrows */}
        <div className="flex justify-center items-center mb-10">
          <h2 className="text-black text-xl md:text-3xl text-center font-bold max-w-xl">
            Explore New and Trending Online Exams
          </h2>
          {/* <div className="flex gap-4">
            <button className="w-12 h-12 flex items-center justify-center bg-white rounded-full border-2 border-teal-400 text-teal-400">
              ←
            </button>
            <button className="w-12 h-12 flex items-center justify-center bg-white rounded-full border-2 border-teal-400 text-teal-400">
              →
            </button>
          </div> */}
        </div>

        {/* exam cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-white rounded-full p-8 shadow-lg mb-6">
                <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Trending Exams Yet</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                We're currently looking for highly-rated exams to feature here. Check back soon for trending content!
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Exams with 4+ star ratings will appear here</span>
              </div>
            </div>
          ) : (
            templates.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                {/* Card Header with gradient background */}
                <div className="bg-gray-100 p-6 text-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-block px-3 py-1 bg-gray-200 backdrop-blur-sm text-gray-700 text-xs font-semibold rounded-full">
                      {exam.subject.name}
                    </span>
                    <div className="flex items-center gap-1 bg-gray-100/20 backdrop-blur-sm px-2 py-1 rounded-full">
                      <svg className="w-4 h-4 text-yellow-300 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="text-sm font-bold">
                        {exam.averageRating > 0 ? exam.averageRating.toFixed(1) : 'N/A'}
                      </span>
                      <span className="text-xs opacity-80">
                        ({exam.totalRatings})
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold line-clamp-2 min-h-[3.5rem]">
                    {exam.title}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-grow flex flex-col">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                    {exam.description || "No description available"}
                  </p>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="truncate text-xs">{exam.createdBy}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs">{exam.duration} mins</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-xs">{exam.totalTakers} takers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-semibold text-emerald-600">{exam.passingScore}% pass</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs opacity-80">
                        {exam.tokenCost} 💰 (tokens)
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleExamClick()}
                    className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 text-white px-6 py-3 rounded-lg text-sm font-bold hover:from-teal-500 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg">
                    Explore Exam Now
                  </button>
                </div>
              </div>
            )))}
        </div>
      </div>
    </div>
  );
};

export default ExamsTrendingSection;
