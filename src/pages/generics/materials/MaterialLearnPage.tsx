import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs } from "antd";
import { useMaterialDetail } from "~/hooks/useMaterialDetail";
import { useLesson } from "~/hooks/useLesson";
import type { Lesson } from "~/types/lesson";

// Hàm chuyển đổi YouTube URL thành embed URL
const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  
  // Kiểm tra và chuyển đổi các định dạng YouTube URL
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  
  // Nếu đã là embed URL, trả về nguyên
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  return null;
};

const MaterialLearnPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { material, loading: materialLoading, error: materialError } = useMaterialDetail(id);
  const { getLessonsByLearningMaterial, loading: lessonsLoading } = useLesson();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    if (id) {
      getLessonsByLearningMaterial(id).then((lessonList) => {
        const sortedLessons = lessonList.sort((a, b) => (a.order || 0) - (b.order || 0));
        setLessons(sortedLessons);
        // Tự động chọn bài học đầu tiên nếu có
        if (sortedLessons.length > 0 && !selectedLesson) {
          setSelectedLesson(sortedLessons[0]);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (materialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (materialError || !material) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Không tìm thấy tài liệu</h2>
          <p className="text-gray-500 mb-4">
            {materialError || "Tài liệu bạn đang tìm không tồn tại."}
          </p>
          <button
            onClick={() => navigate("/materials")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const sortedLessons = [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[95%] xl:max-w-[1600px] mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">{material.title}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[95%] xl:max-w-[1600px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Section - Video Player and Details */}
          <div className="flex-1 lg:flex-[2.5] space-y-6">
            {/* Video Player */}
            {selectedLesson ? (
              <>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {selectedLesson.url && getYouTubeEmbedUrl(selectedLesson.url) ? (
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        src={getYouTubeEmbedUrl(selectedLesson.url) || ""}
                        title={selectedLesson.title || selectedLesson.name || "Bài học"}
                        className="absolute top-0 left-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : selectedLesson.url ? (
                    <div className="bg-gray-900 aspect-video flex items-center justify-center">
                      <a
                        href={selectedLesson.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Mở bài giảng
                      </a>
                    </div>
                  ) : (
                    <div className="bg-gray-900 aspect-video flex items-center justify-center">
                      <p className="text-white">Chưa có video</p>
                    </div>
                  )}
                </div>

                {/* Lesson Title */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedLesson.title || selectedLesson.name || "Bài học"}
                  </h2>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm">
                  <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                      {
                        key: "about",
                        label: "About",
                        children: (
                          <div className="p-6">
                            {selectedLesson.description ? (
                              <p className="text-gray-700 leading-relaxed">
                                {selectedLesson.description}
                              </p>
                            ) : (
                              <p className="text-gray-500">Chưa có mô tả cho bài học này.</p>
                            )}
                            {selectedLesson.duration && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Thời lượng:</span> {selectedLesson.duration} phút
                                </p>
                              </div>
                            )}
                          </div>
                        ),
                      },
                      {
                        key: "transcript",
                        label: "Transcript",
                        children: (
                          <div className="p-6">
                            <p className="text-gray-500">Transcript sẽ được cập nhật sớm.</p>
                          </div>
                        ),
                      },
                      {
                        key: "notes",
                        label: "Notes",
                        children: (
                          <div className="p-6">
                            <textarea
                              placeholder="Ghi chú của bạn về bài học này..."
                              className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                              Lưu ghi chú
                            </button>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500 text-lg">Chọn một bài học để bắt đầu</p>
              </div>
            )}
          </div>

          {/* Right Section - Course Content */}
          <div className="bg-white rounded-xl shadow-sm lg:w-96 xl:w-[420px] lg:flex-shrink-0 flex flex-col h-fit lg:max-h-[calc(100vh-120px)]">
            <div className="p-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
              <p className="text-xs text-gray-500 mt-1">{sortedLessons.length} bài học</p>
            </div>
            
            {lessonsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : sortedLessons.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Chưa có bài giảng nào trong khóa học này.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-2 py-2">
                {sortedLessons.map((lesson, index) => {
                  const isSelected = selectedLesson?.id === lesson.id;
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
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
                              isSelected 
                                ? "text-blue-700 font-semibold" 
                                : "text-gray-900 group-hover:text-blue-600"
                            }`}
                          >
                            {lesson.title || lesson.name || `Bài ${index + 1}`}
                          </h4>
                          {lesson.duration && (
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className={`text-xs ${
                                isSelected ? "text-blue-600" : "text-gray-500"
                              }`}>
                                {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-1 h-full bg-blue-500 rounded-r-lg"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialLearnPage;
