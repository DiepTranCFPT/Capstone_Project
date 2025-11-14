import React, { useMemo, useState } from "react";
import { Empty, List, Modal, Spin, Typography, Button, Form, Input, Popconfirm, Tooltip, message } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import LessonService from "~/services/LessonService";
import type { LearningMaterial } from "~/types/learningMaterial";
import type { Lesson } from "~/types/lesson";

export interface LessonFormValues {
  name: string;
  file?: string;
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
  const openPreviewModal = (lesson: Lesson) => {
    setPreviewLesson(lesson);
    setIsPreviewOpen(true);
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
    return (
      <div className="space-y-4">
        <Typography.Title level={4} className="!mb-2">
          {previewLesson.name ?? previewLesson.title ?? "Lesson"}
        </Typography.Title>
        <div className="rounded-xl overflow-hidden bg-black">
          {embedUrl ? (
            <iframe
              title={previewLesson.name ?? previewLesson.title ?? "Lesson preview"}
              src={embedUrl}
              className="w-full aspect-video"
              allowFullScreen
            />
          ) : (
            <div className="text-white text-center py-16">
              Không có URL để hiển thị.
            </div>
          )}
        </div>
        {previewLesson.description && (
          <div>
            <Typography.Title level={5}>Description</Typography.Title>
            <Typography.Paragraph>{previewLesson.description}</Typography.Paragraph>
          </div>
        )}
      </div>
    );
  };
  const [form] = Form.useForm<LessonFormValues>();
  const canCreate = useMemo(() => Boolean(material), [material]);

  const openCreateModal = () => {
    if (!material) {
      return;
    }
    form.resetFields();
    form.setFieldsValue({
      name: `Lesson ${lessons.length + 1}`,
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
      form.setFieldsValue({
        name: detail.name ?? detail.title ?? "",
        description: detail.description ?? "",
        file: detail.file ?? "",
        url: detail.url ?? "",
      });
    } catch (error) {
      console.error("Fetch lesson detail error:", error);
      message.error("Không thể tải thông tin bài học. Vui lòng thử lại.");
      form.setFieldsValue({
        name: lesson.name ?? lesson.title ?? "",
        description: lesson.description ?? "",
        file: lesson.file ?? "",
        url: lesson.url ?? "",
      });
    } finally {
      setLoadingLessonDetail(false);
    }
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
      // Kiểm tra ít nhất một trong hai (file hoặc url) phải có
      if (!values.file && !values.url) {
        form.setFields([
          { name: 'file', errors: ['Vui lòng nhập file hoặc URL'] },
          { name: 'url', errors: ['Vui lòng nhập file hoặc URL'] },
        ]);
        return;
      }
      setSubmitting(true);
      if (formMode === "create" && onCreateLesson) {
        await onCreateLesson(values);
      }
      if (formMode === "edit" && onUpdateLesson && editingLesson) {
        await onUpdateLesson(editingLesson.id, values);
      }
      setIsFormOpen(false);
      setEditingLesson(null);
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
        onCancel={() => {
          setIsFormOpen(false);
          setEditingLesson(null);
        }}
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
            label="File"
            name="file"
            help="Nhập file hoặc URL (ít nhất một trong hai)"
            dependencies={['url']}
          >
            <Input 
              placeholder="Nhập thông tin file" 
              onChange={(e) => {
                const value = e.target.value;
                const urlValue = form.getFieldValue('url');
                if (value || urlValue) {
                  form.setFields([
                    { name: 'file', errors: [] },
                    { name: 'url', errors: [] },
                  ]);
                }
              }}
            />
          </Form.Item>

          <Form.Item
            label="URL"
            name="url"
            help="Nhập file hoặc URL (ít nhất một trong hai)"
            dependencies={['file']}
          >
            <Input 
              placeholder="Nhập URL" 
              type="url"
              onChange={(e) => {
                const value = e.target.value;
                const fileValue = form.getFieldValue('file');
                if (value || fileValue) {
                  form.setFields([
                    { name: 'file', errors: [] },
                    { name: 'url', errors: [] },
                  ]);
                }
              }}
            />
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
