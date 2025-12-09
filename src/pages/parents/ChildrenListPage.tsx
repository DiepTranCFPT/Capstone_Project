import React, { useEffect, useState } from 'react';
import { Typography, Modal, Button } from 'antd';
import { useParent } from '~/hooks/useParent';
import type { ChildInfo } from '~/types/parent';
import ChildrenList from '~/components/parents/ChildrenList';
import AddCreditsModal from '~/components/parents/AddCreditsModal';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const ChildrenListPage: React.FC = () => {
  const { children, loading, fetchChildren, unlinkStudent } = useParent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildInfo | null>(null);

  // State for unlink confirmation modal
  const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<{ email: string; name: string } | null>(null);
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleUnlink = (email: string, name: string) => {
    setUnlinkTarget({ email, name });
    setIsUnlinkModalOpen(true);
  };

  const handleConfirmUnlink = async () => {
    if (!unlinkTarget) return;

    setUnlinkLoading(true);
    const success = await unlinkStudent(unlinkTarget.email);
    setUnlinkLoading(false);

    if (success) {
      fetchChildren();
    }

    setIsUnlinkModalOpen(false);
    setUnlinkTarget(null);
  };

  const handleCancelUnlink = () => {
    setIsUnlinkModalOpen(false);
    setUnlinkTarget(null);
  };

  const handleAddCredits = (child: ChildInfo) => {
    setSelectedChild(child);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedChild(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>List of Children</Title>
        <Text type="secondary">Manage and view your linked student accounts</Text>
      </div>

      <ChildrenList
        children={children}
        loading={loading}
        onUnlink={handleUnlink}
        onAddCredits={handleAddCredits}
      />

      <AddCreditsModal
        open={isModalOpen}
        onCancel={handleCloseModal}
        child={selectedChild}
      />

      {/* Unlink Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined className="text-orange-500 text-xl" />
            <span>Confirm Unlink</span>
          </div>
        }
        open={isUnlinkModalOpen}
        onCancel={handleCancelUnlink}
        footer={[
          <Button key="cancel" onClick={handleCancelUnlink}>
            Cancel
          </Button>,
          <Button
            key="unlink"
            type="primary"
            danger
            loading={unlinkLoading}
            onClick={handleConfirmUnlink}
          >
            Unlink
          </Button>,
        ]}
      >
        <p>Are you sure you want to unlink from student <strong>{unlinkTarget?.name}</strong>?</p>
      </Modal>
    </div>
  );
};

export default ChildrenListPage;

