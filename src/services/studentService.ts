import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { UpdateStudentProfileRequest, UpdateStudentProfileResponse } from "~/types/user";

const StudentService = {
    /**
     * Lấy mã kết nối để phụ huynh liên kết
     * GET /students/connection-code
     */
    getConnectionCode: (): Promise<AxiosResponse<ApiResponse<string>>> => {
        return axiosInstance.get("/students/connection-code");
    },

    /**
     * Cập nhật thông tin học sinh
     * PUT /students/me
     */
    updateStudentProfile: (data: UpdateStudentProfileRequest): Promise<AxiosResponse<UpdateStudentProfileResponse>> => {
        return axiosInstance.put("/students/me", data);
    },
};

export default StudentService;