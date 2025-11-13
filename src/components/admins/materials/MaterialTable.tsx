import React from "react";
import { Table, Tag, Button, Space, Tooltip, Popconfirm } from "antd";
import { EyeOutlined, DeleteOutlined, PlusCircleOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { LearningMaterial } from "~/types/learningMaterial";

interface Props {
  data: LearningMaterial[];
  loading: boolean;
  total: number;
  pageNo: number;
  pageSize: number;
  setPageNo: (page: number) => void;
  setPageSize: (size: number) => void;
  onDelete: (id: string) => void;
  onAddLesson?: (material: LearningMaterial) => void;
  onEdit?: (material: LearningMaterial) => void;
}

const MaterialTable: React.FC<Props> = ({
  data,
  loading,
  total,
  pageNo,
  pageSize,
  setPageNo,
  setPageSize,
  onDelete,
  onAddLesson,
  onEdit,
}) => {
  const renderTypeTag = (typeName: string) => {
    const normalized = typeName?.toLowerCase() ?? "";
    const isFree = normalized.includes("free");
    const isToken = normalized.includes("token");

    if (isFree) {
      return <Tag color="green">{typeName}</Tag>;
    }

    if (isToken) {
      return <Tag color="orange">{typeName}</Tag>;
    }

    return <Tag>{typeName}</Tag>;
  };

  const columns: ColumnsType<LearningMaterial> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Type",
      dataIndex: "typeName",
      key: "typeName",
      render: (typeName: string) => renderTypeTag(typeName),
    },
    {
      title: "Subject",
      dataIndex: "subjectName",
      key: "subjectName",
    },
    {
      title: "Author",
      dataIndex: "authorName",
      key: "authorName",
    },
    {
      title: "Status",
      key: "isPublic",
      render: (_, record) => (
        <Tag color={record.isPublic ? "green" : "red"}>
          {record.isPublic ? "Public" : "Private"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              href={record.contentUrl}
              target="_blank"
              className="bg-green-500 hover:bg-green-600 border-0"
            />
          </Tooltip>
          <Tooltip title="Add Lesson">
            <Button
              icon={<PlusCircleOutlined />}
              className="text-blue-600 border-blue-600 hover:text-white hover:bg-blue-600"
              onClick={() => onAddLesson?.(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit?.(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Confirm Deletion"
              description="Are you sure you want to delete this material?"
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(record.id)}
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      loading={loading}
      dataSource={data}
      columns={columns}
      pagination={{
        current: pageNo + 1,
        pageSize,
        total,
        showSizeChanger: true,
        onChange: (page, size) => {
          setPageNo(page - 1);
          setPageSize(size);
        },
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} materials`,
      }}
      rowClassName="hover:bg-gray-50 transition-colors duration-200"
      className="bg-white rounded-lg border border-gray-200 overflow-x-auto"
      scroll={{ x: 800 }}
      size="middle"
    />
  );
};

export default MaterialTable;
