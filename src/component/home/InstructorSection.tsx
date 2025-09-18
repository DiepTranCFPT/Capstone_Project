import React from "react";

const instructors = [
  { name: "Jack Son", role: "Online Teachers", img: "https://placehold.co/208x221" },
  { name: "Jack Son", role: "Online Teachers", img: "https://placehold.co/208x221" },
  { name: "Jack Son", role: "Online Teachers", img: "https://placehold.co/208x221" },
  { name: "Jack Son", role: "Online Teachers", img: "https://placehold.co/208x221" },
];

const InstructorSection: React.FC = () => {
  return (
    <div className="w-full py-16 bg-gradient-to-l from-slate-200 to-white flex flex-col items-center">
      {/* Tiêu đề nhỏ */}
      <div className="flex items-center gap-2 bg-white border border-black/20 rounded-full px-4 py-2 mb-4">
        <div className="w-8 h-8 bg-slate-300/60 rounded-full flex items-center justify-center">
          <img src="https://placehold.co/27x25" alt="icon" className="w-7 h-6 rounded-full" />
        </div>
        <span className="text-black text-base">Our instructors</span>
      </div>

      {/* Tiêu đề lớn */}
      <h2 className="text-black text-3xl font-bold mb-10 text-center">
        Explore Our World's Best Courses
      </h2>

      {/* Danh sách instructor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {instructors.map((ins, index) => (
          <div
            key={index}
            className="bg-white rounded-[10px] overflow-hidden shadow hover:shadow-lg transition"
          >
            <img src={ins.img} alt={ins.name} className="w-full h-56 object-cover" />
            <div className="p-3 text-center">
              <p className="text-black text-xl font-semibold">{ins.name}</p>
              <p className="text-teal-700 text-xs">{ins.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorSection;
