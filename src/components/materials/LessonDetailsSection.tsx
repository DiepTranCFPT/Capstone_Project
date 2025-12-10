import { Tabs } from "antd";
import type { Lesson } from "~/types/lesson";
import type { ReactNode } from "react";
import { useRef, useEffect } from "react";

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
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasActuallyPlayedRef = useRef(false);
  const lastPlayTimeRef = useRef<number>(0);

  useEffect(() => {
    hasActuallyPlayedRef.current = false;
    lastPlayTimeRef.current = 0;
    
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.currentTime = 0;
      videoElement.pause();
      videoElement.load();
      
      const handleLoadedData = () => {
        if (videoElement.ended) {
          videoElement.currentTime = 0;
        }
      };
      
      videoElement.addEventListener('loadeddata', handleLoadedData, { once: true });
      
      return () => {
        videoElement.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, [lesson.id, videoUrl]);

  const renderVideoContent = () => {
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
            ref={videoRef}
            key={lesson.id}
            controls
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
            onTimeUpdate={() => {
              const videoElement = videoRef.current;
              if (videoElement && videoElement.currentTime > 0) {
                hasActuallyPlayedRef.current = true;
              }
            }}
            onEnded={(e) => {
              const videoElement = e.currentTarget;
              const hasValidDuration = videoElement.duration && videoElement.duration > 0;
              const hasPlayed = hasActuallyPlayedRef.current && videoElement.currentTime > 0;
              const hasRecentPlay = lastPlayTimeRef.current > 0;
              const timeSinceLastPlay = hasRecentPlay ? Date.now() - lastPlayTimeRef.current : Infinity;
              const recentlyPlayed = hasRecentPlay && timeSinceLastPlay < 60000;
              const hasWatchedEnough = videoElement.currentTime >= Math.min(1, videoElement.duration * 0.1);
              
              if (hasPlayed && recentlyPlayed && hasWatchedEnough && hasValidDuration) {
                onVideoEnded();
              } else {
                if (!hasPlayed || !recentlyPlayed || !hasWatchedEnough) {
                  videoElement.currentTime = 0;
                  videoElement.load();
                }
              }
            }}
            preload="metadata"
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
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {renderVideoContent()}
      </div>

      {!!lesson.file && (
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-800 font-medium">Tài liệu PDF đính kèm</p>
            <p className="text-sm text-gray-500">Nhấn để xem chi tiết nội dung.</p>
          </div>
          <button
            onClick={onOpenPdf}
            disabled={openingFile}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-70"
          >
            {openingFile ? "Đang mở..." : "Xem PDF"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {lesson.title || lesson.name || "Bài học"}
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
                    <p className="text-gray-500">Chưa có mô tả cho bài học này.</p>
                  )}
                  {lesson.duration && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Thời lượng:</span>{" "}
                        {lesson.duration} phút
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
              children: notesPanel,
            },
          ]}
        />
      </div>
    </>
  );
};

export default LessonDetailsSection;

