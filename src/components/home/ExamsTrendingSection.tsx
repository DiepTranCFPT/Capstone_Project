import React from "react";

const exams = [
  {
    title: "IT and Software Examination for Career Advancement",
    img: "https://placehold.co/303x194",
  },
  {
    title: "Comprehensive English Proficiency Test for Academic",
    img: "https://placehold.co/303x194",
  },
  {
    title: "Global Standardized Language Proficiency Exam",
    img: "https://placehold.co/303x194",
  },
];

const ExamsTrendingSection: React.FC = () => {
  return (
    <div className="w-full bg-zinc-200 relative overflow-hidden py-20">
      {/* background shapes */}
      <img
        src="https://placehold.co/602x527"
        alt="bg-shape"
        className="absolute right-0 bottom-0 opacity-40 rotate-180"
      />
      <img
        src="https://placehold.co/447x391"
        alt="bg-shape"
        className="absolute left-0 bottom-0 opacity-40"
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* badge */}
        <div className="flex items-center gap-2 bg-white border border-black/20 rounded-full px-4 py-2 inline-flex mb-4">
          <div className="w-7 h-7 bg-slate-300/60 rounded-full flex items-center justify-center">
            <img src="https://placehold.co/24x25" alt="icon" className="w-5 h-5" />
          </div>
          <span className="text-black text-sm">Free Exams</span>
        </div>

        {/* heading + arrows */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-black text-3xl font-bold max-w-xl">
            Explore New and Trending Online Exams
          </h2>
          <div className="flex gap-4">
            <button className="w-12 h-12 flex items-center justify-center bg-white rounded-full border-2 border-teal-400 text-teal-400">
              ←
            </button>
            <button className="w-12 h-12 flex items-center justify-center bg-white rounded-full border-2 border-teal-400 text-teal-400">
              →
            </button>
          </div>
        </div>

        {/* exam cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exams.map((exam, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col items-center p-4 hover:shadow-lg transition"
            >
              <img
                src={exam.img}
                alt={exam.title}
                className="w-72 h-48 object-cover rounded-lg mb-4"
              />
              <p className="text-black text-lg font-bold text-center mb-4">
                {exam.title}
              </p>
              <button className="bg-teal-400 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-teal-500 transition">
                Explore Exam Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamsTrendingSection;
