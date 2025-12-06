import React, { useEffect, useState, useMemo } from "react";
import { Tabs, message, Spin, Empty, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import type { Material } from "~/types/material";
import { useMaterialRegister } from "~/hooks/useMaterialRegister";
import { useRegisteredMaterials } from "~/hooks/useRegisteredMaterials";
import { useAuth } from "~/hooks/useAuth";
import UserService from "~/services/userService";
import type { User } from "~/types/user";
import MaterialThumbnail from "~/components/common/MaterialThumbnail";
import { useLesson } from "~/hooks/useLesson";
import type { Lesson } from "~/types/lesson";
import { PlayCircleOutlined, FileTextOutlined, ClockCircleOutlined } from "@ant-design/icons";

interface MaterialDetailTabProps {
  material: Material;
}

const MaterialDetailTab: React.FC<MaterialDetailTabProps> = ({ material }) => {
  const { register, loading, error } = useMaterialRegister();
  const navigate = useNavigate();
  const { user, spendTokens } = useAuth();
  const [instructor, setInstructor] = useState<User | null>(null);
  const [loadingInstructor, setLoadingInstructor] = useState(false);
  const { getLessonsByLearningMaterial, loading: lessonsLoading } = useLesson();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const { materials: registeredMaterials, refetch: refetchRegisteredMaterials } = useRegisteredMaterials();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [localRegisteredIds, setLocalRegisteredIds] = useState<string[]>(() => {
    // Initialize from localStorage as backup
    try {
      const stored = localStorage.getItem('registeredMaterials');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  // Helper function to save registered material ID to localStorage (as backup)
  const saveRegisteredMaterialId = (materialId: string) => {
    try {
      if (!localRegisteredIds.includes(materialId)) {
        const updated = [...localRegisteredIds, materialId];
        setLocalRegisteredIds(updated);
        localStorage.setItem('registeredMaterials', JSON.stringify(updated));
        console.log("✅ Saved material ID to localStorage:", materialId, "Updated list:", updated);
      } else {
        console.log("ℹ️ Material ID already in localStorage:", materialId);
      }
    } catch (error) {
      console.error('Failed to save registered material ID to localStorage:', error);
    }
  };
  
  // Check if this material is already registered
  // Priority: API response > localStorage (backup)
  // Use useMemo to ensure it recalculates when dependencies change
  const isRegistered = useMemo(() => {
    const isRegisteredFromAPI = registeredMaterials.some((m) => m.id === material.id);
    const isRegisteredFromStorage = localRegisteredIds.includes(material.id);
    const result = isRegisteredFromAPI || isRegisteredFromStorage;
    
    console.log("🔍 Registration status check:", {
      materialId: material.id,
      isRegisteredFromAPI,
      isRegisteredFromStorage,
      result,
      registeredMaterialsCount: registeredMaterials.length,
      localRegisteredIds: localRegisteredIds,
    });
    
    return result;
  }, [material.id, registeredMaterials, localRegisteredIds]);

  // Fetch thông tin instructor
  useEffect(() => {
    const fetchInstructor = async () => {
      if (!material.authorId) {
        setLoadingInstructor(false);
        return;
      }
      
      setLoadingInstructor(true);
      try {
        const response = await UserService.getUserProfile(material.authorId);
        if (response?.data) {
          setInstructor(response.data);
        }
      } catch (err) {
        // Chỉ log lỗi nếu không phải 400 (Bad Request) - có thể do user không tồn tại
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status !== 400) {
          console.warn("Không thể lấy thông tin instructor:", err);
        }
        // Nếu API lỗi, vẫn hiển thị thông tin cơ bản từ material
        // Không set instructor để fallback về hiển thị authorName
      } finally {
        setLoadingInstructor(false);
      }
    };

    fetchInstructor();
  }, [material.authorId]);

  // Helper để sort lesson: ưu tiên field `order`, sau đó đến `createdAt` (bài tạo trước đứng trước)
  const sortLessons = (lessonList: Lesson[]): Lesson[] => {
    return [...lessonList].sort((a, b) => {
      const orderDiff = (a.order || 0) - (b.order || 0);
      if (orderDiff !== 0) return orderDiff;

      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aTime - bTime;
    });
  };

  // Fetch lessons
  useEffect(() => {
    if (material?.id) {
      getLessonsByLearningMaterial(material.id)
        .then((lessonList) => {
          const sorted = sortLessons(lessonList);
          setLessons(sorted);
        })
        .catch((err) => {
          console.warn("Không thể lấy danh sách bài học:", err);
          setLessons([]);
        });
    }
  }, [material?.id, getLessonsByLearningMaterial]);

  const handleRegister = () => {
    console.log("🟢 Register button clicked for material:", material.id);
    setConfirmVisible(true);
  };

  const handleConfirmRegister = async () => {
    console.log("🟢 Confirm register clicked for material:", material.id);

    // Chỉ kiểm tra đăng nhập, không tự check/trừ token ở FE
    if (!user) {
      message.error("Bạn cần đăng nhập để đăng ký tài liệu.");
      setConfirmVisible(false);
      navigate("/auth");
      return;
    }

    try {
      setConfirmLoading(true);
      console.log("🔄 Calling API /learning-materials/register with id:", material.id);

      const result = await register(material.id);
      console.log("✅ Registration API successful, result:", result);

      // Lưu local để đồng bộ UI
      saveRegisteredMaterialId(material.id);

      message.success("Đăng ký tài liệu thành công!");

      // Thử refetch danh sách đã đăng ký
      try {
        await refetchRegisteredMaterials();
      } catch (apiError) {
        console.warn("⚠️ Failed to refresh registered materials from API:", apiError);
      }

      setConfirmVisible(false);

      // Điều hướng sang trang học
      setTimeout(() => {
        navigate(`/materials/${material.id}/learn`);
      }, 500);
    } catch (err: unknown) {
      console.log("❌ Registration failed in handleConfirmRegister:", err);

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
        
        // Nếu đã đăng ký rồi
        if (
          axiosError.response?.data?.code === 1033 ||
          axiosError.response?.data?.message?.includes("already registered")
        ) {
          saveRegisteredMaterialId(material.id);

          try {
            await refetchRegisteredMaterials();
          } catch (apiError) {
            console.warn("⚠️ Failed to refresh from API after already-registered error:", apiError);
          }

          message.info("Bạn đã đăng ký khóa học này rồi.");
          setConfirmVisible(false);
          return;
        }

        // Các lỗi khác: để backend quyết định (bao gồm không đủ token)
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
    } finally {
      setConfirmLoading(false);
    }
  };
  return (
    <div className="bg-white">
      {/* Hình ảnh */}
      <div className="w-full mb-8 overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
        <MaterialThumbnail
          source={material.thumbnail || material.fileImage || material.image}
          width="100%"
          height={400}
          roundedClass="rounded-xl"
          className="w-full"
          fit="cover"
        />
      </div>

      {/* Meta information */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            {material.typeName || material.topic || "Material"}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {material.subjectName || material.subject || "N/A"}
          </span>
          {material.price !== undefined && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              material.price === 0 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-orange-50 text-orange-700 border border-orange-200"
            }`}>
              {material.price === 0 ? "Free" : new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(material.price)}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="overview"
        className="material-detail-tabs"
        size="large"
        items={[
          {
            key: "overview",
            label: "Overview",
            children: (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed text-base">{material.description}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">What Will You Learn?</h3>
                  <p className="text-gray-700 leading-relaxed text-base">
                    Quickly synergize cutting-edge scenarios and professional
                    results. Assertively deliver cross-media results before
                    client-centric results. Uniquely initiate intuitive communities
                    through process-centric internal or "organic" sources.
                  </p>
                </div>
                
                <div className="pt-4">
                  {isRegistered ? (
                    <button
                      onClick={() => navigate(`/materials/${material.id}/learn`)}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      Continue Learning
                    </button>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={loading}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white border-0 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                    >
                      {loading ? "Đang xử lý..." : "Register Now"}
                    </button>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: "instructor",
            label: "Instructor",
            children: (
              <div>
                {loadingInstructor ? (
                  <div className="flex justify-center items-center py-12">
                    <Spin size="large" />
                  </div>
                ) : instructor ? (
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <img
                          src={instructor.imgUrl || "https://placehold.co/150x150"}
                          alt={`${instructor.firstName} ${instructor.lastName}`}
                          className="w-36 h-36 rounded-2xl object-cover border-4 border-teal-100 shadow-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://placehold.co/150x150";
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Thông tin */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {instructor.firstName} {instructor.lastName}
                        </h3>
                        {instructor.roles && instructor.roles.length > 0 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-teal-50 text-teal-700 border border-teal-200">
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
                          </span>
                        )}
                      </div>
                      {instructor.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{instructor.email}</span>
                        </div>
                      )}
                      {material.authorName && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{material.authorName}</span>
                        </div>
                      )}
                      {instructor.dob && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {new Date(instructor.dob).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar placeholder */}
                    <div className="flex-shrink-0">
                      <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center border-4 border-teal-200 shadow-lg">
                        <span className="text-5xl font-bold text-teal-700">
                          {material.authorName ? material.authorName.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Thông tin cơ bản từ material */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {material.authorName || "Người tạo"}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                        Giáo viên
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "lessons",
            label: `Lessons (${lessons.length})`,
            children: (
              <div>
                {lessonsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Spin size="large" />
                  </div>
                ) : lessons.length === 0 ? (
                  <Empty
                    description="Chưa có bài học nào trong khóa học này"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div className="space-y-3">
                    {lessons.map((lesson, index) => {
                      const hasVideo = !!(lesson.video || lesson.url);
                      const hasFile = !!lesson.file;
                      const duration = lesson.duration 
                        ? `${Math.floor(lesson.duration / 60)}:${(lesson.duration % 60).toString().padStart(2, '0')}`
                        : null;

                      return (
                        <div
                          key={lesson.id}
                          className="group border border-gray-200 rounded-lg p-4 hover:border-teal-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={() => navigate(`/materials/${material.id}/learn?lesson=${lesson.id}`)}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-200">
                              <span className="text-teal-700 font-bold text-sm">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <h4 className="text-base font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                                  {lesson.title || lesson.name || `Bài ${index + 1}`}
                                </h4>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {hasVideo && (
                                    <Tag icon={<PlayCircleOutlined />} color="blue">
                                      Video
                                    </Tag>
                                  )}
                                  {hasFile && (
                                    <Tag icon={<FileTextOutlined />} color="green">
                                      File
                                    </Tag>
                                  )}
                                </div>
                              </div>
                              {lesson.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {lesson.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {duration && (
                                  <span className="flex items-center gap-1">
                                    <ClockCircleOutlined />
                                    {duration}
                                  </span>
                                )}
                                <span className="text-gray-400">Click để xem chi tiết</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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

      {/* Custom confirm modal */}
      {confirmVisible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Xác nhận đăng ký tài liệu
            </h3>
            <p className="text-sm text-gray-700 mb-5">
              {material.price && material.price > 0
                ? `Tài liệu này có giá ${new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  }).format(material.price)}. Số tiền này sẽ được trừ khỏi tài khoản của bạn. Bạn có chắc chắn muốn đăng ký?`
                : "Bạn có chắc chắn muốn đăng ký tài liệu này?"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmVisible(false)}
                disabled={confirmLoading}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmRegister}
                disabled={confirmLoading}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 text-sm font-semibold disabled:opacity-60"
              >
                {confirmLoading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialDetailTab;

