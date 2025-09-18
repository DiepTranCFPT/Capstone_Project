import React from "react";

const LanguageNewsletter: React.FC = () => {
  return (
    <div className="w-full h-80 bg-gradient-to-r from-slate-200 to-emerald-300 flex items-center justify-center relative overflow-hidden">

      {/* Nội dung chính */}
      <div className="flex flex-col items-start gap-6 max-w-4xl px-6">
        {/* Tiêu đề */}
        <h2 className="text-3xl font-bold text-black font-['Inter'] leading-snug">
          Subscribe for Daily Language <br /> Learning Updates
        </h2>

        {/* Form nhập email */}
        <div className="flex items-center bg-white rounded-full w-[677px] h-14 shadow">
          <input
            type="email"
            placeholder="Enter Your Email"
            className="flex-1 bg-transparent outline-none px-6 text-gray-600 text-lg"
          />
          <button className="bg-teal-400 text-white font-bold text-sm px-6 py-2 rounded-3xl hover:bg-teal-500 transition">
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageNewsletter;
