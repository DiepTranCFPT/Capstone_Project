import React, { useMemo, useState } from "react";
import { Empty, List, Modal, Spin, Typography, Button, Form, Input, Popconfirm, Tooltip, message, Upload } from "antd";
import type { UploadFile } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from "@ant-design/icons";
import LessonService from "~/services/LessonService";
import FileContentService from "~/services/fileContentService";
import type { LearningMaterial } from "~/types/learningMaterial";
import type { Lesson } from "~/types/lesson";
import useLessonPreview from "~/hooks/useLessonPreview";

export interface LessonFormValues {
  name: string;
  file?: File | string | null;
  video?: File | string | null;
  description?: string;
  url?: string;
}

interface LessonFormFields {
  name: string;
  file?: UploadFile[];
  video?: UploadFile[];
  description?: string;
}

interface LessonModalProps {
  open: boolean;
  material: LearningMaterial | null;
  lessons?: Lesson[];
  loadingLessons?: boolean;
  onCancel: () => void;
  onCreateLesson?: (values: LessonFormValues) => Promise<void> | void;
  onUpdateLesson?: (lessonId: string, values: LessonFormValues) => Promise<void> | void;
  onDeleteLesson?: (lessonId: string) => Promise<void> | void;
  creating?: boolean;
}

const VIDEO_PLACEHOLDER_URL = "uploaded_video";

const LessonModal: React.FC<LessonModalProps> = ({
  open,
  material,
  lessons = [],
  loadingLessons = false,
  onCancel,
  onCreateLesson,
  onUpdateLesson,
  onDeleteLesson,
  creating = false,
}) => {
  const getLessonTitle = (lesson: Lesson): string => {
    if (lesson.name) return lesson.name;
    if (lesson.title) return lesson.title;
    return lesson.id;
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const [loadingLessonDetail, setLoadingLessonDetail] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [videoFileList, setVideoFileList] = useState<UploadFile[]>([]);
  const [pdfOpening, setPdfOpening] = useState(false);
  const {
    previewLesson,
    isPreviewOpen,
    loadingPreviewDetail,
    previewVideoUrl,
    previewVideoLoading,
    openPreview,
    closePreview,
  } = useLessonPreview();

  const renderPreviewContent = () => {
    if (!previewLesson) {
      return (
        <div className="py-8 text-center text-gray-500">
          Lesson information not found.
        </div>
      );
    }
    const hasPdf = Boolean(previewLesson.file);
    const pdfName = previewLesson.file ? extractFileName(previewLesson.file) : "";

    return (
      <div className="space-y-4">
        <Typography.Title level={4} className="!mb-2">
          {previewLesson.name ?? previewLesson.title ?? "Lesson"}
        </Typography.Title>
        <div className="rounded-xl overflow-hidden bg-black">
          {(loadingPreviewDetail || previewVideoLoading) ? (
          <div className="text-white text-center py-16">Loading content...</div>
          ) : previewVideoUrl ? (
            <video
              controls
              className="w-full h-full aspect-video"
              src={previewVideoUrl}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-white text-center py-16">
              No video available.
            </div>
          )}
        </div>
        {previewLesson.description && (
          <div>
            <Typography.Title level={5}>Description</Typography.Title>
            <Typography.Paragraph>{previewLesson.description}</Typography.Paragraph>
          </div>
        )}
        <div>
          <Typography.Title level={5}>PDF Material</Typography.Title>
          {hasPdf ? (
            <Button
              type="primary"
              loading={pdfOpening}
              onClick={async () => {
                if (!previewLesson.file) return;
                const fileRef = previewLesson.file;
                if (fileRef.startsWith("http://") || fileRef.startsWith("https://")) {
                  window.open(fileRef, "_blank", "noopener,noreferrer");
                  return;
                }
                try {
                  setPdfOpening(true);
                  const response = await FileContentService.viewLessonFile(fileRef);
                  const url = window.URL.createObjectURL(response.data);
                  window.open(url, "_blank", "noopener,noreferrer");
                  setTimeout(() => window.URL.revokeObjectURL(url), 5000);
                } catch (error) {
                  console.error("Open PDF error:", error);
                  message.error("Unable to open material.");
                } finally {
                  setPdfOpening(false);
                }
              }}
            >
              View {pdfName}
            </Button>
          ) : (
            <Typography.Paragraph className="text-gray-500 mb-0">
              No PDF document.
            </Typography.Paragraph>
          )}
        </div>
      </div>
    );
  };
  const [form] = Form.useForm<LessonFormFields>();
  const canCreate = useMemo(() => Boolean(material), [material]);

  // Sắp xếp lessons theo thứ tự mong muốn:
  // 1. Ưu tiên field "order" nếu backend trả về (order nhỏ hơn đứng trên)
  // 2. Nếu không có "order", dùng "createdAt" (bài cũ hơn đứng trên)
  // 3. Nếu cả hai đều không có thông tin sắp xếp, giữ nguyên thứ tự từ backend
  const sortedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => {
      const hasOrderA = typeof a.order === "number";
      const hasOrderB = typeof b.order === "number";

      if (hasOrderA && hasOrderB) {
        return (a.order as number) - (b.order as number);
      }
      if (hasOrderA && !hasOrderB) return -1;
      if (!hasOrderA && hasOrderB) return 1;

      const hasCreatedA = Boolean(a.createdAt);
      const hasCreatedB = Boolean(b.createdAt);

      if (hasCreatedA && hasCreatedB) {
        const timeA = new Date(a.createdAt as string).getTime();
        const timeB = new Date(b.createdAt as string).getTime();
        return timeA - timeB;
      }
      if (hasCreatedA && !hasCreatedB) return -1;
      if (!hasCreatedA && hasCreatedB) return 1;

      return 0;
    });
  }, [lessons]);

  const extractFileName = (path?: string | null): string => {
    if (!path) return "current-file";
    try {
      const parsedUrl = new URL(path);
      return parsedUrl.pathname.split("/").filter(Boolean).pop() ?? parsedUrl.hostname;
    } catch {
      const segments = path.split("/");
      return segments[segments.length - 1] || "current-file";
    }
  };

  const buildInitialUploadList = (filePath?: string | null): UploadFile[] => {
    if (!filePath) return [];
    return [
      {
        uid: "-1",
        name: extractFileName(filePath),
        status: "done",
        url: filePath,
      },
    ];
  };

  const resetFormState = (nextValues?: Partial<LessonFormFields>) => {
    form.resetFields();
    const initialValues: LessonFormFields = {
      name: nextValues?.name ?? "",
      description: nextValues?.description,
      file: nextValues?.file ?? [],
      video: nextValues?.video ?? [],
    };
    form.setFieldsValue(initialValues);
    setFileList(initialValues.file ?? []);
    setVideoFileList(initialValues.video ?? []);
  };

  const openCreateModal = () => {
    if (!material) {
      return;
    }
    resetFormState({
      name: `Lesson ${lessons.length + 1}`,
      file: [],
      video: [],
    });
    setFormMode("create");
    setEditingLesson(null);
    setIsFormOpen(true);
  };

  const openEditModal = async (lesson: Lesson) => {
    setFormMode("edit");
    setEditingLesson(lesson);
    setIsFormOpen(true);
    setLoadingLessonDetail(true);
    try {
      const response = await LessonService.getById(lesson.id);
      const detail = response.data.data ?? lesson;
      setEditingLesson(detail);
      const initialFileList = buildInitialUploadList(detail.file);
      const initialVideoList = buildInitialUploadList(detail.video ?? detail.url);
      resetFormState({
        name: detail.name ?? detail.title ?? "",
        description: detail.description ?? "",
        file: initialFileList,
        video: initialVideoList,
      });
    } catch (error) {
      console.error("Fetch lesson detail error:", error);
      message.error("Unable to load lesson information. Please try again.");
      const fallbackFileList = buildInitialUploadList(lesson.file);
      const fallbackVideoList = buildInitialUploadList(lesson.video ?? lesson.url);
      resetFormState({
        name: lesson.name ?? lesson.title ?? "",
        description: lesson.description ?? "",
        file: fallbackFileList,
        video: fallbackVideoList,
      });
    } finally {
      setLoadingLessonDetail(false);
    }
  };

  const handleCloseFormModal = () => {
    setIsFormOpen(false);
    setEditingLesson(null);
    resetFormState();
  };

  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    const latestList = newFileList.slice(-1);
    setFileList(latestList);
    form.setFieldsValue({ file: latestList });
    if (latestList.length > 0) {
      form.setFields([{ name: "file", errors: [] }]);
    }
  };

  const handleVideoUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    const latestList = newFileList.slice(-1);
    setVideoFileList(latestList);
    form.setFieldsValue({ video: latestList });
    if (latestList.length > 0) {
      form.setFields([{ name: "video", errors: [] }]);
    }
  };

  const normalizeFileValue = (uploadFiles?: UploadFile[]): File | string | null => {
    if (!uploadFiles || uploadFiles.length === 0) {
      return null;
    }
    const candidate = uploadFiles[0];
    if (candidate.originFileObj) {
      return candidate.originFileObj;
    }
    if (candidate.url) {
      return candidate.url;
    }
    return null;
  };

  const handleSubmit = async () => {
    if (formMode === "create" && !onCreateLesson) {
      return;
    }
    if (formMode === "edit" && (!onUpdateLesson || !editingLesson)) {
      return;
    }
    try {
      const values = await form.validateFields();
      const payload: LessonFormValues = {
        name: values.name,
        description: values.description,
        file: normalizeFileValue(values.file),
        video: normalizeFileValue(values.video),
        url: editingLesson?.url ?? VIDEO_PLACEHOLDER_URL,
      };

      // Require lesson video
      if (!payload.video) {
        form.setFields([
          { name: "video", errors: ["Please upload the lesson video"] },
        ]);
        return;
      }
      // Require PDF material
      if (!payload.file) {
        form.setFields([
          { name: "file", errors: ["Please upload the PDF material"] },
        ]);
        return;
      }
      setSubmitting(true);
      if (formMode === "create" && onCreateLesson) {
        await onCreateLesson(payload);
      }
      if (formMode === "edit" && onUpdateLesson && editingLesson) {
        await onUpdateLesson(editingLesson.id, payload);
      }
      handleCloseFormModal();
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "errorFields" in error) {
        return;
      }
      console.error("Lesson creation error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (lessonId: string) => {
    if (!onDeleteLesson) {
      return;
    }
    try {
      setDeletingLessonId(lessonId);
      await onDeleteLesson(lessonId);
    } catch (error) {
      console.error("Lesson delete error:", error);
    } finally {
      setDeletingLessonId(null);
    }
  };

  return (
    <Modal
      title={material ? `Lessons • ${material.title}` : "Lessons"}
      open={open}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
        <Button key="create" type="primary" onClick={() => openCreateModal()} disabled={!canCreate}>
          Add Lesson
        </Button>,
      ]}
      onCancel={onCancel}
      destroyOnClose
    >
      <Typography.Title level={5}>Existing Lessons</Typography.Title>
      <div className="max-h-64 overflow-y-auto mb-4">
        {loadingLessons ? (
          <div className="flex justify-center py-6">
            <Spin />
          </div>
        ) : lessons.length > 0 ? (
          <List
            size="small"
            dataSource={sortedLessons}
            renderItem={(lesson) => {
              return (
                <List.Item className="!flex !items-center">
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium">{getLessonTitle(lesson)}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Tooltip title="View lesson">
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => openPreview(lesson)}
                          aria-label="View lesson"
                        />
                      </Tooltip>
                      {onUpdateLesson ? (
                        <Tooltip title="Edit lesson">
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => openEditModal(lesson)}
                            aria-label="Edit lesson"
                          />
                        </Tooltip>
                      ) : null}
                      {onDeleteLesson ? (
                        <Popconfirm
                          title="Delete lesson?"
                          description="This action cannot be undone."
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true, loading: deletingLessonId === lesson.id }}
                          onConfirm={() => handleDelete(lesson.id)}
                        >
                          <Tooltip title="Delete lesson">
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              loading={deletingLessonId === lesson.id}
                              aria-label="Delete lesson"
                            />
                          </Tooltip>
                        </Popconfirm>
                      ) : null}
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        ) : (
          <div className="flex justify-center py-6">
            <Empty description="No lessons yet." />
          </div>
        )}
      </div>

      <Modal
        title={formMode === "create" ? "Add Lesson" : "Edit Lesson"}
        open={isFormOpen}
        onOk={handleSubmit}
        confirmLoading={loadingLessonDetail || submitting || (formMode === "create" && creating)}
        onCancel={handleCloseFormModal}
        okText={formMode === "create" ? "Create" : "Save"}
        cancelText="Cancel"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter lesson name" }]}
          >
            <Input placeholder="Enter lesson name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea placeholder="Enter description" rows={3} />
          </Form.Item>

          <Form.Item
            label="Lesson video"
            required
            name="video"
            help="Upload lesson video (mp4, webm, ...)"
          >
            <Upload
              multiple={false}
              maxCount={1}
              accept="video/*"
              beforeUpload={() => false}
              fileList={videoFileList}
              onChange={handleVideoUploadChange}
              onRemove={() => {
                setVideoFileList([]);
                form.setFieldsValue({ video: [] });
              }}
            >
              <Button icon={<UploadOutlined />}>Choose video</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="PDF material"
            name="file"
            required
            help="Upload PDF file with important notes"
          >
            <Upload
              multiple={false}
              maxCount={1}
              accept="application/pdf"
              beforeUpload={() => false}
              fileList={fileList}
              onChange={handleUploadChange}
              onRemove={() => {
                setFileList([]);
                form.setFieldsValue({ file: [] });
              }}
            >
              <Button icon={<UploadOutlined />}>Choose PDF</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={previewLesson ? previewLesson.name ?? previewLesson.title : "Lesson preview"}
        open={isPreviewOpen}
        footer={[
          <Button key="close" onClick={closePreview}>
            Close
          </Button>,
        ]}
        onCancel={closePreview}
        width={900}
        destroyOnClose
      >
        {renderPreviewContent()}
      </Modal>
    </Modal>
  );
};

export default LessonModal;
