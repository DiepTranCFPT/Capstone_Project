import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { ApiExam, CreateExamPayload } from "~/types/test";

const ExamService = {

    getAllExams(): Promise<AxiosResponse<ApiResponse<ApiExam[]>>> {
        return axiosInstance.get("/api/exams");
    },

    getExamById(id: string): Promise<AxiosResponse<ApiResponse<ApiExam>>> {
        return axiosInstance.get("/api/exam", { params: { id } });
    },

    getExamsByUserId(userId: string): Promise<AxiosResponse<ApiResponse<ApiExam[]>>> {
        return axiosInstance.get(`/api/user/${userId}`);
    },

    createExam(data: CreateExamPayload): Promise<AxiosResponse<ApiResponse<ApiExam>>> {
        return axiosInstance.post("/api/exam", data);
    },

    deleteExam(id: string): Promise<AxiosResponse<ApiResponse<object>>> {
        return axiosInstance.delete(`/api/exam/${id}`);
    },
};

export default ExamService;
