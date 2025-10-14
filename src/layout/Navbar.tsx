import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "~/hooks/useAuth";
import { FaSignOutAlt } from "react-icons/fa";
import { IoPersonCircleOutline } from "react-icons/io5";

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user, initialLoading } = useAuth();
  const [showModal, setShowModal] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <header className="w-full h-28 bg-white flex items-center justify-between px-16 shadow">
      {/* Logo */}
      <div className="text-black text-xl font-bold">LOGO</div>

      {/* Navigation */}
      <nav className="flex items-center gap-11">
        <Link to="/" className="text-black text-base font-semibold">
          Home
        </Link>
        <Link to="/materials" className="text-black text-base font-semibold">
          Materials
        </Link>
        <Link to="/exam-test" className="text-black text-base font-semibold">
          Exam Test
        </Link>
        {/* <Link to="/about" className="text-black text-base font-semibold">
          About
        </Link>
        <Link to="/contact" className="text-black text-base font-semibold">
          Contact
        </Link> */}
        <Link to="/student/dashboard" className="text-black text-base font-semibold">
          Ranking
        </Link>
        <Link to="/community" className="text-black text-base font-semibold">
          Community
        </Link>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {!initialLoading && !isAuthenticated ? (
          <>
            <Link to="/auth" className="text-black text-base font-semibold">
              Sign In
            </Link>
            <Link
              to="/auth"
              className="bg-teal-400 text-white text-base font-semibold px-4 py-2 rounded-md"
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
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    onClick={toggleModal}
                  >
                    <span className="text-gray-800 text-sm font-medium hidden sm:block">
                      {user.firstName} {user.lastName}
                    </span>
                    <img
                      src={user.imgUrl || 'https://placehold.co/50x50'}
                      alt="User avatar"
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
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
            className="absolute top-20 right-4 bg-white border border-gray-200 rounded-lg shadow-xl w-48 z-[9999] animate-in fade-in-0 zoom-in-95 duration-200"
          >
            <div className="py-2">

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  to="/student/dashboard"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  onClick={() => setShowModal(false)}
                >
                  <IoPersonCircleOutline className="w-4 h-4" />
                  My Profile
                </Link>

              </div>

              {/* Divider */}
              <div className="border-t border-gray-100"></div>

              {/* Logout */}
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 w-full text-left"
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
