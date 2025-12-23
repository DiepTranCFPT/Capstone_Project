import { MenuFoldOutlined, MenuUnfoldOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Avatar, Drawer, Spin } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import {
  FaBook,
  FaUserGraduate,
  FaCertificate,
  FaChartBar,
  FaRobot,
  FaBars,
  FaWallet
} from "react-icons/fa";
import { useAuth } from "~/hooks/useAuth";
import { useWalletBalance } from "~/hooks/useWalletBalance";

// Menu cho Student
const studentMenu = [
  {
    label: "Dashboard",
    path: "/student/dashboard",
    icon: <FaBook />,
  },
  {
    label: "AI Support",
    path: "/student/ai-tutor",
    icon: <FaRobot />,
  },
  {
    label: "My Courses",
    path: "/student/my-courses",
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
    label: "Wallet",
    path: "/wallet",
    icon: <FaWallet />,
  },
];

interface StudentSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function SidebarStudent({ mobileOpen = false, onMobileClose }: StudentSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-student-collapsed");
    return saved === "true";
  });

  const [isMobile, setIsMobile] = useState(false);

  const { user: currentUser } = useAuth();
  const { balance: tokenBalance, loading: balanceLoading } = useWalletBalance();

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname]);

  // Lưu trạng thái khi collapse/expand
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    localStorage.setItem("sidebar-student-collapsed", (!collapsed).toString());
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Collapse button + title */}
      <div
        className={`${!collapsed || isMobile
          ? "flex justify-between items-center border-b border-gray-200"
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
        {(!collapsed || isMobile) && (
          <div className="text-xs uppercase font-bold text-gray-500 mt-2 mb-2 px-4">
            Student Dashboard
          </div>
        )}
        <div className="flex items-center justify-end p-2">
          {isMobile ? (
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onMobileClose}
              className="text-black"
            />
          ) : (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapse}
              className="text-black"
            />
          )}
        </div>
      </div>

      {/* Profile */}
      {currentUser && (
        <div
          className={`${(!collapsed || isMobile)
            ? "px-4 py-3 border-b border-gray-200 flex items-center gap-3"
            : "px-4 py-3 border-b border-gray-200 not-[]:flex items-center justify-center"
            }`}
        >
          <Link
            to="/student/profile"
            className="flex flex-row gap-1"
          >
            <Avatar
              size={collapsed && !isMobile ? 32 : 40}
              src={currentUser.imgUrl || `https://ui-avatars.com/api/?name=${currentUser.firstName} ${currentUser.lastName}&background=random`}
              className="cursor-pointer"
            />

            {(!collapsed || isMobile) && (
              <div>
                <div className="text-sm font-semibold">{currentUser.firstName} {currentUser.lastName}</div>
                <div className="text-[10px] text-gray-400">{currentUser.email}</div>
                <div className="flex items-center text-sm font-medium text-green-600">
                  {balanceLoading ? (
                    <Spin size="small" />
                  ) : (
                    <span>{tokenBalance?.toLocaleString('vi-VN') ?? currentUser.tokenBalance.toLocaleString('vi-VN')} ₫</span>
                  )}
                </div>
              </div>
            )}
          </Link>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 mt-4 flex flex-col items-center overflow-y-auto">
        {studentMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center transition-all duration-200 active-menu mt-1
                ${(collapsed && !isMobile) ? "justify-center w-12 h-12" : "px-6 py-2 w-11/12"}
                ${isActive
                  ? "bg-backgroundColor text-white rounded-2xl"
                  : "text-black hover:bg-backgroundColor hover:text-white rounded-2xl"
                }
              `}
              style={{
                minHeight: (collapsed && !isMobile) ? 48 : undefined,
                color: isActive ? (isMobile ? '#14b8a6' : 'white') : '#1f2937',
              }}
            >
              <span className={`text-lg`}>
                {item.icon}
              </span>
              {(!collapsed || isMobile) && (
                <span className="font-medium ml-3">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  // Mobile: use Drawer
  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={onMobileClose}
        width={280}
        styles={{ body: { padding: 0 } }}
        closable={false}
      >
        <SidebarContent />
      </Drawer>
    );
  }

  // Desktop: normal sidebar
  return (
    <div
      className={`h-screen sticky top-0 ${collapsed ? "w-20" : "w-64"
        } bg-white flex flex-col shadow-lg transition-all duration-300`}
    >
      <SidebarContent />
    </div>
  );
}

// Export mobile toggle button component
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="text"
      icon={<FaBars className="text-xl" />}
      onClick={onClick}
      className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md rounded-lg"
      style={{ width: 44, height: 44 }}
    />
  );
}

