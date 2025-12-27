import type { Lesson } from "~/types/lesson";

interface CourseContentSidebarProps {
  lessons: Lesson[];
  selectedLessonId?: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  loading: boolean;
  completedLessonIds?: string[];
  isMaterialCompleted?: boolean; // Nếu material đã rating/có certificate → unlock tất cả
  hasRating?: boolean;
  hasCertificate?: boolean;
}

const CourseContentSidebar: React.FC<CourseContentSidebarProps> = ({
  lessons,
  selectedLessonId,
  onSelectLesson,
  loading,
  completedLessonIds = [],
  isMaterialCompleted = false,
  hasRating = false,
  hasCertificate = false,
}) => {
  const completedSet = new Set(completedLessonIds);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm lg:w-96 xl:w-[420px] lg:flex-shrink-0 flex flex-col h-fit lg:max-h-[calc(100vh-120px)]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm lg:w-96 xl:w-[420px] lg:flex-shrink-0 flex flex-col h-fit">
        <div className="text-center py-12 px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Chưa có bài giảng nào trong khóa học này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm lg:w-96 xl:w-[420px] lg:flex-shrink-0 flex flex-col h-fit lg:max-h-[calc(100vh-120px)]">
      <div className="p-6 pb-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
        <p className="text-xs text-gray-500 mt-1">{lessons.length} Lessons</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {lessons.map((lesson, index) => {
          const isSelected = selectedLessonId === lesson.id;
          const prevAllCompleted =
            index === 0 || lessons.slice(0, index).every((l) => completedSet.has(l.id));
          // Nếu material đã hoàn thành (rating/certificate) → unlock tất cả, nếu không → giữ logic khóa
          const isLocked = isMaterialCompleted ? false : !prevAllCompleted;
          const isCompleted = completedSet.has(lesson.id);
          return (
            <div
              key={lesson.id}
              onClick={() => {
                if (!isLocked) {
                  onSelectLesson(lesson);
                }
              }}
              className={`group relative p-4 rounded-lg transition-all duration-200 mb-1 ${
                isSelected
                  ? "bg-blue-50 border-l-4 border-blue-500 shadow-sm"
                  : "hover:bg-gray-50 hover:shadow-sm border-l-4 border-transparent"
              } ${isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-start gap-3">
                {isSelected ? (
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700 mt-0.5 group-hover:from-gray-200 group-hover:to-gray-300 transition-all">
                    {index + 1}
                  </div>
                )}
                <div className="flex-grow min-w-0">
                  <h4
                    className={`font-medium mb-1.5 transition-colors ${
                      isSelected ? "text-blue-700 font-semibold" : "text-gray-900 group-hover:text-blue-600"
                    }`}
                  >
                    {lesson.title || lesson.name || `Bài ${index + 1}`}
                  </h4>
                  <div className="flex items-center gap-3 flex-wrap">
                    {lesson.duration && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className={`text-xs ${isSelected ? "text-blue-600" : "text-gray-500"}`}>
                          {Math.floor(lesson.duration / 60)}:
                          {(lesson.duration % 60).toString().padStart(2, "0")}
                        </p>
                      </div>
                    )}
                    {isCompleted && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {isSelected && (
                <div className="absolute top-0 right-0 w-1 h-full bg-blue-500 rounded-r-lg" />
              )}
              {isLocked && (
                <div className="absolute top-3 right-3 text-gray-400 flex items-center gap-1 text-xs">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 8V6a5 5 0 1110 0v2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2zm2-2a3 3 0 116 0v2H7V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Locked</span>
                </div>
              )}
              {isMaterialCompleted && !isLocked && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-xs">
                  {hasRating && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium" title="Rated">
                      ⭐ Rated
                    </span>
                  )}
                  {hasCertificate && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium" title="Certificate">
                      🏆 Certificate
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseContentSidebar;

