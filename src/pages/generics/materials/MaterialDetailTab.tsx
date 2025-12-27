import React, { useEffect, useState, useMemo } from "react";
import { Tabs, Spin, Empty, Tag } from "antd";
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
import { useLearningMaterialRatings } from "~/hooks/useLearningMaterialRatings";
import { FaStar } from "react-icons/fa";
import type { LearningMaterialRating } from "~/types/learningMaterialRating";
import { toast } from "~/components/common/Toast";

interface MaterialDetailTabProps {
  material: Material;
}

// Extended rating type với studentName (có thể có từ API)
interface RatingWithStudentName extends LearningMaterialRating {
  studentName?: string;
  userName?: string;
  userId?: string; 
  student?: {
    firstName?: string;
    lastName?: string;
    id?: string;
  };
  user?: {
    firstName?: string;
    lastName?: string;
    id?: string;
  };
}

const MaterialDetailTab: React.FC<MaterialDetailTabProps> = ({ material }) => {
  const { register, loading, error } = useMaterialRegister();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [instructor, setInstructor] = useState<User | null>(null);
  const [loadingInstructor, setLoadingInstructor] = useState(false);
  const { getLessonsByLearningMaterial, loading: lessonsLoading } = useLesson();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const { materials: registeredMaterials, refetch: refetchRegisteredMaterials } = useRegisteredMaterials();
  const {
    ratings,
    statistics,
    loading: ratingsLoading,
    error: ratingsError,
    fetchRatingsByMaterial,
    fetchStatisticsByMaterial,
    totalElements,
    totalPages,
    currentPage,
  } = useLearningMaterialRatings();
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
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  
  // Helper function to save registered material ID to localStorage (as backup)
  const saveRegisteredMaterialId = (materialId: string) => {
    try {
      if (!localRegisteredIds.includes(materialId)) {
        const updated = [...localRegisteredIds, materialId];
        setLocalRegisteredIds(updated);
        localStorage.setItem('registeredMaterials', JSON.stringify(updated));
        console.log("Saved material ID to localStorage:", materialId, "Updated list:", updated);
      } else {
        console.log("ℹ Material ID already in localStorage:", materialId);
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
    
    console.log(" Registration status check:", {
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
          console.warn("Unable to fetch instructor information:", err);
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
          console.warn("Unable to fetch lesson list:", err);
          setLessons([]);
        });
    }
  }, [material?.id, getLessonsByLearningMaterial]);

  // Fetch ratings và statistics
  useEffect(() => {
    if (material?.id) {
      fetchRatingsByMaterial(material.id, 0, 10, "createdAt", "DESC");
      fetchStatisticsByMaterial(material.id);
    }
  }, [material?.id, fetchRatingsByMaterial, fetchStatisticsByMaterial]);

  // Helper function để render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? "text-yellow-400" : "text-gray-300"}
            size={16}
          />
        ))}
      </div>
    );
  };

  // Helper function để lấy tên người đánh giá
  const getStudentName = (rating: RatingWithStudentName): string => {
    if (rating.studentName?.trim()) return rating.studentName.trim();
    if (rating.userName?.trim()) return rating.userName.trim();
    
    if (rating.student?.firstName || rating.student?.lastName) {
      const name = `${rating.student.firstName || ''} ${rating.student.lastName || ''}`.trim();
      if (name) return name;
    }
    
    if (rating.user?.firstName || rating.user?.lastName) {
      const name = `${rating.user.firstName || ''} ${rating.user.lastName || ''}`.trim();
      if (name) return name;
    }
    
    const userId = rating.studentId || rating.userId;
    if (userId && studentNames[userId]) {
      return studentNames[userId];
    }
    
    return "Học sinh";
  };

  // Fetch tên học sinh từ studentId hoặc userId nếu chưa có
  useEffect(() => {
    const fetchStudentNames = async () => {
      if (ratings.length === 0) return;
      
      const ratingsToFetch = ratings.filter((rating) => {
        const ratingWithName = rating as RatingWithStudentName;
        const userId = rating.studentId || ratingWithName.userId;
        
        if (!userId) return false;
        
        const hasNameInRating = !!(
          ratingWithName.studentName ||
          ratingWithName.userName ||
          ratingWithName.student?.firstName ||
          ratingWithName.user?.firstName
        );
        
        return !hasNameInRating && !studentNames[userId];
      });

      if (ratingsToFetch.length === 0) return;

      const fetchPromises = ratingsToFetch.map(async (rating) => {
        const ratingWithName = rating as RatingWithStudentName;
        const userId = rating.studentId || ratingWithName.userId;
        
        if (!userId) return;
        
        try {
          const response = await UserService.getUserProfile(userId);
          
          if (response?.data) {
            const fullName = `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim();
            
            if (fullName) {
              setStudentNames((prev) => {
                if (prev[userId]) return prev;
                return {
                  ...prev,
                  [userId]: fullName,
                };
              });
            }
          }
        } catch {
          // Ignore errors
        }
      });

      await Promise.all(fetchPromises);
    };

    fetchStudentNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratings]);

  const handleRegister = () => {
    console.log("🟢 Register button clicked for material:", material.id);
    setConfirmVisible(true);
  };

  const handleConfirmRegister = async () => {
    console.log("🟢 Confirm register clicked for material:", material.id);

    // Chỉ kiểm tra đăng nhập, không tự check/trừ token ở FE
    if (!user) {
      toast.error("You need to log in to register for the material.");
      setConfirmVisible(false);
      navigate("/auth");
      return;
    }

    try {
      setConfirmLoading(true);
      console.log(" Calling API /learning-materials/register with id:", material.id);

      const result = await register(material.id);
      console.log(" Registration API successful, result:", result);

      // Lưu local để đồng bộ UI
      saveRegisteredMaterialId(material.id);

      // Thử refetch danh sách đã đăng ký
      try {
        await refetchRegisteredMaterials();
      } catch (apiError) {
        console.warn(" Failed to refresh registered materials from API:", apiError);
      }

      setConfirmVisible(false);

      // Hiển thị toast thông báo thành công
      toast.success("Successfully registered for the material!");

      // Điều hướng sang trang học sau khi toast hiển thị
      setTimeout(() => {
        navigate(`/materials/${material.id}/learn`);
      }, 1500);
    } catch (err: unknown) {
      console.log(" Registration failed in handleConfirmRegister:", err);

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

          toast.info("You have already registered for this course.");
          setConfirmVisible(false);
          return;
        }

        // Các lỗi khác: để backend quyết định (bao gồm không đủ token)
        let errorMessage = "An error occurred while registering for the material.";
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.response?.status === 400) {
          errorMessage = "Invalid request. Please check your information.";
        } else if (axiosError.response?.status === 401) {
          errorMessage = "You need to log in to register for the material.";
        } else if (axiosError.response?.status === 403) {
          errorMessage = "You do not have permission to perform this action.";
        }
        toast.error(errorMessage);
      } else if (error) {
        toast.error(error);
      } else {
        toast.error("An error occurred while registering for the material.");
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
            children: (
              <div>
                {/* Statistics Section */}
                {statistics && (
                  <div className="mb-8 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 border border-teal-200">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="flex items-center gap-2 mb-2">
                            {renderStars(Math.round(statistics.averageRating))}
                            <span className="text-3xl font-bold text-gray-800">
                              {statistics.averageRating.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            ({statistics.totalRatings} {statistics.totalRatings === 1 ? 'đánh giá' : 'đánh giá'})
                          </p>
                        </div>
                      </div>
                      <div className="text-center md:text-right">
                        <p className="text-2xl font-bold text-teal-700 mb-1">
                          {statistics.totalRatings}
                        </p>
                        <p className="text-sm text-gray-600">
                          Tổng số đánh giá
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ratings List */}
                {ratingsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Spin size="large" />
                  </div>
                ) : ratingsError ? (
                  <div className="text-center py-12">
                    <p className="text-red-500">{ratingsError}</p>
                  </div>
                ) : ratings.length === 0 ? (
                  <Empty
                    description="Chưa có đánh giá nào cho tài liệu này"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div className="space-y-4">
                    {ratings.map((rating) => {
                      const ratingWithName = rating as RatingWithStudentName;
                      const displayName = getStudentName(ratingWithName);
                      
                      return (
                        <div
                          key={rating.id}
                          className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-grow">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-gray-800">
                                  {displayName}
                                </h4>
                              </div>
                              {renderStars(rating.rating)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {rating.createdAt
                                ? new Date(rating.createdAt).toLocaleDateString("vi-VN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : ""}
                            </div>
                          </div>

                          {rating.comment && (
                            <p className="text-gray-700 mb-3 leading-relaxed">
                              {rating.comment}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {/* Pagination Info */}
                    {totalPages > 1 && (
                      <div className="mt-6 text-center text-gray-600">
                        <p>
                          Hiển thị {ratings.length} trong tổng số {totalElements} đánh giá (Trang {currentPage + 1} / {totalPages})
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Custom confirm modal */}
      {confirmVisible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Confirm Material Registration
            </h3>
            <p className="text-sm text-gray-700 mb-5">
              {material.price && material.price > 0
                ? `This material costs ${new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  }).format(material.price)}. This amount will be deducted from your account. Are you sure you want to register?`
                : "Are you sure you want to register this material?"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmVisible(false)}
                disabled={confirmLoading}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRegister}
                disabled={confirmLoading}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 text-sm font-semibold disabled:opacity-60"
              >
                {confirmLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialDetailTab;

