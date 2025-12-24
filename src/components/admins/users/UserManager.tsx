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
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  RefreshCcw,
  Trash2,
  // Shield
} from "lucide-react";
import { useAdminUsers } from "~/hooks/useAdminUsers";
import UserService from "~/services/userService";
import type { User } from "~/types/user";
import type { ColumnsType } from "antd/es/table";
import UserFilter from "./UserFilter";
// import PermissionManager from "./PermissionManager";
import UserPermissionModal from "./UserPermissionModal";
import { toast } from "~/components/common/Toast";

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
        toast.success("Deleted user successfully");
        fetchUsers();
      } else {
        toast.error(res?.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "User",
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
      title: "Role",
      dataIndex: "roles",
      key: "roles",
      render: (roles: unknown) => {
        if (!Array.isArray(roles) || roles.length === 0) {
          return <span className="text-gray-400">-</span>;
        }

        const ROLE_BADGES: Record<
          string,
          { label: string; dotColor: string; pillClass: string }
        > = {
          ADMIN: {
            label: "Admin",
            dotColor: "bg-red-500",
            pillClass:
              "border-red-500/50 text-red-300 bg-red-500/10",
          },
          TEACHER: {
            label: "Teacher",
            dotColor: "bg-blue-500",
            pillClass:
              "border-blue-500/50 text-blue-300 bg-blue-500/10",
          },
          PARENT: {
            label: "Parent",
            dotColor: "bg-emerald-400",
            pillClass:
              "border-emerald-400/50 text-emerald-200 bg-emerald-500/10",
          },
          STUDENT: {
            label: "Student",
            dotColor: "bg-purple-400",
            pillClass:
              "border-purple-400/50 text-purple-200 bg-purple-500/10",
          },
        };

        return (
          <div className="flex flex-wrap gap-1.5">
            {roles.map((role: string) => {
              const upper = role.toUpperCase();
              const cfg =
                ROLE_BADGES[upper] ?? ({
                  label: upper,
                  dotColor: "bg-gray-400",
                  pillClass:
                    "border-gray-500/40 text-gray-200 bg-gray-500/10",
                } satisfies (typeof ROLE_BADGES)[string]);

              return (
                <span
                  key={role}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.pillClass}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1 ${cfg.dotColor}`}
                  />
                  {cfg.label}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      align: "center",
      render: (_: unknown, record: User & { active?: boolean }) => {
        const active = !!record.active;
        return (
          <Tag
            color={active ? "success" : "success"}
            className="px-3 py-1 rounded-full font-medium"
          >
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${active ? "bg-green-400" : "bg-green-400"
                  }`}
              />
              {active ? "Active" : "Active"}
            </div>
          </Tag>
        );
      },
    },
    {
      title: "Birthday",
      dataIndex: "dob",
      key: "dob",
      render: (dob: string) => (dob ? new Date(dob).toLocaleDateString() : "-"),
    },
    {
      title: "Action",
      key: "actions",
      align: "center",
      render: (_: unknown, record: User) => (
        <Space size="small">
          {/* <Tooltip title="Manage Permissions">
            <button
              className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition"
              onClick={() => {
                setSelectedUser(record);
                setPermissionModalVisible(true);
              }}
            >
              <Shield className="w-4 h-4" />
            </button>
          </Tooltip> */}
          <Popconfirm
            title="Delete User?"
            description={`Are you sure you want to delete ${record.firstName} ${record.lastName}?`}
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Delete"
            cancelText="Cancel"
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
              User Management
            </Title>
            <p className="text-gray-600 text-sm">
              Manage the list of users in the system
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Input.Search
              placeholder="Search by name or email..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={() => fetchUsers()}
              allowClear
              className="max-w-md"
              prefix={<SearchOutlined className="text-gray-400" />}
            />
            <Space>
              <Tooltip title="Refresh">
                <Button
                  icon={<RefreshCcw className="w-4 h-4" />}
                  onClick={fetchUsers}
                  className="border-gray-200"
                >
                  Refresh
                </Button>
              </Tooltip>
              {/* <Button
                type="primary"
                icon={<PlusOutlined />}
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm px-4 h-9"
              >
                Add User
              </Button> */}
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
                `${range[0]}-${range[1]} / ${total} users`,
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
            System Management
          </Title>
          <p className="text-gray-600 text-sm">
            Manage users and permissions in the system
          </p>
        </div>

        <Tabs
          defaultActiveKey="users"
          type="card"
          size="large"
          items={[
            {
              key: "users",
              label: "User",
              children: userManagementTab,
            },
            // {
            //   key: "permissions",
            //   label: "Permission",
            //   children: <PermissionManager />,
            // },
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
