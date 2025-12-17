import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaUsers,
    FaClipboardList,
    // FaChartBar,
    // FaCog,
    FaSignOutAlt,
    // FaCalendarAlt,
    FaWallet,
    FaStar,
    // FaBookOpen,
} from 'react-icons/fa';
import { useAuth } from '~/hooks/useAuth';
import { Avatar, Button } from 'antd';
import { FileAddOutlined, MenuFoldOutlined, MenuUnfoldOutlined, TagsOutlined, TeamOutlined } from '@ant-design/icons';
import { IoCheckmarkCircle } from "react-icons/io5";
import { BsQuestionSquare } from "react-icons/bs";
import { CiBoxList } from "react-icons/ci";
import { FaBook } from "react-icons/fa";

const teacherMenu = [
    { label: "Dashboard", path: "/teacher/dashboard", icon: <FaTachometerAlt /> },
    { label: "My Materials", path: "/teacher/my-materials", icon: <FaUsers /> },
    { label: "Materials", path: "materials", icon: <TagsOutlined /> },
    { label: "Questions Bank", path: "/teacher/question-bank", icon: <BsQuestionSquare /> },
    { label: "Templates", path: "/teacher/templates", icon: <FaClipboardList /> },
    { label: "Create Template", path: "/teacher/create-template", icon: <FileAddOutlined /> },
    { label: "Review Queue", path: "/teacher/review-queue", icon: <CiBoxList /> },
    { label: "My Ratings", path: "/teacher/ratings", icon: <FaStar /> },
    { label: "Exams Attempt", path: "/teacher/exam-attempts", icon: <FaBook /> },
    { label: "Community", path: "/teacher/community", icon: <TeamOutlined /> },
    // { label: "Analytics", path: "/teacher/analytics", icon: <FaChartBar /> },
    // { label: "Tutor Profile", path: "/teacher/tutor-profile", icon: <FaBookOpen /> },
    // { label: "My Availability", path: "/teacher/availability", icon: <FaCalendarAlt /> },
    // { label: "Booking Requests", path: "/teacher/bookings", icon: <FaCalendarAlt /> },
    { label: "My Wallet", path: "/teacher/wallet", icon: <FaWallet /> },
    // { label: "Settings", path: "/teacher/settings", icon: <FaCog /> },
];

const TeacherSidebar: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const navigate = useNavigate();
    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    const handleProfileClick = () => {
        // Navigate to profile page or open profile modal
        navigate("/teacher/tutor-profile");
    }

    return (
        <div className={`sticky top-0 h-screen bg-white shadow-lg flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {!collapsed && <h1 className="text-xl font-bold text-teal-600">Teacher</h1>}
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={toggleCollapse}
                />
            </div>

            {/* Profile */}
            {user && (
                <div className={"p-4 border-b border-gray-200 flex flex-row items-center hover:cursor-pointer" + (collapsed ? " justify-center" : "")}
                    onClick={() => handleProfileClick()}
                >
                    <div className="relative">
                        <Avatar size={collapsed ? 32 : 40} src={user.imgUrl || undefined} />
                        {user.teacherProfile?.isVerified && (
                            <IoCheckmarkCircle
                                className="absolute -bottom-0.5 -right-0.5 text-green-500 bg-white rounded-full"
                                style={{ fontSize: collapsed ? 12 : 16 }}
                            />
                        )}
                    </div>
                    {!collapsed && (
                        <div className='flex flex-col px-2'>
                            <p className="font-semibold">{user.firstName}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Menu */}
            <nav className="flex-1 mt-4 flex flex-col items-center">
                {teacherMenu.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                            flex items-center transition-all duration-200 active-menu mt-1
                            ${collapsed ? "justify-center w-12 h-12" : "px-6 py-2 w-11/12"}
                            ${isActive
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
};

export default TeacherSidebar;
