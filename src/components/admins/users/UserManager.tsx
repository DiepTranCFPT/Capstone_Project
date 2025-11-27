import React, { useState } from "react";
import {
  Table,
  Button,
  Tooltip,
  Avatar,
  Input,
  Space,
  Tag,
  Typography,
  Card,
  Popconfirm,
  Tabs,
  message,
} from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { RefreshCcw, Trash2, Shield } from "lucide-react";
import { useAdminUsers } from "~/hooks/useAdminUsers";
import UserService from "~/services/userService";
import type { User } from "~/types/user";
import type { ColumnsType } from "antd/es/table";
import UserFilter from "./UserFilter";
import PermissionManager from "./PermissionManager";
import UserPermissionModal from "./UserPermissionModal";

const { Title } = Typography;

const UserManagement: React.FC = () => {
  const {
    users,
    loading,
    total,
    pageNo,
    pageSize,
    keyword,
    role,
    isVerified,
    isLocked,
    setPageNo,
    setKeyword,
    setRole,
    setIsVerified,
    setIsLocked,
    fetchUsers,
  } = useAdminUsers();

  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await UserService.deleteUser(id);
      if (res && res.code === 1000) {
        message.success("Đã xóa người dùng");
        fetchUsers();
      } else {
        message.error(res?.message || "Không thể xóa người dùng");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      message.error("Xóa người dùng thất bại");
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "Người dùng",
      key: "name",
      render: (_: unknown, record: User) => (
        <div className="flex items-center gap-3">
          {record.imgUrl ? (
            <Avatar src={record.imgUrl} size={40} />
          ) : (
            <Avatar size={40} className="bg-gray-200 text-gray-600">
              {record.firstName?.[0] || "?"}
            </Avatar>
          )}
          <div>
            <div className="font-medium text-gray-800">{`${record.firstName} ${record.lastName}`}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "roles",
      key: "roles",
      render: (roles: unknown) => {
        if (!Array.isArray(roles) || roles.length === 0) {
          return <span className="text-gray-400">-</span>;
        }
        return (
          <>
            {roles.map((role: string) => (
              <Tag color="blue" key={role} className="capitalize">
                {role}
              </Tag>
            ))}
          </>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      align: "center",
      render: (_: unknown, record: User & { active?: boolean }) => {
        const active = !!record.active;
        return (
          <Tag
            color={active ? "success" : "error"}
            className="px-3 py-1 rounded-full font-medium"
          >
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${active ? "bg-green-400" : "bg-red-400"
                  }`}
              />
              {active ? "Hoạt động" : "Ngưng hoạt động"}
            </div>
          </Tag>
        );
      },
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      key: "dob",
      render: (dob: string) => (dob ? new Date(dob).toLocaleDateString() : "-"),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Tooltip title="Quản lý quyền">
            <button
              className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition"
              onClick={() => {
                setSelectedUser(record);
                setPermissionModalVisible(true);
              }}
            >
              <Shield className="w-4 h-4" />
            </button>
          </Tooltip>
          <Popconfirm
            title="Xóa người dùng?"
            description={`Bạn có chắc muốn xóa ${record.firstName} ${record.lastName}?`}
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <button className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition">
              <Trash2 className="w-4 h-4" />
            </button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const userManagementTab = (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="shadow-sm border-0">
        <div className="mb-4">
          <div className="mb-3">
            <Title level={3} className="mb-1 text-gray-900">
              Quản lý người dùng
            </Title>
            <p className="text-gray-600 text-sm">
              Quản lý danh sách người dùng trong hệ thống
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Input.Search
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={() => fetchUsers()}
              allowClear
              className="max-w-md"
              prefix={<SearchOutlined className="text-gray-400" />}
            />
            <Space>
              <Tooltip title="Làm mới">
                <Button
                  icon={<RefreshCcw className="w-4 h-4" />}
                  onClick={fetchUsers}
                  className="border-gray-200"
                >
                  Làm mới
                </Button>
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm px-4 h-9"
              >
                Thêm người dùng
              </Button>
            </Space>
          </div>
        </div>

        <UserFilter
          keyword={keyword}
          role={role}
          isVerified={isVerified}
          isLocked={isLocked}
          setKeyword={setKeyword}
          setRole={setRole}
          setIsVerified={setIsVerified}
          setIsLocked={setIsLocked}
          onRefresh={fetchUsers}
          total={total}
        />

        <div className="bg-white rounded-lg border border-gray-200">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={users}
            loading={loading}
            pagination={{
              current: pageNo + 1, // API is 0-indexed, Antd is 1-indexed
              pageSize: pageSize,
              total: total,
              onChange: (p) => setPageNo(p - 1),
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} / ${total} người dùng`,
              size: "small",
            }}
            rowClassName="hover:bg-gray-50 transition-colors duration-200"
            className="overflow-x-auto"
            scroll={{ x: 800 }}
            size="middle"
          />
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        <div className="mb-6">
          <Title level={2} className="mb-1 text-gray-900">
            Quản lý hệ thống
          </Title>
          <p className="text-gray-600 text-sm">
            Quản lý người dùng và quyền trong hệ thống
          </p>
        </div>

        <Tabs
          defaultActiveKey="users"
          type="card"
          size="large"
          items={[
            {
              key: "users",
              label: "Người dùng",
              children: userManagementTab,
            },
            {
              key: "permissions",
              label: "Quyền",
              children: <PermissionManager />,
            },
          ]}
        />

        {/* User Permission Modal */}
        <UserPermissionModal
          visible={permissionModalVisible}
          user={selectedUser}
          onCancel={() => {
            setPermissionModalVisible(false);
            setSelectedUser(null);
          }}
        />
      </div>
    </div>
  );
};

export default UserManagement;
