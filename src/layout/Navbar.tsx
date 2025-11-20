import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "~/hooks/useAuth";
import { FaSignOutAlt } from "react-icons/fa";
import { IoPersonCircleOutline } from "react-icons/io5";

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user, initialLoading } = useAuth();
  const [showModal, setShowModal] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleLogout = () => {
    logout();
    setShowModal(false);
  };



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

  return (
    <header className="w-full h-28 bg-white flex items-center justify-between px-16 shadow fixed z-50 ">
      {/* Logo */}
      <Link to="/" className="w-48 h-24">
        <img src="/logo-ap.png" alt="Logo" className="w-full h-full object-contain" />
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-11">
        <Link to="/" className={`transition-colors duration-300 ${location.pathname === '/' ? 'text-teal-500 border-b-2 border-teal-500' : 'text-black'} hover:text-teal-500 hover:border-b-2 hover:border-teal-500 text-base font-semibold`}>
          Home
        </Link>
        <Link to="/materials" className={`transition-colors duration-300 ${location.pathname === '/materials' ? 'text-teal-500 border-b-2 border-teal-500' : 'text-black'} hover:text-teal-500 hover:border-b-2 hover:border-teal-500 text-base font-semibold`}>
          Materials
        </Link>
        <Link to="/exam-test" className={`transition-colors duration-300 ${location.pathname === '/exam-test' ? 'text-teal-500 border-b-2 border-teal-500' : 'text-black'} hover:text-teal-500 hover:border-b-2 hover:border-teal-500 text-base font-semibold`}>
          Exam Test
        </Link>
        <Link to="/learning-pathway" className={`transition-colors duration-300 ${location.pathname === '/learning-pathway' ? 'text-teal-500 border-b-2 border-teal-500' : 'text-black'} hover:text-teal-500 hover:border-b-2 hover:border-teal-500 text-base font-semibold`}>
          Path Way
        </Link>
        {/* <Link to="/about" className="text-black text-base font-semibold">
          About
        </Link>
        <Link to="/contact" className="text-black text-base font-semibold">
          Contact
        </Link> */}
        <Link to="/ranking" className={`transition-colors duration-300 ${location.pathname === '/ranking' ? 'text-teal-500 border-b-2 border-teal-500' : 'text-black'} hover:text-teal-500 hover:border-b-2 hover:border-teal-500 text-base font-semibold`}>
          Ranking
        </Link>
        <Link to="/community" className={`transition-colors duration-300 ${location.pathname === '/community' ? 'text-teal-500 border-b-2 border-teal-500' : 'text-black'} hover:text-teal-500 hover:border-b-2 hover:border-teal-500 text-base font-semibold`}>
          Community
        </Link>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {!initialLoading && !isAuthenticated ? (
          <>
            <Link
              to="/auth"
              className="text-gray-700 text-base font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              className="bg-gradient-to-r from-teal-400 to-teal-500 text-white text-base font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-teal-500 hover:to-teal-600 transform"
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
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-md"
                    onClick={toggleModal}
                  >
                    <span className="text-gray-800 text-sm font-medium hidden sm:block">
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
            className="absolute top-20 right-4 bg-white border border-gray-200 rounded-lg shadow-xl w-auto z-[9999] animate-fade-in"
          >
            <div className="py-2">
              {/* Menu Items */}
              <div className="py-1">
                <Link
                  to="/student/dashboard"
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
  );
};

export default Navbar;
