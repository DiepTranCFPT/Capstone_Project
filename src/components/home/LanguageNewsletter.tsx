import React from "react";

const LanguageNewsletter: React.FC = () => {
  return (
    <div className="w-full min-h-64 md:h-80 py-8 md:py-0 bg-gradient-to-r from-slate-200 to-emerald-300 flex items-center justify-center relative overflow-hidden px-4 md:px-6">

      {/* Nội dung chính */}
      <div className="flex flex-col items-center md:items-start gap-4 md:gap-6 max-w-4xl w-full">
        {/* Tiêu đề */}
        <h2 className="text-xl md:text-3xl font-bold text-black font-['Inter'] leading-snug text-center md:text-left">
          Subscribe for Daily Language <br className="hidden md:block" />Learning Updates
        </h2>

        {/* Form nhập email */}
        <div className="flex flex-col sm:flex-row items-center bg-white rounded-2xl sm:rounded-full w-full max-w-[677px] shadow overflow-hidden">
          <input
            type="email"
            placeholder="Enter Your Email"
            className="flex-1 w-full bg-transparent outline-none px-4 md:px-6 py-3 md:py-4 text-gray-600 text-base md:text-lg"
          />
          <button className="w-full sm:w-auto bg-teal-400 text-white font-bold text-sm md:text-base px-6 py-3 md:py-2 sm:rounded-3xl hover:bg-teal-500 transition whitespace-nowrap">
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageNewsletter;

