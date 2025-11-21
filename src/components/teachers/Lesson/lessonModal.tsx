import React, { useMemo, useState } from "react";
import { Empty, List, Modal, Spin, Typography, Button, Form, Input, Popconfirm, Tooltip, message, Upload } from "antd";
import type { UploadFile } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from "@ant-design/icons";
import LessonService from "~/services/LessonService";
import FileContentService from "~/services/fileContentService";
import type { LearningMaterial } from "~/types/learningMaterial";
import type { Lesson } from "~/types/lesson";

export interface LessonFormValues {
  name: string;
  file?: File | string | null;
  url?: string;
  description?: string;
}

interface LessonFormFields {
  name: string;
  file?: UploadFile[];
  url?: string;
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
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loadingLessonDetail, setLoadingLessonDetail] = useState(false);
  const [loadingPreviewDetail, setLoadingPreviewDetail] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [pdfOpening, setPdfOpening] = useState(false);
  const openPreviewModal = async (lesson: Lesson) => {
    setPreviewLesson(lesson);
    setIsPreviewOpen(true);
    try {
      setLoadingPreviewDetail(true);
      const response = await LessonService.getById(lesson.id);
      if (response.data.data) {
        setPreviewLesson(response.data.data);
      }
    } catch (error) {
      console.error("Fetch preview detail error:", error);
      message.error("Không thể tải chi tiết bài học.");
    } finally {
      setLoadingPreviewDetail(false);
    }
  };

  const closePreviewModal = () => {
    setIsPreviewOpen(false);
    setPreviewLesson(null);
  };

const getEmbeddedUrl = (lesson: Lesson): string | null => {
    const rawUrl = lesson.url ?? lesson.file ?? "";
    if (!rawUrl) return null;
    try {
      const url = new URL(rawUrl);
      const host = url.hostname;
      if (host.includes("youtube.com")) {
        const videoId = url.searchParams.get("v");
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      if (host.includes("youtu.be")) {
        const pathId = url.pathname.replace("/", "");
        if (pathId) {
          return `https://www.youtube.com/embed/${pathId}`;
        }
      }
      return rawUrl;
    } catch {
      return rawUrl;
    }
  };

  const renderPreviewContent = () => {
    if (!previewLesson) {
      return (
        <div className="py-8 text-center text-gray-500">
          Không tìm thấy thông tin bài học.
        </div>
      );
    }
    const embedUrl = getEmbeddedUrl(previewLesson);
    const hasPdf = Boolean(previewLesson.file);
    const pdfName = previewLesson.file ? extractFileName(previewLesson.file) : "";

    return (
      <div className="space-y-4">
        <Typography.Title level={4} className="!mb-2">
          {previewLesson.name ?? previewLesson.title ?? "Lesson"}
        </Typography.Title>
        <div className="rounded-xl overflow-hidden bg-black">
          {loadingPreviewDetail ? (
            <div className="text-white text-center py-16">Đang tải nội dung...</div>
          ) : embedUrl ? (
            <iframe
              title={previewLesson.name ?? previewLesson.title ?? "Lesson preview"}
              src={embedUrl}
              className="w-full aspect-video"
              allowFullScreen
            />
          ) : (
            <div className="text-white text-center py-16">
              Không có video để hiển thị.
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
          <Typography.Title level={5}>Tài liệu PDF</Typography.Title>
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
                  message.error("Không thể mở tài liệu.");
                } finally {
                  setPdfOpening(false);
                }
              }}
            >
              Xem {pdfName}
            </Button>
          ) : (
            <Typography.Paragraph className="text-gray-500 mb-0">
              Chưa có tài liệu PDF.
            </Typography.Paragraph>
          )}
        </div>
      </div>
    );
  };
  const [form] = Form.useForm<LessonFormFields>();
  const canCreate = useMemo(() => Boolean(material), [material]);

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
      url: nextValues?.url ?? "",
      file: nextValues?.file ?? [],
    };
    form.setFieldsValue(initialValues);
    setFileList(initialValues.file ?? []);
  };

  const openCreateModal = () => {
    if (!material) {
      return;
    }
    resetFormState({
      name: `Lesson ${lessons.length + 1}`,
      file: [],
      url: "",
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
      resetFormState({
        name: detail.name ?? detail.title ?? "",
        description: detail.description ?? "",
        url: detail.url ?? "",
        file: initialFileList,
      });
    } catch (error) {
      console.error("Fetch lesson detail error:", error);
      message.error("Không thể tải thông tin bài học. Vui lòng thử lại.");
      const fallbackFileList = buildInitialUploadList(lesson.file);
      resetFormState({
        name: lesson.name ?? lesson.title ?? "",
        description: lesson.description ?? "",
        url: lesson.url ?? "",
        file: fallbackFileList,
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
    if (latestList.length > 0 || (form.getFieldValue("url") as string)?.trim()) {
      form.setFields([
        { name: "file", errors: [] },
        { name: "url", errors: [] },
      ]);
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
        url: values.url?.trim() ? values.url.trim() : undefined,
      };

      // Kiểm tra ít nhất một trong hai (file hoặc url) phải có
      if (!payload.file && !payload.url) {
        form.setFields([
          { name: "file", errors: ["Vui lòng tải video hoặc chọn tài liệu PDF"] },
          { name: "url", errors: ["Vui lòng tải video hoặc chọn tài liệu PDF"] },
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
            dataSource={lessons}
            renderItem={(lesson) => {
              const secondary = lesson.url ?? lesson.file ?? lesson.description;
              return (
                <List.Item className="!flex !items-center">
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium">{getLessonTitle(lesson)}</span>
                      {secondary && (
                        <span className="text-gray-500 text-xs break-all">{secondary}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Tooltip title="Xem bài học">
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => openPreviewModal(lesson)}
                          aria-label="Xem bài học"
                        />
                      </Tooltip>
                      {onUpdateLesson ? (
                        <Tooltip title="Sửa bài học">
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => openEditModal(lesson)}
                            aria-label="Sửa bài học"
                          />
                        </Tooltip>
                      ) : null}
                      {onDeleteLesson ? (
                        <Popconfirm
                          title="Xóa bài học?"
                          description="Hành động này không thể hoàn tác."
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true, loading: deletingLessonId === lesson.id }}
                          onConfirm={() => handleDelete(lesson.id)}
                        >
                          <Tooltip title="Xóa bài học">
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              loading={deletingLessonId === lesson.id}
                              aria-label="Xóa bài học"
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
            rules={[{ required: true, message: "Vui lòng nhập tên bài học" }]}
          >
            <Input placeholder="Nhập tên bài học" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea placeholder="Nhập mô tả" rows={3} />
          </Form.Item>

          <Form.Item
            label="Video URL"
            name="url"
            help="Nhập đường dẫn video (YouTube, Vimeo, ...)"
          >
            <Input
              placeholder="https://..."
              onChange={(e) => {
                if (e.target.value) {
                  form.setFields([
                    { name: "file", errors: [] },
                    { name: "url", errors: [] },
                  ]);
                }
              }}
            />
          </Form.Item>

          <Form.Item
            label="Tài liệu PDF"
            name="file"
            help="Tải lên file PDF ghi chú quan trọng"
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
              <Button icon={<UploadOutlined />}>Chọn PDF</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={previewLesson ? previewLesson.name ?? previewLesson.title : "Lesson preview"}
        open={isPreviewOpen}
        footer={[
          <Button key="close" onClick={closePreviewModal}>
            Close
          </Button>,
        ]}
        onCancel={closePreviewModal}
        width={900}
        destroyOnClose
      >
        {renderPreviewContent()}
      </Modal>
    </Modal>
  );
};

export default LessonModal;
