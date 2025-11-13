import React, { useMemo, useState } from "react";
import { Empty, List, Modal, Spin, Typography, Button, Form, Input } from "antd";
import type { LearningMaterial } from "~/types/learningMaterial";
import type { Lesson } from "~/types/lesson";

export interface LessonFormValues {
  name: string;
  file: string;
  url: string;
}

interface LessonModalProps {
  open: boolean;
  material: LearningMaterial | null;
  lessons?: Lesson[];
  loadingLessons?: boolean;
  onCancel: () => void;
  onCreateLesson?: (values: LessonFormValues) => Promise<void> | void;
  creating?: boolean;
}

const LessonModal: React.FC<LessonModalProps> = ({
  open,
  material,
  lessons = [],
  loadingLessons = false,
  onCancel,
  onCreateLesson,
  creating = false,
}) => {
  const getLessonTitle = (lesson: Lesson): string => {
    if (lesson.name) return lesson.name;
    if (lesson.title) return lesson.title;
    return lesson.id;
  };

  const [isCreateOpen, setIsCreateOpen] = useState(false);
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
    setIsCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!onCreateLesson) {
      return;
    }
    try {
      const values = await form.validateFields();
      await onCreateLesson(values);
      setIsCreateOpen(false);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "errorFields" in error) {
        return;
      }
      console.error("Lesson creation error:", error);
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
                <List.Item>
                  <div className="flex flex-col">
                    <span className="font-medium">{getLessonTitle(lesson)}</span>
                    {secondary && <span className="text-gray-500 text-xs">{secondary}</span>}
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
        title="Add Lesson"
        open={isCreateOpen}
        onOk={handleCreate}
        confirmLoading={creating}
        onCancel={() => setIsCreateOpen(false)}
        okText="Create"
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
            label="File"
            name="file"
            rules={[{ required: true, message: "Vui lòng nhập thông tin file" }]}
          >
            <Input placeholder="Nhập thông tin file" />
          </Form.Item>

          <Form.Item
            label="URL"
            name="url"
            rules={[{ required: true, message: "Vui lòng nhập URL" }]}
          >
            <Input placeholder="Nhập URL" type="url" />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default LessonModal;
