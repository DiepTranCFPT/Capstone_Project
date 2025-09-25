import React from "react";
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
import { Link, useLocation } from "react-router-dom";

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  // Danh sách menu để map
  const menuItems = [
    { key: "/dashboard", label: "Dashboard", icon: <HomeOutlined /> },
    { key: "/admin/courses", label: "Courses", icon: <BookOutlined /> },
    { key: "/admin/parents", label: "Parents", icon: <UserOutlined /> },
    { key: "/admin/students", label: "Students", icon: <TeamOutlined /> },
    { key: "/admin/mock-tests", label: "Mock Tests", icon: <SolutionOutlined /> },
    { key: "/teachers", label: "Teacher", icon: <UserOutlined /> },
    { key: "/certificates", label: "Certificates & Ranking", icon: <TrophyOutlined /> },
    { key: "/subscriptions", label: "Subscriptions & Payments", icon: <DollarOutlined /> },
    { key: "/settings", label: "Settings", icon: <SettingOutlined /> },
  ];

  return (
    <div className="w-64 h-screen bg-white shadow-md flex flex-col p-6">
      {/* Title */}
      <h2 className="text-2xl font-bold mb-12">Admin Dashboard</h2>

      {/* Menu */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.key;

          return (
            <Link
              key={item.key}
              to={item.key}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition 
                ${
                  isActive
                    ? "bg-gray-200 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
