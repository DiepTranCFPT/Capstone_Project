import { MenuFoldOutlined, MenuUnfoldOutlined, PercentageOutlined } from "@ant-design/icons";
import { Button, Avatar, Spin, message } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  UserOutlined,
  DashboardOutlined,
  ReadOutlined,
  IdcardOutlined,
  CreditCardOutlined,
  TeamOutlined,
  MessageOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { getCurrentUserApi } from "~/services/authService";
import type { User } from "~/types/user";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "~/hooks/useAuth";

const adminMenu = [
  { key: "/admin/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "/admin/users", label: "Users", icon: <UserOutlined /> },
  { key: "/admin/subjects", label: "Subjects", icon: <ReadOutlined /> },
  { key: "/admin/teachers", label: "Teacher", icon: <IdcardOutlined /> },
  { key: "/admin/communities", label: "Communities", icon: <TeamOutlined /> },
  { key: "/admin/community", label: "Community", icon: <MessageOutlined /> },
  { key: "/admin/subscriptions", label: "Withdraw Requests", icon: <CreditCardOutlined /> },
  { key: "/admin/notifications", label: "Notifications", icon: <BellOutlined /> },
  { key: "/admin/profit-percentage", label: "Profit", icon: <PercentageOutlined /> },
];

export default function AdminSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar-admin-collapsed") === "true"
  );

  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    localStorage.setItem("sidebar-admin-collapsed", (!collapsed).toString());
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await getCurrentUserApi();

        setAdminUser({
          id: String(response.user.id),
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          imgUrl: response.user.imgUrl,
          dob: response.user.dob,
          roles: [response.user.role],
          active: true,
        });
      } catch (err) {
        console.error("Failed to fetch admin profile:", err);
        message.error("Không thể tải thông tin Admin!");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-white">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      className={`h-screen sticky top-0 ${collapsed ? "w-20" : "w-64"
        } bg-white flex flex-col shadow-lg transition-all duration-300`}
    >
      <div
        className={`${!collapsed
          ? "flex justify-between items-center border-b border-gray-200"
            : "flex items-center"
          }`}
      >
        {!collapsed && (
          <div className="text-xs uppercase font-bold text-gray-500 mt-2 mb-2 px-4">
            Admin Dashboard
          </div>
        )}
        <div className="flex items-center justify-end p-2 w-full">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapse}
            className="text-black"
          />
        </div>
      </div>

      <div
        className={`${!collapsed
            ? "px-4 py-3 border-b border-gray-200 flex items-center gap-3"
            : "px-4 py-3 border-b border-gray-200 flex items-center justify-center"
          }`}
      >
        {/* <Link to="/admin/profile"> */}
          <Avatar
            size={collapsed ? 32 : 40}
          src={adminUser?.imgUrl || `https://ui-avatars.com/api/?name=${adminUser?.firstName} ${adminUser?.lastName}&background=random`}
            className="cursor-pointer"
          />
        {/* </Link> */}
        {!collapsed && (
          <div>
            <div className="text-sm font-semibold">
              {adminUser
                ? `${adminUser.firstName} ${adminUser.lastName}`
                : "Admin"}
            </div>
            <div className="text-[10px] text-gray-400">{adminUser?.email}</div>
          </div>
        )}
      </div>

      <nav className="flex-1 mt-4 flex flex-col items-center">
        {adminMenu.map((item) => {
          const isActive = location.pathname === item.key;
          return (
            <Link
              key={item.key}
              to={item.key}
              className={`flex items-center transition-all duration-200 mt-1 ${collapsed ? "justify-center w-12 h-12" : "px-6 py-2 w-11/12"
                } ${isActive
                  ? "bg-blue-500 text-white rounded-2xl"
                  : "text-black hover:bg-blue-500 hover:text-white rounded-2xl"
                }`}
              style={{ minHeight: collapsed ? 48 : undefined }}
            >
              <span className={`text-lg ${isActive ? "text-white" : ""}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="font-medium ml-3">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
      {/* Logout */}
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={logout}
          className={`flex items-center p-3 rounded-lg w-full text-red-500 hover:cursor-pointer hover:bg-red-50 ${collapsed ? 'justify-center' : ''}`}
        >
          <FaSignOutAlt className="text-lg" />
          {!collapsed && <span className="ml-4 font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
