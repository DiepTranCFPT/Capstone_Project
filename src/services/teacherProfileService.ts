import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type {
    TeacherProfilePayload,
    TeacherProfileData,
    UnverifiedTeacherProfile
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
     * GET /api/teacher-profiles/unverified
     */
    getUnverifiedProfiles(): Promise<AxiosResponse<ApiResponse<UnverifiedTeacherProfile[]>>> {
        return axiosInstance.get("/api/teacher-profile/unverified");
    },
};

export default TeacherProfileService;