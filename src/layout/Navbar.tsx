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
  }
  return (
    <header className="w-full h-28 bg-white flex items-center justify-between px-16 shadow">
      {/* Logo */}
      <div className="text-black text-xl font-bold">LOGO</div>

      {/* Navigation */}
      <nav className="flex items-center gap-11">
        <a href="#" className="text-black text-base font-semibold">
          Home
        </a>
        <a href="#" className="text-black text-base font-semibold">
          Materials
        </a>
        <a href="/exam-test" className="text-black text-base font-semibold">
          Exam Test
        </a>
        <a href="#" className="text-black text-base font-semibold">
          About
        </a>
        <a href="#" className="text-black text-base font-semibold">
          Contact
        </a>
        <a href="#" className="text-black text-base font-semibold">
          Ranking
        </a>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {!initialLoading && !isAuthenticated ? (
          <>
            <button className="text-black text-base font-semibold">
              <Link to="/auth">Sign In</Link>
            </button>
            <button className="bg-teal-400 text-white text-base font-semibold px-4 py-2 rounded-md">
              <Link to="/auth">Sign Up</Link>
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 cursor-pointer">
                {user && (
                  <div className="flex items-center gap-2" onClick={toggleModal}>
                    <span className="text-gray-800 text-sm font-semibold text">{user.name}</span>
                    <img src={user.avatar} className="w-10 h-10 rounded-full" />
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
                <li className="flex items-center gap-2 px-4 py-2 hover:cursor-pointer hover:bg-gray-100 rounded-md">
                  <button className="w-full hover:cursor-pointer">
                    <Link to="/profile" className="">Profile</Link>
                  </button>
                  <IoPersonCircleOutline />
                </li>
                <li className="flex items-center gap-2 hover:cursor-pointer hover:bg-red-500 px-4 py-2 rounded-md hover:text-white ">
                  <button onClick={handleLogout} className="w-full hover:cursor-pointer">
                    Logout
                  </button>
                  <FaSignOutAlt />
                </li>
              </ul>
            </div>
          )}
        
      </div>
    </header>
  );
};

export default Navbar;
