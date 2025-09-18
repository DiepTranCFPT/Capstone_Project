import React from "react";

const exams = [
  {
    title: "Data Science & AI Exam",
    total: "Total 5 Exams",
    img: "https://placehold.co/255x181",
  },
  {
    title: "Music & Arts Exam",
    total: "Total 5 Exams",
    img: "https://placehold.co/255x181",
  },
  {
    title: "Business Management Exam",
    total: "Total 5 Exams",
    img: "https://placehold.co/255x181",
  },
];

const ExamsSection: React.FC = () => {
  return (
    <div className="w-full py-16 bg-gradient-to-r from-slate-100 to-white flex flex-col items-center">
      {/* Tiêu đề nhỏ */}
      <div className="flex items-center gap-2 bg-white border border-black/20 rounded-full px-4 py-2 mb-4">
        <div className="w-8 h-8 bg-slate-300/60 rounded-full flex items-center justify-center">
          <img src="https://placehold.co/27x25" alt="icon" className="w-7 h-6 rounded-full" />
        </div>
        <span className="text-black text-base">Free Exams</span>
      </div>

      {/* Tiêu đề lớn */}
      <h2 className="text-black text-3xl font-bold mb-10 text-center">
        Explore 150 Free Online Exams
      </h2>

      {/* Danh sách exams */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {exams.map((exam, index) => (
          <div
            key={index}
            className="bg-zinc-300 rounded-[10px] shadow-md hover:shadow-lg transition overflow-hidden w-80 h-72 flex flex-col items-center justify-center"
          >
            <img
              src={exam.img}
              alt={exam.title}
              className="w-64 h-44 object-cover rounded-[10px] mb-4"
            />
            <p className="text-black text-xl font-bold">{exam.title}</p>
            <p className="text-black/50 text-base">{exam.total}</p>
          </div>
        ))}
      </div>

      {/* Nút điều hướng (trái & phải) */}
      <div className="flex justify-between w-full max-w-6xl mt-10 px-4">
        <button className="w-12 h-12 flex items-center justify-center bg-emerald-700 text-white rounded-full">
          ←
        </button>
        <button className="w-12 h-12 flex items-center justify-center bg-emerald-700 text-white rounded-full">
          →
        </button>
      </div>
    </div>
  );
};

export default ExamsSection;
