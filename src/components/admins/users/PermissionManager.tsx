import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Tooltip,
  Card,
  Typography,
  Popconfirm,
  Space,
  Select,
  Tabs,
  Tag,
  Checkbox,
  Divider,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { RefreshCcw, Trash2, Shield, Users } from 'lucide-react';
import { usePermissions } from '~/hooks/usePermissions';
import type { Permission } from '~/types/permission';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const PermissionManager: React.FC = () => {
  const {
    permissions,
    rolePermissions,
    loading,
    error,
    fetchPermissions,
    createPermission,
    deletePermission,
    fetchPermissionsForRole,
    assignPermissions,
    revokePermissions,
  } = usePermissions();

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Mock roles - in real app this would come from API
  const mockRoles = [
    { name: 'ADMIN', description: 'Administrator with full access' },
    { name: 'TEACHER', description: 'Teacher role for educators' },
    { name: 'STUDENT', description: 'Standard user role' },
  ];

  useEffect(() => {
    if (selectedRole) {
      fetchPermissionsForRole(selectedRole);
    }
  }, [selectedRole, fetchPermissionsForRole]);

  const filteredPermissions = permissions.filter(
    (permission) =>
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePermission = async (values: { name: string; description: string }) => {
    try {
      await createPermission(values);
      setIsCreateModalVisible(false);
      createForm.resetFields();
    } catch (error) {
      // Error is handled in the hook
      console.error('Create permission error:', error);
    }
  };

  const handleDeletePermission = async (permissionName: string) => {
    try {
      await deletePermission(permissionName);
    } catch (error) {
      // Error is handled in the hook
      console.error('Delete permission error:', error);
    }
  };

  const columns: ColumnsType<Permission> = [
    {
      title: 'Tên quyền',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span className="font-medium text-gray-800">{name}</span>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <span className="text-gray-600">{description}</span>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_: unknown, record: Permission) => (
        <Popconfirm
          title="Xóa quyền?"
          description={`Bạn có chắc muốn xóa quyền "${record.name}"?`}
          onConfirm={() => handleDeletePermission(record.name)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <button className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition">
            <Trash2 className="w-4 h-4" />
          </button>
        </Popconfirm>
      ),
    },
  ];

  const handleRoleChange = (roleName: string) => {
    setSelectedRole(roleName);
    setSelectedPermissions([]);
  };

  const handlePermissionChange = (checkedValues: string[]) => {
    setSelectedPermissions(checkedValues);
  };

  const handleAssignPermissions = async () => {
    if (!selectedRole || selectedPermissions.length === 0) return;

    try {
      await assignPermissions(selectedRole, { permissionNames: selectedPermissions });
      setSelectedPermissions([]);
    } catch (error) {
      console.error('Assign permissions error:', error);
    }
  };

  const handleRevokePermissions = async () => {
    if (!selectedRole || selectedPermissions.length === 0) return;

    try {
      await revokePermissions(selectedRole, { permissionNames: selectedPermissions });
      setSelectedPermissions([]);
    } catch (error) {
      console.error('Revoke permissions error:', error);
    }
  };

  const permissionsTab = (
    <Card className="shadow-sm border-0">
      <div className="mb-4">
        <div className="mb-3">
          <Title level={3} className="mb-1 text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Quản lý quyền
          </Title>
          <p className="text-gray-600 text-sm">
            Quản lý danh sách các quyền trong hệ thống
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <Input.Search
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            className="max-w-md"
            prefix={<SearchOutlined className="text-gray-400" />}
          />
          <Space>
            <Tooltip title="Làm mới">
              <Button
                icon={<RefreshCcw className="w-4 h-4" />}
                onClick={fetchPermissions}
                className="border-gray-200"
              >
                Làm mới
              </Button>
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
              className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm px-4 h-9"
            >
              Thêm quyền
            </Button>
          </Space>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <Table
          rowKey="name"
          columns={columns}
          dataSource={filteredPermissions}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / ${total} quyền`,
            size: "small",
          }}
          rowClassName="hover:bg-gray-50 transition-colors duration-200"
          className="overflow-x-auto"
          scroll={{ x: 600 }}
          size="middle"
        />
      </div>
    </Card>
  );

  const rolePermissionsTab = (
    <Card className="shadow-sm border-0">
      <div className="mb-4">
        <div className="mb-3">
          <Title level={3} className="mb-1 text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Quyền theo vai trò
          </Title>
          <p className="text-gray-600 text-sm">
            Gán và thu hồi quyền cho các vai trò trong hệ thống
          </p>
        </div>

        <div className="mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn vai trò
              </label>
              <Select
                placeholder="Chọn vai trò để xem quyền"
                value={selectedRole}
                onChange={handleRoleChange}
                className="w-full"
                size="large"
              >
                {mockRoles.map((role) => (
                  <Select.Option key={role.name} value={role.name}>
                    <div>
                      <div className="font-medium">{role.name}</div>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </div>

            {selectedRole && (
              <div className="flex items-end gap-2">
                <Button
                  type="primary"
                  onClick={handleAssignPermissions}
                  disabled={selectedPermissions.length === 0}
                  loading={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Gán quyền
                </Button>
                <Button
                  danger
                  onClick={handleRevokePermissions}
                  disabled={selectedPermissions.length === 0}
                  loading={loading}
                >
                  Thu hồi quyền
                </Button>
              </div>
            )}
          </div>
        </div>

        {selectedRole && (
          <>
            <Divider />
            <div className="mb-4">
              <Title level={4} className="mb-3">
                Quyền hiện tại của vai trò: <Tag color="blue">{selectedRole}</Tag>
              </Title>
              <div className="bg-gray-50 p-4 rounded-lg">
                {rolePermissions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {rolePermissions.map((permission) => (
                      <Tag key={permission.name} color="green">
                        {permission.name}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Vai trò này chưa có quyền nào.</p>
                )}
              </div>
            </div>

            <Divider />
            <div className="mb-4">
              <Title level={4} className="mb-3">
                Chọn quyền để gán/thu hồi
              </Title>
              <Checkbox.Group
                value={selectedPermissions}
                onChange={handlePermissionChange}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {permissions.map((permission) => (
                    <div key={permission.name} className="flex items-start gap-2 p-2 border rounded">
                      <Checkbox value={permission.name} />
                      <div>
                        <div className="font-medium text-sm">{permission.name}</div>
                        <div className="text-xs text-gray-500">{permission.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Checkbox.Group>
            </div>
          </>
        )}
      </div>
    </Card>
  );

  return (
    <>
      <Tabs
        defaultActiveKey="permissions"
        type="card"
        size="large"
        items={[
          {
            key: "permissions",
            label: (
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Quyền
              </span>
            ),
            children: permissionsTab,
          },
          {
            key: "role-permissions",
            label: (
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Quyền theo vai trò
              </span>
            ),
            children: rolePermissionsTab,
          },
        ]}
      />

      {/* Create Permission Modal */}
      <Modal
        title="Thêm quyền mới"
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreatePermission}
          className="mt-4"
        >
          <Form.Item
            label="Tên quyền"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên quyền' },
              { min: 2, message: 'Tên quyền phải có ít nhất 2 ký tự' },
            ]}
          >
            <Input placeholder="Nhập tên quyền" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả' },
              { min: 5, message: 'Mô tả phải có ít nhất 5 ký tự' },
            ]}
          >
            <Input.TextArea
              placeholder="Nhập mô tả cho quyền"
              rows={3}
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setIsCreateModalVisible(false);
                  createForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Thêm quyền
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PermissionManager;
