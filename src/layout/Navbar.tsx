import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "~/hooks/useAuth";

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth()
  return (
    <header className="w-full h-28 bg-white flex items-center justify-between px-16 shadow">
      {/* Logo */}
      <div className="text-black text-xl font-bold">LOGO</div>

      {/* Navigation */}
      <nav className="flex items-center gap-11">
        <a href="/" className="text-black text-base font-semibold">
          Home
        </a>
        <a href="/materials" className="text-black text-base font-semibold">
          Materials
        </a>
        <a href="#" className="text-black text-base font-semibold">
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
        {isAuthenticated ? (
          <button className="bg-red-400 text-white text-base font-semibold px-4 py-2 rounded-md" onClick={logout}>
            Sign Out
          </button>
        ) : (
          <>
            <button className="text-black text-base font-semibold">
              <Link to="/auth">Sign In</Link>
            </button>
            <button className="bg-teal-400 text-white text-base font-semibold px-4 py-2 rounded-md">
              <Link to="/auth">Sign Up</Link>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
