import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaUserPlus,
    FaFileInvoiceDollar,
    FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '~/hooks/useAuth';
import { Avatar, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const parentMenu = [
    { label: "Dashboard", path: "/parent/dashboard", icon: <FaTachometerAlt /> },
    { label: "Link Student", path: "/parent/link-student", icon: <FaUserPlus /> },
    { label: "Billing", path: "/parent/billing", icon: <FaFileInvoiceDollar /> },
];

const ParentSidebar: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
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
                <div className={"p-4 border-b border-gray-200 flex flex-row items-center" + (collapsed ? " justify-center" : "")}>
                    <Avatar size={collapsed ? 32 : 40} src={user.imgUrl} />
                    {!collapsed && (
                        <div className='flex flex-col px-2'>
                            <p className="font-semibold">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Menu */}
            <nav className="flex-1 mt-4 flex flex-col items-center">
                {parentMenu.map((item) => {
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
                    className={`flex items-center p-3 rounded-lg w-full text-red-500 hover:cursor-pointer hover:bg-red-50 ${collapsed ? 'justify-center' : ''}`}>
                    <FaSignOutAlt className="text-lg" />
                    {!collapsed && <span className="ml-4 font-medium">Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default ParentSidebar;