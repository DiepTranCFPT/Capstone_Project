import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Checkbox,
  Card,
  Typography,
  Space,
  Tag,
  Divider,
  Spin,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Shield, CheckCircle } from 'lucide-react';
import { usePermissions } from '~/hooks/usePermissions';
import type { User } from '~/types/user';

const { Title, Text } = Typography;

interface UserPermissionModalProps {
  visible: boolean;
  user: User | null;
  onCancel: () => void;
}

const UserPermissionModal: React.FC<UserPermissionModalProps> = ({
  visible,
  user,
  onCancel,
}) => {
  const {
    permissions,
    userPermissions,
    loading,
    fetchPermissionsForUser,
    assignPermissionsToUser,
    revokePermissionsFromUser,
  } = usePermissions();

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoadingUserPermissions, setIsLoadingUserPermissions] = useState(false);

  useEffect(() => {
    if (visible && user) {
      loadUserPermissions();
    }
  }, [visible, user]);

  const loadUserPermissions = async () => {
    if (!user) return;

    setIsLoadingUserPermissions(true);
    try {
      await fetchPermissionsForUser(user.id);
    } catch (error) {
      console.error('Error loading user permissions:', error);
    } finally {
      setIsLoadingUserPermissions(false);
    }
  };

  const handlePermissionChange = (checkedValues: string[]) => {
    setSelectedPermissions(checkedValues);
  };

  const handleAssignPermissions = async () => {
    if (!user || selectedPermissions.length === 0) return;

    try {
      await assignPermissionsToUser(user.id, selectedPermissions);
      setSelectedPermissions([]);
      // Reload user permissions
      await loadUserPermissions();
    } catch (error) {
      console.error('Error assigning permissions:', error);
    }
  };

  const handleRevokePermissions = async () => {
    if (!user || selectedPermissions.length === 0) return;

    try {
      await revokePermissionsFromUser(user.id, selectedPermissions);
      setSelectedPermissions([]);
      // Reload user permissions
      await loadUserPermissions();
    } catch (error) {
      console.error('Error revoking permissions:', error);
    }
  };

  const handleCancel = () => {
    setSelectedPermissions([]);
    onCancel();
  };

  // All permissions are now shown in the list

  if (!user) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>Quản lý quyền của {user.firstName} {user.lastName}</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <div className="py-4">
        {/* Current User Permissions */}
        <Card size="small" className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="text-green-500" />
            <Title level={5} className="mb-0">
              Quyền hiện tại
            </Title>
          </div>
          {isLoadingUserPermissions ? (
            <div className="flex justify-center py-4">
              <Spin size="small" />
            </div>
          ) : userPermissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userPermissions.map((permission) => (
                <Tag key={permission.name} color="green" className="mb-1">
                  <Shield className="w-3 h-3 mr-1" />
                  {permission.name}
                </Tag>
              ))}
            </div>
          ) : (
            <Text type="secondary">Người dùng chưa có quyền nào.</Text>
          )}
        </Card>

        <Divider />

        {/* Permission Management */}
        <div className="mb-4">
          <Title level={5} className="mb-3 flex items-center gap-2">
            <Shield />
            Quản lý quyền
          </Title>

          <div className="mb-4">
            <Text strong>Chọn quyền để gán/thu hồi:</Text>
            <div className="mt-2">
              <Checkbox.Group
                value={selectedPermissions}
                onChange={handlePermissionChange}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {permissions.map((permission) => {
                    const isAssigned = userPermissions.some((userPerm) => userPerm.name === permission.name);
                    return (
                      <div
                        key={permission.name}
                        className={`flex items-start gap-2 p-2 border rounded ${
                          isAssigned ? 'border-green-300 bg-green-50' : 'border-gray-300'
                        }`}
                      >
                        <Checkbox value={permission.name} />
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            {permission.name}
                            {isAssigned && (
                              <Tag color="green" className="text-xs">
                                Đã gán
                              </Tag>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{permission.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Checkbox.Group>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="primary"
              onClick={handleAssignPermissions}
              disabled={selectedPermissions.length === 0}
              loading={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              Gán quyền ({selectedPermissions.length})
            </Button>
            <Button
              danger
              onClick={handleRevokePermissions}
              disabled={selectedPermissions.length === 0}
              loading={loading}
            >
              Thu hồi quyền ({selectedPermissions.length})
            </Button>
          </div>
        </div>

        <Divider />

        {/* Action Buttons */}
        <div className="flex justify-end">
          <Space>
            <Button onClick={handleCancel}>Đóng</Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default UserPermissionModal;
