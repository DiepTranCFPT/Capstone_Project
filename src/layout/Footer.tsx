import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-emerald-950 text-white">
      {/* Nội dung chính */}
      <div className="max-w-[1440px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {/* Get in touch */}
        <div>
          <h3 className="text-xl font-bold mb-2">GET IN TOUCH!</h3>
          <div className="w-24 h-[2px] bg-white mb-4" />
          <p className="text-base mb-6">
            Hỗ trợ học tập và luyện thi AP hiệu quả.
          </p>
          <div className="flex items-center mb-3">
            <span className="font-semibold">039-882-7576</span>
          </div>
          <div className="flex items-center mb-6">
            <span className="font-semibold">trancaodiep28022003@gmail.com</span>
          </div>
        </div>

        {/* About us */}
        <div>
          <h3 className="text-xl font-bold mb-2">ABOUT US</h3>
          <div className="w-14 h-[2px] bg-white mb-4" />
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/materials" className="hover:text-teal-400 transition-colors">
                Resource center
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-teal-400 transition-colors">
                Careers
              </Link>
            </li>
            {/* <li>
              <Link to="/ranking" className="hover:text-teal-400 transition-colors">
                Instructor
              </Link>
            </li>
            <li>
              <Link to="/ranking" className="hover:text-teal-400 transition-colors">
                Teacher Ratings
              </Link>
            </li> */}
          </ul>
        </div>

        {/* Useful links */}
        <div>
          <h3 className="text-xl font-bold mb-2">USEFUL LINKS</h3>
          <div className="w-14 h-[2px] bg-white mb-4" />
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/materials" className="hover:text-teal-400 transition-colors">
                All Courses
              </Link>
            </li>
            <li>
              <Link to="/community" className="hover:text-teal-400 transition-colors">
                Community
              </Link>
            </li>
            <li>
              <Link to="/exam-test" className="hover:text-teal-400 transition-colors">
                Exam Practice
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-teal-400 transition-colors">
                News & Blogs
              </Link>
            </li>
          </ul>
        </div>

        {/* Scroll to top */}
        <div className="flex lg:justify-end items-start">
          <button className="w-11 h-11 bg-teal-400 rounded flex items-center justify-center">
            <span className="transform rotate-90 border-t-2 border-white w-4"></span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/30" />

      {/* Copyright */}
      <div className="py-4 text-center text-sm">
        Copyright © 2025 AP-LMS. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
