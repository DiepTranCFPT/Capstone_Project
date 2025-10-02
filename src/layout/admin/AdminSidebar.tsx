import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Avatar } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  HomeOutlined,
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  SolutionOutlined,
  TrophyOutlined,
  DollarOutlined,
} from "@ant-design/icons";

// Danh sách menu cho Admin
const adminMenu = [
  { key: "/dashboard", label: "Dashboard", icon: <HomeOutlined /> },
  { key: "/admin/courses", label: "Courses", icon: <BookOutlined /> },
  { key: "/admin/parents", label: "Parents", icon: <UserOutlined /> },
  { key: "/admin/students", label: "Students", icon: <TeamOutlined /> },
  { key: "/admin/mock-tests", label: "Mock Tests", icon: <SolutionOutlined /> },
  { key: "/admin/teachers", label: "Teacher", icon: <UserOutlined /> },
  { key: "/admin/certificates", label: "Certificates & Ranking", icon: <TrophyOutlined /> },
  { key: "/subscriptions", label: "Subscriptions & Payments", icon: <DollarOutlined /> },
  { key: "/settings", label: "Settings", icon: <SettingOutlined /> },
];

export default function AdminSidebar() {
  const location = useLocation();
  

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-admin-collapsed");
    return saved === "true";
  });

  // Toggle collapse
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    localStorage.setItem("sidebar-admin-collapsed", (!collapsed).toString());
  };

  // Fake user admin info (bạn thay bằng useAuth hoặc API)
  const adminUser = {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "https://i.pravatar.cc/150?img=12",
  };

  return (
    <div
      className={`h-screen sticky top-0 ${
        collapsed ? "w-20" : "w-64"
      } bg-white flex flex-col shadow-lg transition-all duration-300`}
    >
      {/* Collapse button + title */}
      <div
        className={`${
          !collapsed
            ? "flex justify-between items-center border-b"
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

      {/* Profile */}
      <div
        className={`${
          !collapsed
            ? "px-4 py-3 border-b flex items-center gap-3"
            : "px-4 py-3 border-b flex items-center justify-center"
        }`}
      >
        <Link to="/admin/profile">
          <Avatar
            size={collapsed ? 32 : 40}
            src={adminUser.avatar}
            className="cursor-pointer"
          />
        </Link>
        {!collapsed && (
          <div>
            <div className="text-sm font-semibold">{adminUser.name}</div>
            <div className="text-[10px] text-gray-400">{adminUser.email}</div>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 mt-4 flex flex-col items-center">
        {adminMenu.map((item) => {
          const isActive = location.pathname === item.key;
          return (
            <Link
              key={item.key}
              to={item.key}
              className={`
                flex items-center transition-all duration-200 mt-1
                ${collapsed ? "justify-center w-12 h-12" : "px-6 py-2 w-11/12"}
                ${
                  isActive
                    ? "bg-blue-500 text-white rounded-2xl"
                    : "text-black hover:bg-blue-500 hover:text-white rounded-2xl"
                }
              `}
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
    </div>
  );
}
