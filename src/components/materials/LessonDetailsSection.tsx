import { Tabs } from "antd";
import type { Lesson } from "~/types/lesson";
import type { ReactNode } from "react";

interface LessonDetailsSectionProps {
  lesson: Lesson;
  videoUrl: string | null;
  videoLoading: boolean;
  videoError: string | null;
  onVideoEnded: () => void;
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
  onOpenPdf,
  openingFile,
  activeTab,
  onTabChange,
  notesPanel,
}) => {
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
            controls
            className="w-full h-full"
            src={videoUrl}
            onEnded={onVideoEnded}
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

