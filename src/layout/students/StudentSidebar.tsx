import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Avatar } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { FaBook, FaUserGraduate, FaCertificate, FaCog, FaChartBar, FaCoins, FaRobot, FaUserFriends, FaCalendarCheck, FaTrophy } from "react-icons/fa";
import { useAuth } from "~/hooks/useAuth";

// Menu tạm thời cho Student
const studentMenu = [
  {
    label: "Dashboard",
    path: "/student/dashboard",
    icon: <FaBook />,
  },
  {
    label: "AI Tutor",
    path: "/student/ai-tutor",
    icon: <FaRobot />,
  },
  {
    label: "Find a Tutor",
    path: "/student/find-tutor",
    icon: <FaUserFriends />,
  },
  {
    label: "My Bookings",
    path: "/student/my-bookings",
    icon: <FaCalendarCheck />,
  },
  {
    label: "Quiz Battle",
    path: "/student/quiz-battle",
    icon: <FaTrophy />,
  },
  {
    label: "My Courses",
    path: "#",
    icon: <FaUserGraduate />,
  },
  {
    label: "Certificates",
    path: "/student/certificates",
    icon: <FaCertificate />,
  },
  {
    label: "Test Reports",
    path: "/student/test-reports",
    icon: <FaChartBar />,
  },
  {
    label: "Settings",
    path: "/student/settings",
    icon: <FaCog />,
  },
];

export default function SidebarStudent() {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-student-collapsed");
    return saved === "true";
  });

  const { user: currentUser } = useAuth();

  // Lưu trạng thái khi collapse/expand
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    localStorage.setItem("sidebar-student-collapsed", (!collapsed).toString());
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
        <div>
          <Button
            type="text"
            icon={<IoIosArrowBack />}
            onClick={() => navigate("/")}
          />
        </div>
        {!collapsed && (
          <div className="text-xs uppercase font-bold text-gray-500 mt-2 mb-2 px-4">
            Student Dashboard
          </div>
        )}
        <div className="flex items-center justify-end p-2">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapse}
            className="text-black"
          />
        </div>
      </div>

      {/* Profile */}
      {currentUser && (
        <div
          className={`${
            !collapsed
              ? "px-4 py-3 border-b flex items-center gap-3"
              : "px-4 py-3 border-b flex items-center justify-center"
          }`}
        >
          <Link to="/student/profile">
            <Avatar
              size={collapsed ? 32 : 40}
              src={currentUser.imgUrl}
              className="cursor-pointer"
            />
          </Link>
          {!collapsed && (
            <div>
              <div className="text-sm font-semibold">{currentUser.firstName} {currentUser.lastName}</div> 
              <div className="text-[10px] text-gray-400">{currentUser.email}</div>
              <div className="flex items-center text-sm text-yellow-500">
                <FaCoins className="mr-1" />
                <span>{currentUser.tokenBalance} Tokens</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 mt-4 flex flex-col items-center">
        {studentMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center transition-all duration-200 active-menu mt-1
                ${collapsed ? "justify-center w-12 h-12" : "px-6 py-2 w-11/12"}
                ${
                  isActive
                    ? "bg-backgroundColor text-white rounded-2xl"
                    : "text-black hover:bg-backgroundColor hover:text-white rounded-2xl"
                }
              `}
              style={{
                minHeight: collapsed ? 48 : undefined,
              }}
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
