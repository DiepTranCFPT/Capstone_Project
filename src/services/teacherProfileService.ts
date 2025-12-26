import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type {
    TeacherProfilePayload,
    TeacherProfileData,
    UnverifiedTeacherProfile,
    VerificationRequest,
    AiReviewResponse
} from "~/types/teacherProfile";

const TeacherProfileService = {
    /**
     * Tạo hồ sơ giáo viên mới
     * POST /api/teacher-profiles
     */
    createProfile(
        data: TeacherProfilePayload
    ): Promise<AxiosResponse<ApiResponse<TeacherProfileData>>> {
        return axiosInstance.post("/api/teacher-profile", data);
    },

    /**
     * Cập nhật hồ sơ giáo viên của tôi
     * PUT /api/teacher-profiles/me
     */
    updateMyProfile(
        id: string,
        data: TeacherProfilePayload
    ): Promise<AxiosResponse<ApiResponse<TeacherProfileData>>> {
        return axiosInstance.put(`/api/teacher-profile/${id}`, data);
    },

    /**
     * Xác thực hồ sơ giáo viên (Admin/Manager)
     * PUT /api/teacher-profiles/{id}/verify
     */
    verifyProfile(
        id: string
    ): Promise<AxiosResponse<ApiResponse<TeacherProfileData>>> {
        return axiosInstance.put(`/api/teacher-profile/${id}/verify`);
    },

    /**
     * Lấy danh sách hồ sơ giáo viên chưa được xác thực
     * GET /api/teacher-profile/teacher/unverify
     */
    getUnverifiedProfiles(): Promise<AxiosResponse<ApiResponse<UnverifiedTeacherProfile[]>>> {
        return axiosInstance.get("/api/teacher-profile/teacher/unverify");
    },

    /**
     * Gửi yêu cầu xác thực hồ sơ giáo viên
     * POST /api/teacher-profile/request/verify/teacher
     */
    requestVerification(): Promise<AxiosResponse<ApiResponse<VerificationRequest>>> {
        return axiosInstance.post("/api/teacher-profile/request/verify/teacher");
    },

    /**
     * Lấy đánh giá AI cho hồ sơ giáo viên
     * POST /api/teacher-profile/{userId}/ai-review
     */
    getAiReview(userId: string): Promise<AxiosResponse<ApiResponse<AiReviewResponse>>> {
        return axiosInstance.post(`/api/teacher-profile/${userId}/ai-review`);
    },

    /**
     * Lấy yêu cầu xác thực hiện tại của teacher
     * GET /api/teacher-profile/request/current
     */
    getCurrentVerificationRequest(): Promise<AxiosResponse<ApiResponse<VerificationRequest[]>>> {
        return axiosInstance.get("/api/teacher-profile/request/current");
    },
};

export default TeacherProfileService;