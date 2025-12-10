import React from "react";
import { useNavigate } from "react-router-dom";
import { FaChalkboardTeacher } from "react-icons/fa";
import { useTeachersList } from "~/hooks/useTeachersList";
import { useAuth } from "~/hooks/useAuth";

const InstructorSection: React.FC = () => {
  const { teachers, loading } = useTeachersList({ pageNo: 0, pageSize: 10 });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleTeacherClick = (teacherId: string) => {
    if (!isAuthenticated) {
      // Redirect to login page if user is not authenticated
      // navigate("/login", { state: { from: `/teacher-detail/${teacherId}` } });
      return;
    }
    navigate(`/teacher-detail/${teacherId}`);
  };

  if (loading) {
    return (
      <div className="w-full py-16 bg-gradient-to-l from-slate-200 to-white flex items-center justify-center">
        <p className="text-xl">Loading instructors...</p>
      </div>
    );
  }

  return (
    <div className="w-full py-8 md:py-16 px-4 md:px-6 bg-gradient-to-l from-slate-200 to-white flex flex-col items-center">
      {/* Tiêu đề nhỏ */}
      <div className="flex items-center gap-2 bg-white border border-black/20 rounded-full px-3 md:px-4 py-1.5 md:py-2 mb-3 md:mb-4">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-slate-300/60 rounded-full flex items-center justify-center">
          <FaChalkboardTeacher className="text-teal-600 text-sm md:text-base" />
        </div>
        <span className="text-black text-sm md:text-base">Our Instructors</span>
      </div>

      {/* Tiêu đề lớn */}
      <h2 className="text-black text-xl md:text-3xl font-bold mb-6 md:mb-10 text-center">
        Meet Our Expert Teachers
      </h2>

      {/* Danh sách instructor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 w-full max-w-6xl">
        {teachers.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-white rounded-full p-8 shadow-lg mb-6">
              <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Instructors Available</h3>
            <p className="text-gray-500 text-center max-w-md">
              We're currently building our team of expert teachers. Check back soon!
            </p>
          </div>
        ) : (
          teachers.map((teacher) => (
            <div
              key={teacher.id}
              onClick={() => handleTeacherClick(teacher.id)}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer transform hover:-translate-y-1"
            >
              {/* Avatar */}
              <div className="w-full h-56 bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center overflow-hidden">
                {teacher.imgUrl ? (
                  <img
                    src={teacher.imgUrl}
                    alt={`${teacher.firstName} ${teacher.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl font-bold text-teal-600">
                    {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 text-center">
                <p className="text-black text-lg font-semibold mb-1">
                  {teacher.firstName} {teacher.lastName}
                </p>
                <p className="text-teal-600 text-sm font-medium">Teacher</p>
                {teacher.teacherProfile?.specialization && (
                  <p className="text-gray-500 text-xs mt-1">
                    {teacher.teacherProfile.specialization}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InstructorSection;
