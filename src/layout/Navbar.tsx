import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "~/hooks/useAuth";
import { FaSignOutAlt } from "react-icons/fa";
import { IoPersonCircleOutline } from "react-icons/io5";

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user, initialLoading } = useAuth();
  const [showModal, setShowModal] = useState<boolean>(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleLogout = () => {
    logout();
    setShowModal(false);
  };

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
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 cursor-pointer">
                {user && (
                  <div className="flex items-center gap-2" onClick={toggleModal}>
                    <span className="text-gray-800 text-sm font-semibold">{user.firstName} {user.lastName} </span>
                    <img src={user.imgUrl} className="w-10 h-10 rounded-full" />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        {/* popup */}
        {showModal && (
          <div className="absolute top-20 right-18 bg-white border border-gray-300 rounded-md shadow-lg w-30 z-10">
            <ul className="flex flex-col">
              <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md">
                <Link to="/student/dashboard" className="flex items-center gap-2 w-full">
                  Profile <IoPersonCircleOutline />
                </Link>
              </li>
              <li className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-red-500 hover:text-white">
                <button onClick={handleLogout} className="flex items-center gap-2 w-full">
                  Logout <FaSignOutAlt />
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
