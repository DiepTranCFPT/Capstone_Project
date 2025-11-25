import React from "react";

const AboutSection: React.FC = () => {
  return (
    <div className="w-full bg-white flex justify-center">
      <div className="max-w-[1440px] h-[582px] relative overflow-hidden flex">
        {/* Khối bên trái */}
        <div className="w-[661px] h-[482px] mt-[44px] mr-[40px] relative">
          <div className="w-72 h-80 absolute bg-white rounded-tr-[40px] rounded-bl-[40px] border border-black/40" />
          <img
            className="w-64 h-80 absolute top-[7px] left-[7px] rounded-tr-[40px] rounded-bl-[40px] object-cover shadow-xl"
            src="/asia-businesswoman-using-laptop-talk-colleagues-about-plan-video-call-meeting-living-room.jpg"
            alt="Nữ sinh viên học trực tuyến"
          />
          <div className="w-64 h-80 absolute left-[330px] top-[141px] bg-white rounded-tl-[40px] rounded-br-[40px] border border-black/40" />
          <img
            className="w-60 h-80 absolute left-[337px] top-[148px] rounded-tl-[40px] rounded-br-[40px] object-cover shadow-lg brightness-95"
            src="/imagestudent.jpg"
            alt="Nữ sinh viên đang học tập"
          />
          <div className="w-64 h-20 absolute top-[388px] bg-teal-400 rounded-tr-[40px] rounded-bl-[40px]" />
          <div className="w-10 h-10 absolute top-[410px] left-[24px] bg-zinc-300 rounded-full" />
          <div className="absolute top-[416px] left-[88px] flex items-center text-white text-base font-bold font-['Inter']">
            ONLINE SUPPORT <br /> +0123456789
          </div>
        </div>

        {/* Khối bên phải */}
        <div className="w-[655px] h-[493px] mt-[45px] relative">
          <div className="absolute top-[82px] left-[43px] w-[568px] text-black text-3xl font-bold font-['Inter']">
            Over 10 Years in Distant learning for Skill Development
          </div>
          <div className="absolute top-[176px] left-[45px] w-[566px] text-black text-base font-normal font-['Inter']">
            Compellingly procrastinate equity invested markets with efficient
            process improvements. Actualize mission-critical partnerships with
            integrated portals. Authoritatively optimize low-risk high-yield
            metrics and plug-and-play potentialities.
          </div>

          {/* Box 1 */}
          <div className="absolute top-[300px] left-[31px] flex items-center space-x-6">
            <div className="w-16 h-16 bg-white rounded-full border border-black/20 flex items-center justify-center">
              <img
                className="w-10 h-10"
                src="https://placehold.co/40x40"
                alt="icon 1"
              />
            </div>
            <div>
              <span className="text-teal-700 text-xl font-bold font-['Inter'] block">
                9.5k +
              </span>
              <span className="text-black text-xs font-normal font-['Inter']">
                Total active students taking gifted courses
              </span>
            </div>
          </div>

          {/* Box 2 */}
          <div className="absolute top-[305px] left-[327px] flex items-center space-x-6">
            <div className="w-16 h-16 bg-white rounded-full border border-black/20 flex items-center justify-center">
              <img
                className="w-10 h-10"
                src="https://placehold.co/40x40"
                alt="icon 2"
              />
            </div>
            <div>
              <span className="text-teal-700 text-xl font-bold font-['Inter'] block">
                6.7k +
              </span>
              <span className="text-black text-xs font-normal font-['Inter']">
                Total active students taking gifted courses
              </span>
            </div>
          </div>

          {/* Button */}
          <button className="absolute top-[428px] left-[46px] w-40 h-11 bg-teal-400 rounded-[20px] text-white text-sm font-bold font-['Inter']">
            Start Free Trial
          </button>

          {/* Get More About Us */}
          <div className="absolute top-[17px] left-[31px] flex items-center border border-black/20 bg-white rounded-[30px] px-4 py-2">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mr-2">
              <img
                className="w-8 h-8 object-contain"
                src="/elearning_2888414.png"
                alt="Get more about us logo"
              />
            </div>
            <span className="text-black text-base font-normal font-['Inter']">
              Get More About Us
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
