import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaUserPlus,
    FaSignOutAlt,
    FaBell,
    FaUsers,
    FaWallet
} from 'react-icons/fa';
import { useAuth } from '~/hooks/useAuth';
import { useNotifications } from '~/hooks/useNotifications';
import { Avatar, Button, Badge } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

type ParentMenuItem = {
    label: string;
    path: string;
    icon: React.ReactNode;
};

const parentMenu: ParentMenuItem[] = [
    { label: "Dashboard", path: "/parent/dashboard", icon: <FaTachometerAlt /> },
    { label: "Notifications", path: "/parent/notifications", icon: <FaBell /> },
    { label: "Link Student", path: "/parent/link-student", icon: <FaUserPlus /> },
    { label: "List of children", path: "/parent/children", icon: <FaUsers /> },
    { label: "Wallet", path: "/parent/wallet", icon: <FaWallet /> },
];

const ParentSidebar: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { stats } = useNotifications();
    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className={`sticky top-0 h-screen bg-white shadow-lg flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {!collapsed && <h1 className="text-xl font-bold text-blue-600">Parent</h1>}
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={toggleCollapse}
                />
            </div>

            {/* Profile */}
            {user && (
                <Link to="/parent/profile" className={"p-4 border-b border-gray-200 flex flex-row items-center hover:bg-gray-50 transition-colors cursor-pointer" + (collapsed ? " justify-center" : "")}>
                    <Avatar size={collapsed ? 32 : 40} src={user.imgUrl} />
                    {!collapsed && (
                        <div className='flex flex-col px-2'>
                            <p className="font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                    )}
                </Link>
            )}

            {/* Menu */}
            <nav className="flex-1 mt-4 flex flex-col items-center">
                {parentMenu.map((item) => {
                    const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                    const showBadge = item.path === "/parent/notifications" && stats.unread > 0;

                    return (
                        <div key={item.path} className="w-full flex flex-col items-center">
                            <div
                                className={`
                                    flex items-center transition-all duration-200 active-menu mt-1 relative cursor-pointer
                                    ${collapsed ? "justify-center w-12 h-12" : "px-6 py-2 w-11/12"}
                                    ${isActive
                                        ? "bg-backgroundColor text-white rounded-2xl"
                                        : "text-black hover:bg-backgroundColor hover:text-white rounded-2xl"
                                    }
                                `}
                                style={{
                                    minHeight: collapsed ? 48 : undefined,
                                }}
                                onClick={() => {
                                    if (location.pathname !== item.path) {
                                        navigate(item.path);
                                    }
                                }}
                            >
                                <span className={`text-lg ${isActive ? "text-white" : ""} relative`}>
                                    {item.icon}
                                    {showBadge && collapsed && (
                                        <Badge
                                            count={stats.unread}
                                            size="small"
                                            className="absolute -top-2 -right-2"
                                            style={{ fontSize: '8px' }}
                                        />
                                    )}
                                </span>
                                {!collapsed && (
                                    <div className="flex items-center justify-between flex-1 ml-3">
                                        <span className="font-medium">{item.label}</span>
                                        {showBadge && <Badge count={stats.unread} />}
                                    </div>
                                )}
                            </div>

                        </div>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-2 border-t border-gray-200">
                <button
                    onClick={logout}
                    className={`flex items-center p-3 rounded-lg w-full text-red-500 hover:cursor-pointer hover:bg-red-50 ${collapsed ? 'justify-center' : ''}`}>
                    <FaSignOutAlt className="text-lg" />
                    {!collapsed && <span className="ml-4 font-medium">Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default ParentSidebar;
