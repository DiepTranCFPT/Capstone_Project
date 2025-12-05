import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "~/hooks/useAuth";
import { FaSignOutAlt, FaMoneyBillWave, FaBars, FaTimes } from "react-icons/fa";
import { IoPersonCircleOutline } from "react-icons/io5";
import { Drawer } from "antd";

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user, initialLoading } = useAuth();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleLogout = () => {
    logout();
    setShowModal(false);
    setMobileMenuOpen(false);
  };

  // Navigation links data
  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/materials", label: "Materials" },
    { path: "/exam-test", label: "Exam Test" },
    { path: "/learning-pathway", label: "Path Way" },
    { path: "/ranking", label: "Ranking" },
    { path: "/community", label: "Community" },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  const NavLink = ({ path, label, mobile = false }: { path: string; label: string; mobile?: boolean }) => {
    const isActive = location.pathname === path;
    return (
      <Link
        to={path}
        className={`transition-colors duration-300 no-underline ${isActive ? 'border-b-2 border-teal-500' : ''
          } hover:border-b-2 hover:border-teal-500 ${mobile ? 'text-lg py-3 block' : 'text-base'
          } font-semibold`}
        style={{
          color: isActive ? '#14b8a6' : '#1f2937',
          textDecoration: 'none'
        }}
        onClick={() => mobile && setMobileMenuOpen(false)}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <header className="w-full h-20 md:h-28 bg-white flex items-center justify-between px-4 md:px-8 lg:px-16 shadow fixed z-50">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-gray-700 hover:text-teal-500 transition-colors"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <FaBars className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link to="/" className="w-32 md:w-48 h-16 md:h-24">
          <img src="/logo-ap.png" alt="Logo" className="w-full h-full object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-11">
          {navLinks.map((link) => (
            <NavLink key={link.path} path={link.path} label={link.label} />
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {!initialLoading && isAuthenticated && (
            <button
              type="button"
              title="Ví thanh toán"
              onClick={() => navigate("/wallet")}
              className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-full border border-teal-100 text-teal-500 hover:bg-teal-50 hover:scale-105 transition-all duration-300 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
            >
              <FaMoneyBillWave className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
          {!initialLoading && !isAuthenticated ? (
            <>
              <Link
                to="/auth"
                className="hidden sm:block text-gray-700 text-sm md:text-base font-semibold px-3 md:px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="bg-gradient-to-r from-teal-400 to-teal-500 text-white text-sm md:text-base font-semibold px-4 md:px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-teal-500 hover:to-teal-600 transform"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2" ref={dropdownRef}>
                <div className="flex items-center gap-2 cursor-pointer relative group">
                  {user && (
                    <div
                      className="flex items-center gap-2 p-1 md:p-2 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-md"
                      onClick={toggleModal}
                    >
                      <span className="text-gray-800 text-sm font-medium hidden md:block">
                        {user.firstName} {user.lastName}
                      </span>
                      <img
                        src={user.imgUrl || 'https://placehold.co/50x50'}
                        alt="User avatar"
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 transition-all duration-300 hover:border-teal-300 hover:scale-110"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          {/* Enhanced Dropdown Menu */}
          {showModal && (
            <div
              ref={menuRef}
              className="absolute top-16 md:top-20 right-4 bg-white border border-gray-200 rounded-lg shadow-xl w-auto z-[9999] animate-fade-in"
            >
              <div className="py-2">
                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    to={user?.role === "PARENT" ? "/parent/profile" : "/student/dashboard"}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:scale-105 rounded-md mx-2"
                    onClick={() => setShowModal(false)}
                  >
                    <IoPersonCircleOutline className="w-4 h-4" />
                    My Profile
                  </Link>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-1"></div>

                {/* Logout */}
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all duration-300 hover:scale-105 rounded-md mx-2 w-max"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <Drawer
        placement="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        width={280}
        styles={{ body: { padding: 0 } }}
        closable={false}
        className="lg:hidden"
      >
        <div className="h-full flex flex-col bg-white">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link to="/" className="w-32 h-12" onClick={() => setMobileMenuOpen(false)}>
              <img src="/logo-ap.png" alt="Logo" className="w-full h-full object-contain" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* User Info (if logged in) */}
          {!initialLoading && isAuthenticated && user && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <img
                  src={user.imgUrl || 'https://placehold.co/50x50'}
                  alt="User avatar"
                  className="w-12 h-12 rounded-full object-cover border-2 border-teal-200"
                />
                <div>
                  <p className="font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink key={link.path} path={link.path} label={link.label} mobile />
              ))}
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200">
            {!initialLoading && !isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/auth"
                  className="text-center text-gray-700 font-semibold px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  className="text-center bg-gradient-to-r from-teal-400 to-teal-500 text-white font-semibold px-4 py-3 rounded-lg shadow-lg transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to={user?.role === "PARENT" ? "/parent/profile" : "/student/dashboard"}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <IoPersonCircleOutline className="w-5 h-5" />
                  My Profile
                </Link>
                <Link
                  to="/wallet"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaMoneyBillWave className="w-5 h-5 text-teal-500" />
                  Wallet
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <FaSignOutAlt className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default Navbar;

