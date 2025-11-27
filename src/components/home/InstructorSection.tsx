import React, { useEffect, useState } from "react";
import { FaChalkboardTeacher } from "react-icons/fa";
import UserService from "~/services/userService";
import type { User } from "~/types/user";

const InstructorSection: React.FC = () => {
  const [instructors, setInstructors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInstructors = async () => {
      setLoading(true);
      try {
        const response = await UserService.getUsers({        
          pageNo: 0,
          pageSize: 10
        });

        if (response.code === 0 || response.code === 1000) {
          setInstructors(response.data.items.filter((user) => user.roles.includes("TEACHER")));
          console.log('Instructors',instructors);
        }
      } catch (error) {
        console.error("Failed to fetch instructors", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-16 bg-gradient-to-l from-slate-200 to-white flex items-center justify-center">
        <p className="text-xl">Loading instructors...</p>
      </div>
    );
  }

  return (
    <div className="w-full py-16 bg-gradient-to-l from-slate-200 to-white flex flex-col items-center">
      {/* Tiêu đề nhỏ */}
      <div className="flex items-center gap-2 bg-white border border-black/20 rounded-full px-4 py-2 mb-4">
        <div className="w-8 h-8 bg-slate-300/60 rounded-full flex items-center justify-center">
          <FaChalkboardTeacher className="text-teal-600" />
        </div>
        <span className="text-black text-base">Our Instructors</span>
      </div>

      {/* Tiêu đề lớn */}
      <h2 className="text-black text-3xl font-bold mb-10 text-center">
        Meet Our Expert Teachers
      </h2>

      {/* Danh sách instructor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl">
        {instructors.length === 0 ? (
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
          instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Avatar */}
              <div className="w-full h-56 bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center overflow-hidden">
                {instructor.imgUrl ? (
                  <img
                    src={instructor.imgUrl}
                    alt={`${instructor.firstName} ${instructor.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl font-bold text-teal-600">
                    {instructor.firstName.charAt(0)}{instructor.lastName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 text-center">
                <p className="text-black text-lg font-semibold mb-1">
                  {instructor.firstName} {instructor.lastName}
                </p>
                <p className="text-teal-600 text-sm font-medium">Teacher</p>
                {instructor.teacherProfile?.specialization && (
                  <p className="text-gray-500 text-xs mt-1">
                    {instructor.teacherProfile.specialization}
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
