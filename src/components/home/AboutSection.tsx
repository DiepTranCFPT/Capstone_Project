import React from "react";
import { Link } from "react-router-dom";
import { FaHeadset } from "react-icons/fa";

const AboutSection: React.FC = () => {
  return (
    <div className="w-full bg-white py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">

          {/* Left side - Images */}
          <div className="w-full lg:w-1/2 relative">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* First Image */}
              <div className="relative flex-1">
                <div className="absolute inset-0 bg-white rounded-tr-[40px] rounded-bl-[40px] border border-black/20 translate-x-2 translate-y-2" />
                <img
                  className="relative w-full h-64 sm:h-72 md:h-80 rounded-tr-[40px] rounded-bl-[40px] object-cover shadow-xl"
                  src="/asia-businesswoman-using-laptop-talk-colleagues-about-plan-video-call-meeting-living-room.jpg"
                  alt="Online learning student"
                />
              </div>

              {/* Second Image - Hidden on mobile, visible on sm+ */}
              <div className="relative flex-1 hidden sm:block sm:mt-16">
                <div className="absolute inset-0 bg-white rounded-tl-[40px] rounded-br-[40px] border border-black/20 translate-x-2 translate-y-2" />
                <img
                  className="relative w-full h-64 sm:h-72 md:h-80 rounded-tl-[40px] rounded-br-[40px] object-cover shadow-lg brightness-95"
                  src="/imagestudent.jpg"
                  alt="Student studying"
                />
              </div>
            </div>

            {/* Support Banner */}
            <div className="mt-6 w-full sm:w-64 bg-teal-400 rounded-tr-[40px] rounded-bl-[40px] px-6 py-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-300/80 rounded-full flex items-center justify-center">
                <FaHeadset className="w-5 h-5 text-teal-700" />
              </div>
              <div className="text-white text-sm font-bold">
                <p>ONLINE SUPPORT</p>
                <p>0398827576</p>
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="w-full lg:w-1/2 space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center border border-black/20 bg-white rounded-full px-4 py-2 gap-2">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <img
                  className="w-6 h-6 object-contain"
                  src="/elearning_2888414.png"
                  alt="E-learning icon"
                />
              </div>
              <span className="text-black text-sm sm:text-base font-medium">
                Get More About Us
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            A New Era of AP Mastery & Digital Learning Resources
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
Advanced Placement (AP) is a program organized by the College Board that offers courses and exams equivalent to college coursework, allowing students to familiarize themselves with and deepen their college credits right from high school.

Established in the 1950s, the AP program helps high school students experience and get acquainted with the university learning environment right from the time they are in school. The AP program offers 38 courses in 7 areas: Arts, Science, English, History, Math, Computer Science, and Languages.            </p>

            {/* Learn More Button */}
            <Link 
              to="/blog" 
              className="inline-block mt-4 px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-full transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              Learn More
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
