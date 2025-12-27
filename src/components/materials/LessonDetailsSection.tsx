import { Tabs } from "antd";
import type { Lesson } from "~/types/lesson";
import type { ReactNode } from "react";
import { useRef, useEffect } from "react";
import LessonService from "~/services/LessonService";

interface LessonDetailsSectionProps {
  lesson: Lesson;
  videoUrl: string | null;
  videoLoading: boolean;
  videoError: string | null;
  onVideoEnded: () => void;
  onVideoPlay?: () => void;
  onOpenPdf: () => void;
  openingFile: boolean;
  activeTab: string;
  onTabChange: (key: string) => void;
  notesPanel: ReactNode;
  initialProgress?: number; // Thời gian đã xem từ backend (giây)
}

const LessonDetailsSection: React.FC<LessonDetailsSectionProps> = ({
  lesson,
  videoUrl,
  videoLoading,
  videoError,
  onVideoEnded,
  onVideoPlay,
  onOpenPdf,
  openingFile,
  activeTab,
  onTabChange,
  notesPanel,
  initialProgress = 0,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasActuallyPlayedRef = useRef(false);
  const lastPlayTimeRef = useRef<number>(0);
  const maxWatchedTimeRef = useRef<number>(0);
  const lastSavedProgressTimeRef = useRef<number>(0);
  const progressRestoredRef = useRef(false);

  useEffect(() => {
    hasActuallyPlayedRef.current = false;
    lastPlayTimeRef.current = 0;
    maxWatchedTimeRef.current = initialProgress || 0;
    lastSavedProgressTimeRef.current = 0;
    progressRestoredRef.current = false;
    
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.pause();
      videoElement.load();
      
      // Restore progress khi video đã load metadata
      const handleLoadedMetadata = () => {
        if (!progressRestoredRef.current && initialProgress > 0 && videoElement.duration > 0) {
          const safeProgress = Math.min(initialProgress, videoElement.duration);
          videoElement.currentTime = safeProgress;
          maxWatchedTimeRef.current = safeProgress;
          progressRestoredRef.current = true;
        }
      };
      
      const handleCanPlay = () => {
        if (!progressRestoredRef.current && initialProgress > 0 && videoElement.duration > 0) {
          const safeProgress = Math.min(initialProgress, videoElement.duration);
          videoElement.currentTime = safeProgress;
          maxWatchedTimeRef.current = safeProgress;
          progressRestoredRef.current = true;
        }
      };
      
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      videoElement.addEventListener('canplay', handleCanPlay, { once: true });
      
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [lesson.id, videoUrl, initialProgress]);

  const renderVideoContent = () => {
    if (videoLoading) {
      return (
        <div className="bg-gray-900 aspect-video flex items-center justify-center text-white">
          Loading video...
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
            ref={videoRef}
            key={lesson.id}
            controls
            controlsList="noplaybackrate"
            className="w-full h-full"
            src={videoUrl}
            onPlay={() => {
              const videoElement = videoRef.current;
              if (videoElement && videoElement.currentTime >= 0) {
                hasActuallyPlayedRef.current = true;
                lastPlayTimeRef.current = Date.now();
              }
              if (onVideoPlay) {
                onVideoPlay();
              }
            }}
            onTimeUpdate={async () => {
              const videoElement = videoRef.current;
              if (!videoElement) return;

              const currentTime = videoElement.currentTime;

              // Nếu người dùng tua quá xa so với mốc đã xem, kéo lại
              const allowedTime = maxWatchedTimeRef.current;
              if (currentTime > allowedTime + 0.5) {
                videoElement.currentTime = allowedTime;
                return;
              }

              if (currentTime > 0) {
                hasActuallyPlayedRef.current = true;
              }

              // Cập nhật mốc thời gian xem tối đa (không cho tua vượt quá mốc này)
              if (currentTime > maxWatchedTimeRef.current) {
                maxWatchedTimeRef.current = currentTime;
              }

              // Lưu tiến trình sau mỗi 5 giây xem
              const now = Date.now();
              if (lesson.id && now - lastSavedProgressTimeRef.current >= 5000) {
                lastSavedProgressTimeRef.current = now;
                try {
                  await LessonService.saveProgress(
                    lesson.id,
                    Math.floor(currentTime),
                    false
                  );
                } catch (error) {
                  // Không hiển thị lỗi để tránh làm phiền người dùng khi đang xem video
                  console.error("Save lesson progress failed:", error);
                }
              }
            }}
            onSeeking={(e) => {
              const videoElement = e.currentTarget;
              const allowedTime = maxWatchedTimeRef.current;
              if (videoElement.currentTime > allowedTime + 0.5) {
                videoElement.currentTime = allowedTime;
              }
            }}
            onSeeked={(e) => {
              const videoElement = e.currentTarget;
              const allowedTime = maxWatchedTimeRef.current;
              if (videoElement.currentTime > allowedTime + 0.5) {
                videoElement.currentTime = allowedTime;
              }
            }}
            onEnded={async (e) => {
              const videoElement = e.currentTarget;
              const hasValidDuration = videoElement.duration && videoElement.duration > 0;
              
              // Lưu progress cuối cùng ngay khi video kết thúc
              if (lesson.id && hasValidDuration) {
                try {
                  // Khi video kết thúc, currentTime sẽ bằng duration
                  const finalTime = Math.floor(videoElement.duration);
                  await LessonService.saveProgress(lesson.id, finalTime, true);
                  // Cập nhật maxWatchedTime để đảm bảo đồng bộ
                  maxWatchedTimeRef.current = videoElement.duration;
                } catch (error) {
                  console.error("Save final lesson progress failed:", error);
                }
              }
              
              // Nếu video có duration hợp lệ và đã kết thúc, coi như đã hoàn thành
              // (onEnded chỉ được gọi khi video thực sự kết thúc)
              if (hasValidDuration && hasActuallyPlayedRef.current) {
                onVideoEnded();
              }
            }}
            preload="metadata"
          >
            Your browser does not support video.
          </video>
        </div>
      );
    }

    return (
      <div className="bg-gray-900 aspect-video flex items-center justify-center">
        <p className="text-white">No video available</p>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {renderVideoContent()}
      </div>

      {!!lesson.file && (
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-800 font-medium">Attached PDF document</p>
            <p className="text-sm text-gray-500">Click to view detailed content.</p>
          </div>
          <button
            onClick={onOpenPdf}
            disabled={openingFile}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-70"
          >
            {openingFile ? "Opening..." : "View PDF"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {lesson.title || lesson.name || "Lesson"}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={onTabChange}
          tabBarStyle={{ paddingLeft: 24 }}
          items={[
            {
              key: "about",
              label: "About",
              children: (
                <div className="p-6">
                  {lesson.description ? (
                    <p className="text-gray-700 leading-relaxed">
                      {lesson.description}
                    </p>
                  ) : (
                    <p className="text-gray-500">No description available for this lesson.</p>
                  )}
                  {lesson.duration && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Duration:</span>{" "}
                        {lesson.duration} minutes
                      </p>
                    </div>
                  )}
                </div>
              ),
            },

            {
              key: "notes",
              label: "Notes",
              children: notesPanel,
            },
          ]}
        />
      </div>
    </>
  );
};

export default LessonDetailsSection;

