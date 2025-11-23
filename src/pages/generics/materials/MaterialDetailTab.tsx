import React, { useEffect, useState } from "react";
import { Tabs, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import type { Material } from "~/types/material";
import { useMaterialRegister } from "~/hooks/useMaterialRegister";
import UserService from "~/services/userService";
import type { User } from "~/types/user";

interface MaterialDetailTabProps {
  material: Material;
}

const MaterialDetailTab: React.FC<MaterialDetailTabProps> = ({ material }) => {
  const { register, loading, error } = useMaterialRegister();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState<User | null>(null);
  const [loadingInstructor, setLoadingInstructor] = useState(false);

  // Fetch thông tin instructor
  useEffect(() => {
    const fetchInstructor = async () => {
      if (!material.authorId) return;
      
      setLoadingInstructor(true);
      try {
        const response = await UserService.getUserProfile(material.authorId);
        if (response.data) {
          setInstructor(response.data);
        }
      } catch (err) {
        console.error("Lỗi khi lấy thông tin instructor:", err);
        // Nếu API lỗi, vẫn hiển thị thông tin cơ bản từ material
        // Không set instructor để fallback về hiển thị authorName
      } finally {
        setLoadingInstructor(false);
      }
    };

    fetchInstructor();
  }, [material.authorId]);

  const handleRegister = async () => {
    try {
      await register(material.id);
      message.success("Đăng ký tài liệu thành công!");
      // Chuyển đến trang học sau khi đăng ký thành công
      setTimeout(() => {
        navigate(`/materials/${material.id}/learn`);
      }, 1000);
    } catch (err: unknown) {
      // Kiểm tra nếu đã đăng ký rồi (code 1033)
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const axiosError = err as { 
          response?: { 
            data?: { 
              message?: string; 
              error?: string;
              code?: number;
            };
            status?: number;
          } 
        };
        
        // Nếu đã đăng ký rồi, chuyển đến trang học luôn
        if (axiosError.response?.data?.code === 1033 || 
            axiosError.response?.data?.message?.includes("already registered")) {
          message.info("Bạn đã đăng ký khóa học này rồi. Đang chuyển đến trang học...");
          setTimeout(() => {
            navigate(`/materials/${material.id}/learn`);
          }, 500);
          return;
        }
        
        // Xử lý các lỗi khác
        let errorMessage = "Đã xảy ra lỗi khi đăng ký tài liệu.";
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.response?.status === 400) {
          errorMessage = "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
        } else if (axiosError.response?.status === 401) {
          errorMessage = "Bạn cần đăng nhập để đăng ký tài liệu.";
        } else if (axiosError.response?.status === 403) {
          errorMessage = "Bạn không có quyền thực hiện thao tác này.";
        }
        message.error(errorMessage);
      } else if (error) {
        message.error(error);
      } else {
        message.error("Đã xảy ra lỗi khi đăng ký tài liệu.");
      }
    }
  };
  return (
    <div className="bg-white rounded-xl shadow p-4">
      {/* Hình ảnh + tiêu đề */}
      <img
        src={material.image}
        alt={material.title}
        className="w-full h-60 object-cover rounded-lg mb-4"
      />
      <h2 className="text-xl font-semibold mb-2">{material.title}</h2>
      <p className="text-gray-500 mb-4">
        {material.topic} • {material.subject}
      </p>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: "overview",
            label: "Overview",
            children: (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 mb-4">{material.description}</p>

                <h3 className="text-lg font-semibold mb-2">What Will You Learn?</h3>
                <p className="text-gray-600 mb-4">
                  Quickly synergize cutting-edge scenarios and professional
                  results. Assertively deliver cross-media results before
                  client-centric results. Uniquely initiate intuitive communities
                  through process-centric internal or "organic" sources.
                </p>
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-40 bg-teal-400 hover:bg-teal-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white border-0 rounded-xl h-12 font-semibold"
                >
                  {loading ? "Đang xử lý..." : "Register Now"}
                </button>
              </div>
            ),
          },
          {
            key: "instructor",
            label: "Instructor",
            children: (
              <div>
                {loadingInstructor ? (
                  <div className="flex justify-center items-center py-8">
                    <Spin size="large" />
                  </div>
                ) : instructor ? (
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <img
                        src={instructor.imgUrl || "https://placehold.co/150x150"}
                        alt={`${instructor.firstName} ${instructor.lastName}`}
                        className="w-32 h-32 rounded-full object-cover border-4 border-teal-100"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://placehold.co/150x150";
                        }}
                      />
                    </div>
                    
                    {/* Thông tin */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {instructor.firstName} {instructor.lastName}
                      </h3>
                      {instructor.roles && instructor.roles.length > 0 && (
                        <p className="text-teal-600 font-semibold mb-3">
                          {instructor.roles.map(role => {
                            const roleNames: Record<string, string> = {
                              'TEACHER': 'Giáo viên',
                              'ADMIN': 'Quản trị viên',
                              'STUDENT': 'Học sinh',
                              'ACADEMIC_ADVISOR': 'Cố vấn học tập',
                              'PARENT': 'Phụ huynh'
                            };
                            return roleNames[role] || role;
                          }).join(', ')}
                        </p>
                      )}
                      {instructor.email && (
                        <p className="text-gray-600 mb-2">
                          <span className="font-medium">Email:</span> {instructor.email}
                        </p>
                      )}
                      {material.authorName && (
                        <p className="text-gray-600 mb-4">
                          <span className="font-medium">Tên hiển thị:</span> {material.authorName}
                        </p>
                      )}
                      {instructor.dob && (
                        <p className="text-gray-600">
                          <span className="font-medium">Ngày sinh:</span>{" "}
                          {new Date(instructor.dob).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar placeholder */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 rounded-full bg-teal-100 flex items-center justify-center border-4 border-teal-200">
                        <span className="text-4xl font-bold text-teal-600">
                          {material.authorName ? material.authorName.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Thông tin cơ bản từ material */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {material.authorName || "Người tạo"}
                      </h3>
                      <p className="text-teal-600 font-semibold mb-3">Giáo viên</p>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "reviews",
            label: "Reviews",
            children: <p>Reviews will go here...</p>,
          },
        ]}
      />
    </div>
  );
};

export default MaterialDetailTab;

