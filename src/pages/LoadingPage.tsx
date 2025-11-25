import React from "react";
import { Link } from "react-router-dom";

const LoadingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50 px-6 py-16">
      <div className="max-w-5xl w-full flex flex-col items-center text-center space-y-10">
        {/* Badge */}
        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/90 shadow border border-teal-100">
          <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
            <img
              src="/education_6041280.png"
              alt="AP LMS"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="text-left">
            <p className="text-xs uppercase tracking-widest text-teal-500 font-semibold">
              AP Learning Platform
            </p>
            <p className="text-sm text-gray-600">Đang chuẩn bị nội dung cho bạn</p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            Mọi thứ đã sẵn sàng,
            <span className="text-teal-500"> chỉ còn chờ bạn!</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Chúng tôi đang tải dữ liệu học tập, bài giảng và trải nghiệm tương tác
            tốt nhất. Đừng tắt trang nhé – việc này chỉ mất vài giây.
          </p>
        </div>

        {/* Loader Section */}
        <div className="w-full max-w-3xl bg-white/80 backdrop-blur rounded-3xl border border-teal-100 shadow-lg p-10">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-[6px] border-teal-100"></div>
              <div className="absolute inset-0 rounded-full border-[6px] border-t-teal-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <div className="absolute inset-6 rounded-full bg-gradient-to-br from-white to-teal-50 flex items-center justify-center shadow-inner">
                <span className="text-sm font-semibold text-teal-600">AP LMS</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-800">Đang tải…</p>
              <p className="text-sm text-gray-500">
                Kích hoạt lớp học, đồng bộ tài liệu, chuẩn bị bảng điều khiển cá nhân.
              </p>
            </div>

            <div className="w-full bg-teal-100 rounded-full h-3 overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-teal-400 via-teal-500 to-blue-400 loading-shimmer" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <button className="px-6 py-3 rounded-full border border-teal-200 text-teal-600 font-semibold hover:bg-white transition">
            Kiểm tra kết nối
          </button>
          <Link
            to="/"
            className="px-8 py-3 rounded-full bg-teal-500 text-white font-semibold shadow hover:bg-teal-600 transition"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;

