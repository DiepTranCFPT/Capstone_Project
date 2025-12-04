import type { Lesson } from "~/types/lesson";

interface CourseContentSidebarProps {
  lessons: Lesson[];
  selectedLessonId?: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  loading: boolean;
}

const CourseContentSidebar: React.FC<CourseContentSidebarProps> = ({
  lessons,
  selectedLessonId,
  onSelectLesson,
  loading,
}) => {
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
        <p className="text-xs text-gray-500 mt-1">{lessons.length} bài học</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {lessons.map((lesson, index) => {
          const isSelected = selectedLessonId === lesson.id;
          return (
            <div
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              className={`group relative p-4 rounded-lg cursor-pointer transition-all duration-200 mb-1 ${
                isSelected
                  ? "bg-blue-50 border-l-4 border-blue-500 shadow-sm"
                  : "hover:bg-gray-50 hover:shadow-sm border-l-4 border-transparent"
              }`}
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
                  {lesson.duration && (
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className={`text-xs ${isSelected ? "text-blue-600" : "text-gray-500"}`}>
                        {Math.floor(lesson.duration / 60)}:
                        {(lesson.duration % 60).toString().padStart(2, "0")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {isSelected && (
                <div className="absolute top-0 right-0 w-1 h-full bg-blue-500 rounded-r-lg" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseContentSidebar;

