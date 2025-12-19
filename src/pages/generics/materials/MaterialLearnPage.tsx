import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message, Modal, Rate } from "antd";
import { useMaterialDetail } from "~/hooks/useMaterialDetail";
import { useLesson } from "~/hooks/useLesson";
import type { Lesson, LessonVideoAsset } from "~/types/lesson";
import FileContentService from "~/services/fileContentService";
import LessonService from "~/services/LessonService";
import { useAuth } from "~/hooks/useAuth";
import { useLearningMaterialRatings } from "~/hooks/useLearningMaterialRatings";
import LessonNotesPanel from "~/components/materials/LessonNotesPanel";
import LessonDetailsSection from "~/components/materials/LessonDetailsSection";
import CourseContentSidebar from "~/components/materials/CourseContentSidebar";
import { toast } from "~/components/common/Toast";

const isLessonCompletedFromServer = (lesson: Lesson): boolean => {
  const anyLesson = lesson as unknown as {
    progress?: number;
    completed?: boolean;
    isCompleted?: boolean;
  };

  if (typeof anyLesson.completed === "boolean") {
    return anyLesson.completed;
  }
  if (typeof anyLesson.isCompleted === "boolean") {
    return anyLesson.isCompleted;
  }

  const progress = anyLesson.progress;
  if (typeof progress === "number") {
    // Nếu backend trả thời lượng, ưu tiên so sánh theo phần trăm thời lượng
    if (lesson.duration && typeof lesson.duration === "number" && lesson.duration > 0) {
      const durationSeconds = lesson.duration * 60;
      const safeDuration = durationSeconds > 0 ? durationSeconds : lesson.duration;
      return progress >= safeDuration * 0.9;
    }

    // Fallback: coi như hoàn thành nếu progress >= 1 (cho cả dạng 0..1 và 0..100)
    return progress >= 1;
  }

  return false;
};

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
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  const {
    loading: ratingLoading,
    error: ratingError,
    myRating,
    statistics,
    fetchRatingByMaterialAndStudent,
    fetchStatisticsByMaterial,
    createRating,
  } = useLearningMaterialRatings();
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>("");
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
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
        if (sorted.length > 0 && !selectedLesson) {
          setSelectedLesson(sorted[0]);
        }

        // Xác định các lesson đã hoàn thành từ dữ liệu progress của backend (nếu có)
        const completedFromServer = sorted
          .filter((lesson) => isLessonCompletedFromServer(lesson))
          .map((lesson) => lesson.id);
        setCompletedLessonIds(completedFromServer);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const lessonVideoRef = useMemo(() => {
    if (!selectedLesson) return null;
    return selectedLesson.video ?? selectedLesson.url ?? null;
  }, [selectedLesson]);

  useEffect(() => {
    const materialId = material?.id;
    const userId = user?.id;
    if (!materialId || !userId) {
      return;
    }

    fetchRatingByMaterialAndStudent(materialId, userId);
    fetchStatisticsByMaterial(materialId);
  }, [
    material?.id,
    user?.id,
    fetchRatingByMaterialAndStudent,
    fetchStatisticsByMaterial,
  ]);

  useEffect(() => {
    if (myRating) {
      setRatingValue(myRating.rating ?? 0);
      setRatingComment(myRating.comment ?? "");
    } else {
      setRatingValue(0);
      setRatingComment("");
    }
  }, [myRating, ratingModalOpen]);

  const handleSubmitRating = async () => {
    const materialId = material?.id;
    const userId = user?.id;
    if (!materialId || !userId) {
      message.error("Không xác định được tài liệu hoặc học viên.");
      return;
    }

    const result = await createRating({
      learningMaterialId: materialId,
      studentId: userId,
      rating: ratingValue,
      comment: ratingComment.trim() || undefined,
    });

    if (result) {
      toast.success("Congratulations on completing the course!");
      setRatingComment("");
      fetchStatisticsByMaterial(materialId);
      setRatingModalOpen(false);
      setHasSelectedRating(false);
      // Navigate to certificates page after a short delay
      setTimeout(() => {
        navigate("/student/certificates");
      }, 1500);
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

  const sortedLessons = sortLessons(lessons);
  const allLessonsCompleted =
    sortedLessons.length > 0 &&
    sortedLessons.every((lesson) => completedLessonIds.includes(lesson.id));

  const handleVideoEnded = () => {
    if (!selectedLesson) return;

    setCompletedLessonIds((prev) => {
      if (prev.includes(selectedLesson.id)) {
        return prev;
      }
      return [...prev, selectedLesson.id];
    });
  };

  useEffect(() => {
    if (allLessonsCompleted && !myRating) {
      setRatingModalOpen(true);
    }
  }, [allLessonsCompleted, myRating]);

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
          {/* Left Section - Lesson Details */}
          <div className="flex-1 lg:flex-[2.5] space-y-6">
            {selectedLesson ? (
              <LessonDetailsSection
                lesson={selectedLesson}
                videoUrl={videoUrl}
                videoLoading={videoLoading}
                videoError={videoError}
                onVideoEnded={handleVideoEnded}
                onOpenPdf={handleOpenPdf}
                openingFile={openingFile}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                notesPanel={
                  <LessonNotesPanel
                    lesson={selectedLesson}
                    userId={user?.id}
                    isActive={activeTab === "notes"}
                  />
                }
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500 text-lg">Select a lesson to begin</p>
              </div>
            )}
          </div>

          {/* Right Section - Course Content */}
          <CourseContentSidebar
            lessons={sortedLessons}
            selectedLessonId={selectedLesson?.id}
            onSelectLesson={(lesson) => setSelectedLesson(lesson)}
            loading={lessonsLoading}
          />
        </div>
      </div>

      <Modal
        open={ratingModalOpen && allLessonsCompleted && !!material.id && !!user}
        onCancel={() => setRatingModalOpen(false)}
        footer={null}
        title="Rate Learning Material"
        centered
        destroyOnClose
      >
        {statistics && (
          <p className="text-sm text-gray-600 mb-3">
            Current average rating:{" "}
            <span className="font-semibold">
              {statistics.averageRating.toFixed(1)} / 5
            </span>{" "}
            ({statistics.totalRatings} reviews)
          </p>
        )}

        {myRating && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-gray-700 mb-3">
            <p className="font-semibold mb-1">
              You have rated: {myRating.rating}/5
            </p>
            {myRating.comment && <p>{myRating.comment}</p>}
            <p className="text-xs text-gray-600 mt-2">
              You can update your rating below.
            </p>
          </div>
        )}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How was your experience?
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
                    ? "Very satisfied"
                    : ratingValue >= 4
                      ? "Satisfied"
                      : ratingValue === 3
                        ? "Neutral"
                        : ratingValue === 2
                          ? "Dissatisfied"
                          : "Very poor"}
                </span>
              </div>
            </div>
          </div>
          {(hasSelectedRating || ratingComment || myRating) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments (optional)
              </label>
              <textarea
                ref={commentRef}
                rows={3}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please share your thoughts about this learning material..."
              />
            </div>
          )}
          {ratingError && !ratingError.toLowerCase().includes("not found") && (
            <p className="text-xs text-red-500">{ratingError}</p>
          )}
          <button
            type="button"
            disabled={ratingLoading || !ratingValue}
            onClick={handleSubmitRating}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {ratingLoading ? "Submitting..." : myRating ? "Update" : "Submit Rating"}
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default MaterialLearnPage;
