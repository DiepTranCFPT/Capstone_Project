import React, { useEffect, useState } from 'react';
import { Typography, Modal } from 'antd';
import { useParent } from '~/hooks/useParent';
import type { ChildInfo } from '~/types/parent';
import ChildrenList from '~/components/parents/ChildrenList';
import AddCreditsModal from '~/components/parents/AddCreditsModal';

const { Text, Title } = Typography;

const ChildrenListPage: React.FC = () => {
  const { children, loading, fetchChildren, unlinkStudent } = useParent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildInfo | null>(null);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleUnlink = async (email: string, name: string) => {
    Modal.confirm({
      title: 'Confirm Unlink',
      content: `Are you sure you want to unlink from student ${name}?`,
      okText: 'Unlink',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        const success = await unlinkStudent(email);
        if (success) {
          fetchChildren();
        }
      },
    });
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
    </div>
  );
};

export default ChildrenListPage;

