import React from "react";

const categories = [
  "All Categories",
  "Business",
  "Development",
  "Marketing",
  "Design",
  "Data Science",
  "Arts & Design",
];

const courses = [
  {
    id: 1,
    title:
      "Cultural Perspectives in Teaching and Learning Environments",
    price: "$59.00",
    free: true,
    lessons: 8,
    students: 50,
    views: "12k",
    image: "https://placehold.co/247x176",
  },
  {
    id: 2,
    title:
      "Cultural Perspectives in Teaching and Learning Environments",
    price: "$59.00",
    free: true,
    lessons: 8,
    students: 50,
    views: "12k",
    image: "https://placehold.co/247x176",
  },
  {
    id: 3,
    title: "Innovative Instructional Strategies for Enhancing Student",
    price: "$59.00",
    free: true,
    lessons: 8,
    students: 50,
    views: "12k",
    image: "https://placehold.co/247x176",
  },
];

const FeaturedMaterials: React.FC = () => {
  return (
    <div className="w-full bg-white py-16">
      {/* Header */}
      <div className="flex justify-center items-center mb-4">
        <div className="flex items-center space-x-3 border border-black/20 rounded-[30px] px-6 py-2 bg-white">
          <div className="w-8 h-8 bg-slate-300/60 rounded-full flex items-center justify-center">
            <img
              src="https://placehold.co/27x25"
              alt="arrow"
              className="w-5 h-5 rotate-12"
            />
          </div>
          <span className="text-black font-normal">Top Class Materials</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-center mb-8">
        Explore Featured Materials
      </h2>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map((cat, index) => (
          <button
            key={cat}
            className={`px-6 py-2 rounded-[30px] border ${
              index === 0
                ? "bg-teal-400 text-white font-medium"
                : "bg-white border-black/20 text-black"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Courses */}
      <div className="flex justify-center gap-8 flex-wrap">
        {courses.map((course) => (
          <div
            key={course.id}
            className="w-72 bg-white rounded-[10px] shadow border border-black/20 p-4 flex flex-col"
          >
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-44 object-cover rounded-[10px] mb-4"
            />
            <span className="text-xs font-bold text-teal-700 bg-slate-200 px-3 py-1 rounded-[20px] w-fit">
              {course.free ? "Free" : course.price}
            </span>
            <h3 className="text-sm font-bold mt-3 mb-2">{course.title}</h3>
            <div className="flex text-[10px] text-black/50 space-x-4 mb-4">
              <span>Lesson {course.lessons}</span>
              <span>Student {course.students}</span>
              <span>View: {course.views}</span>
            </div>
            <div className="flex justify-between items-center mt-auto">
              <span className="text-[10px] font-semibold">{course.price}</span>
              <button className="text-[10px] px-3 py-1 border border-black/10 rounded-[10px]">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-12">
        <button className="w-11 h-11 bg-teal-400 rounded-[5px] flex items-center justify-center text-white font-bold">
          &gt;
        </button>
      </div>
    </div>
  );
};

export default FeaturedMaterials;
