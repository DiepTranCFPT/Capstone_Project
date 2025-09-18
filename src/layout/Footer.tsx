import React from "react";

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
            Fusce varius, dolor tempor interdum tristiquei bibendum.
          </p>
          <div className="flex items-center mb-3">
            <img
              className="w-6 h-6 mr-2"
              src="https://placehold.co/23x23"
              alt="phone"
            />
            <span className="font-semibold">123-456-789</span>
          </div>
          <div className="flex items-center mb-6">
            <span className="font-semibold">aplmscapstone@gmail.com</span>
          </div>
          <div className="flex space-x-4">
            <img
              className="w-6 h-6"
              src="https://placehold.co/25x25"
              alt="icon1"
            />
            <img
              className="w-6 h-6"
              src="https://placehold.co/25x25"
              alt="icon2"
            />
            <img
              className="w-6 h-6"
              src="https://placehold.co/25x25"
              alt="icon3"
            />
          </div>
        </div>

        {/* About us */}
        <div>
          <h3 className="text-xl font-bold mb-2">ABOUT US</h3>
          <div className="w-14 h-[2px] bg-white mb-4" />
          <ul className="space-y-3 text-sm">
            <li>Resource center</li>
            <li>Careers</li>
            <li>Instructor</li>
            <li>Become A Teacher</li>
          </ul>
        </div>

        {/* Useful links */}
        <div>
          <h3 className="text-xl font-bold mb-2">USEFUL LINKS</h3>
          <div className="w-14 h-[2px] bg-white mb-4" />
          <ul className="space-y-3 text-sm">
            <li>All Courses</li>
            <li>Digital Marketing</li>
            <li>Design & Branding</li>
            <li>News & Blogs</li>
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
