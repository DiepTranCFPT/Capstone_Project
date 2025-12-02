import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, message, Modal, Rate } from "antd";
import { useMaterialDetail } from "~/hooks/useMaterialDetail";
import { useLesson } from "~/hooks/useLesson";
import type { Lesson, LessonVideoAsset } from "~/types/lesson";
import FileContentService from "~/services/fileContentService";
import LessonService from "~/services/LessonService";
import { useAuth } from "~/hooks/useAuth";
import useTeacherRatings from "~/hooks/useTeacherRatings";

const MaterialLearnPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { material, loading: materialLoading, error: materialError } = useMaterialDetail(id);
  const { getLessonsByLearningMaterial, loading: lessonsLoading } = useLesson();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState("about");
  const [openingFile, setOpeningFile] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoCache = useRef<Record<string, string>>({});

  const {
    loading: ratingLoading,
    error: ratingError,
    myRating,
    statistics,
    fetchRatingByTeacherAndStudent,
    fetchStatisticsByTeacher,
    createRating,
  } = useTeacherRatings();
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>("");
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [hasWatchedLastLesson, setHasWatchedLastLesson] = useState(false);
  const [hasSelectedRating, setHasSelectedRating] = useState(false);
  const commentRef = useRef<HTMLTextAreaElement | null>(null);
  const handleOpenPdf = async () => {
    if (!selectedLesson?.file) {
      message.warning("Không có tài liệu để xem.");
      return;
    }

    const fileRef = selectedLesson.file;
    if (fileRef.startsWith("http://") || fileRef.startsWith("https://")) {
      window.open(fileRef, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      setOpeningFile(true);
      const response = await FileContentService.viewLessonFile(fileRef);
      const url = window.URL.createObjectURL(response.data);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 5000);
    } catch (error) {
      console.error("Open PDF error:", error);
      message.error("Không thể mở tài liệu. Vui lòng thử lại.");
    } finally {
      setOpeningFile(false);
    }
  };


  // Helper sort: ưu tiên `order`, sau đó `createdAt` (bài tạo trước đứng trước)
  const sortLessons = (lessonList: Lesson[]): Lesson[] => {
    return [...lessonList].sort((a, b) => {
      const orderDiff = (a.order || 0) - (b.order || 0);
      if (orderDiff !== 0) return orderDiff;

      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aTime - bTime;
    });
  };

  useEffect(() => {
    if (id) {
      getLessonsByLearningMaterial(id).then((lessonList) => {
        const sorted = sortLessons(lessonList);
        setLessons(sorted);
        // Tự động chọn bài học đầu tiên nếu có
        if (sorted.length > 0 && !selectedLesson) {
          setSelectedLesson(sorted[0]);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const lessonVideoRef = useMemo(() => {
    if (!selectedLesson) return null;
    return selectedLesson.video ?? selectedLesson.url ?? null;
  }, [selectedLesson]);

  // Load rating info khi có material + user
  useEffect(() => {
    const teacherId = material?.authorId;
    const studentId = user?.id;
    if (!teacherId || !studentId) return;

    fetchRatingByTeacherAndStudent(teacherId, studentId);
    fetchStatisticsByTeacher(teacherId);
  }, [material?.authorId, user?.id, fetchRatingByTeacherAndStudent, fetchStatisticsByTeacher]);

  const handleSubmitRating = async () => {
    const teacherId = material?.authorId;
    const studentId = user?.id;
    if (!teacherId || !studentId) {
      message.error("Không xác định được giáo viên hoặc học viên.");
      return;
    }

    const result = await createRating({
      teacherId,
      studentId,
      rating: ratingValue,
      comment: ratingComment.trim() || undefined,
    });

    if (result) {
      message.success("Cảm ơn bạn đã đánh giá giáo viên!");
      setRatingComment("");
      fetchStatisticsByTeacher(teacherId);
      setRatingModalOpen(false);
      setHasWatchedLastLesson(true);
      setHasSelectedRating(false);
    }
  };

  useEffect(() => {
    const loadVideo = async () => {
      if (!lessonVideoRef) {
        setVideoUrl(null);
        setVideoError(null);
        return;
      }

      if (/^https?:\/\//i.test(lessonVideoRef)) {
        setVideoUrl(lessonVideoRef);
        setVideoError(null);
        return;
      }

      if (!/^VIDEO_/i.test(lessonVideoRef)) {
        setVideoUrl(lessonVideoRef);
        setVideoError(null);
        return;
      }

      const cached = videoCache.current[lessonVideoRef];
      if (cached) {
        setVideoUrl(cached);
        setVideoError(null);
        return;
      }

      try {
        setVideoLoading(true);
        setVideoError(null);
        const res = await LessonService.getVideos(lessonVideoRef);
        const payload =
          res.data && typeof res.data === "object" && "data" in res.data
            ? (res.data as { data: unknown }).data
            : res.data;
        const matched = Array.isArray(payload)
          ? payload.find(
              (video) =>
                video.id === lessonVideoRef ||
                video.name === lessonVideoRef ||
                video.nameFile === lessonVideoRef
            )
          : payload;
        if (typeof matched === "string") {
          videoCache.current[lessonVideoRef] = matched;
          setVideoUrl(matched);
          return;
        }
        const matchedAsset = matched as LessonVideoAsset | undefined;
        const assetUrl =
          matchedAsset?.url ||
          matchedAsset?.videoUrl ||
          matchedAsset?.streamUrl ||
          matchedAsset?.downloadUrl;
        if (assetUrl) {
          videoCache.current[lessonVideoRef] = assetUrl;
          setVideoUrl(assetUrl);
        } else {
          setVideoUrl(null);
          setVideoError("Không tìm thấy video.");
        }
      } catch (error) {
        console.error("Load lesson video failed:", error);
        setVideoUrl(null);
        setVideoError("Không tải được video. Vui lòng thử lại sau.");
      } finally {
        setVideoLoading(false);
      }
    };

    void loadVideo();
  }, [lessonVideoRef]);

  // Reset trạng thái rating khi đổi bài học
  useEffect(() => {
    setRatingModalOpen(false);
    setHasWatchedLastLesson(false);
    setHasSelectedRating(false);
  }, [selectedLesson]);

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

  const sortedLessons = sortLessons(lessons);
  const isLastLessonSelected =
    !!selectedLesson &&
    sortedLessons.length > 0 &&
    selectedLesson.id === sortedLessons[sortedLessons.length - 1].id;

  const handleVideoEnded = () => {
    if (
      isLastLessonSelected &&
      material?.authorId &&
      user &&
      !myRating
    ) {
      setHasWatchedLastLesson(true);
      setRatingModalOpen(true);
    }
  };

  const handleRatingChange = (value: number) => {
    const safeValue = value || 1;
    setRatingValue(safeValue);
    setHasSelectedRating(true);
    // Tự động focus vào ô comment sau khi chọn sao
    setTimeout(() => {
      commentRef.current?.focus();
    }, 0);
  };

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
                  {(() => {
                    if (videoLoading) {
                      return (
                        <div className="bg-gray-900 aspect-video flex items-center justify-center text-white">
                          Đang tải video...
                        </div>
                      );
                    }

                    if (videoError) {
                      return (
                        <div className="bg-gray-900 aspect-video flex items-center justify-center text-white px-6 text-center">
                          {videoError}
                        </div>
                      );
                    }

                    if (videoUrl) {
                      return (
                        <div className="bg-black aspect-video flex items-center justify-center">
                          <video
                            controls
                            className="w-full h-full"
                            src={videoUrl}
                            onEnded={handleVideoEnded}
                          >
                            Trình duyệt của bạn không hỗ trợ video.
                          </video>
                        </div>
                      );
                    }

                    return (
                      <div className="bg-gray-900 aspect-video flex items-center justify-center">
                        <p className="text-white">Chưa có video</p>
                      </div>
                    );
                  })()}
                </div>

                {!!selectedLesson.file && (
                  <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 font-medium">Tài liệu PDF đính kèm</p>
                      <p className="text-sm text-gray-500">Nhấn để xem chi tiết nội dung.</p>
                    </div>
                    <button
                      onClick={handleOpenPdf}
                      disabled={openingFile}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-70"
                    >
                      {openingFile ? "Đang mở..." : "Xem PDF"}
                    </button>
                  </div>
                )}

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

      {/* Modal rating giáo viên – mở sau khi xem hết video bài cuối */}
      <Modal
        open={
          ratingModalOpen &&
          hasWatchedLastLesson &&
          isLastLessonSelected &&
          !!material.authorId &&
          !!user
        }
        onCancel={() => setRatingModalOpen(false)}
        footer={null}
        title="Đánh giá giáo viên"
        centered
        destroyOnClose
      >
        {statistics && (
          <p className="text-sm text-gray-600 mb-3">
            Điểm trung bình hiện tại:{" "}
            <span className="font-semibold">
              {statistics.averageRating.toFixed(1)} / 5
            </span>{" "}
            ({statistics.totalRatings} lượt đánh giá)
          </p>
        )}

        {myRating ? (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-gray-700">
            <p className="font-semibold mb-1">
              Bạn đã đánh giá: {myRating.rating}/5
            </p>
            {myRating.comment && <p>{myRating.comment}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trải nghiệm của bạn thế nào?
              </label>
              <div className="flex flex-col items-center gap-2 group">
                <Rate
                  value={ratingValue}
                  onChange={handleRatingChange}
                  allowClear={false}
                  className="scale-100 transition-transform duration-300 hover:scale-105"
                />
                <div className="flex items-center gap-2 text-xs font-medium text-blue-500">
                  <span className="text-3xl transition-transform duration-300 group-hover:rotate-12">
                    {ratingValue >= 5
                      ? "😄"
                      : ratingValue >= 4
                      ? "😊"
                      : ratingValue === 3
                      ? "😐"
                      : ratingValue === 2
                      ? "☹️"
                      : "😡"}
                  </span>
                  <span>
                    {ratingValue >= 5
                      ? "Rất hài lòng"
                      : ratingValue >= 4
                      ? "Hài lòng"
                      : ratingValue === 3
                      ? "Bình thường"
                      : ratingValue === 2
                      ? "Chưa hài lòng"
                      : "Rất tệ"}
                  </span>
                </div>
              </div>
            </div>
            {hasSelectedRating && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhận xét (tuỳ chọn)
                </label>
                <textarea
                  ref={commentRef}
                  rows={3}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Hãy chia sẻ cảm nhận của bạn về chất lượng giảng dạy..."
                />
              </div>
            )}
            {ratingError && (
              <p className="text-xs text-red-500">{ratingError}</p>
            )}
            <button
              type="button"
              disabled={ratingLoading}
              onClick={handleSubmitRating}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {ratingLoading ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MaterialLearnPage;
