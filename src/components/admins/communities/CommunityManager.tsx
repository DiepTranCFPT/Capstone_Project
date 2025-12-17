import React, { useState } from "react";
import { Button, Input, Space, Typography, Card, Tooltip } from "antd";
import { SearchOutlined, ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import type { Community } from "~/types/community";
import { useCommunityManager } from "~/hooks/useCommunityManager";
import CommunityTable from "./CommunityTable";
import {
  EditCommunityModal,
  CreateCommunityModal,
  DeleteCommunityModal,
} from "./CommunityModals";

const { Title } = Typography;

const CommunityManager: React.FC = () => {
  const {
    loading,
    searchText,
    filteredData,
    fetchCommunities,
    handleSearch,
  } = useCommunityManager();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCommunityId, setDeletingCommunityId] = useState<string | number | null>(null);

  const handleAddCommunity = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditCommunity = (record: Community) => {
    setEditingCommunity(record);
    setIsEditModalOpen(true);
  };

  const handleDeleteCommunity = (id: string | number) => {
    setDeletingCommunityId(id);
    setIsDeleteModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchCommunities();
  };

  const handleCreateSuccess = () => {
    fetchCommunities();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setDeletingCommunityId(null);
    fetchCommunities();
  };

  return (
    <div className="p-4">
      <Card className="shadow-sm border-0">
        <div className="mb-4">
          <div className="mb-3">
            <Title level={3} className="mb-1 text-gray-900">
              Community Management
            </Title>
            <p className="text-gray-600 text-sm">
              Manage communities in the system
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Input.Search
              placeholder="Search by name or description..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              onSearch={handleSearch}
              allowClear
              className="max-w-md"
              prefix={<SearchOutlined className="text-gray-400" />}
            />
            <Space>
              <Tooltip title="Refresh">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchCommunities}
                  className="border-gray-200"
                >
                  Refresh
                </Button>
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddCommunity}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Community
              </Button>
            </Space>
          </div>
        </div>

        <CommunityTable
          dataSource={filteredData}
          loading={loading}
          onEdit={handleEditCommunity}
          onDelete={handleDeleteCommunity}
        />
      </Card>

      <EditCommunityModal
        open={isEditModalOpen}
        community={editingCommunity}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingCommunity(null);
        }}
        onSuccess={handleEditSuccess}
      />

      <CreateCommunityModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <DeleteCommunityModal
        open={isDeleteModalOpen}
        communityId={deletingCommunityId}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeletingCommunityId(null);
        }}
        onConfirm={handleDeleteSuccess}
      />
    </div>
  );
};

export default CommunityManager;

