import React from "react";

const Navbar: React.FC = () => {
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
        <button className="text-black text-base font-semibold">Sign In</button>
        <button className="bg-teal-400 text-white text-base font-semibold px-4 py-2 rounded-md">
          Sign Up
        </button>
      </div>
    </header>
  );
};

export default Navbar;
