import { useState, useCallback } from "react";
import { message } from "antd";
import type { ApiExam, CreateExamPayload } from "~/types/test";
import ExamService from "~/services/examService";

export const useExams = () => {
    const [exams, setExams] = useState<ApiExam[]>([]);
    const [currentExam, setCurrentExam] = useState<ApiExam | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Lấy tất cả các bài thi
     */
    const fetchAllExams = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await ExamService.getAllExams();
            if (res.data.code === 0 || res.data.code === 1000) {
                setExams(res.data.data);
            } else {
                throw new Error(res.data.message || "Failed to fetch exams");
            }
        } catch (err) {
            const e = err as Error;
            setError(e.message);
            message.error(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Lấy chi tiết một bài thi
     */
    const fetchExamById = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await ExamService.getExamById(id);
            if (res.data.code === 0 || res.data.code === 1000) {
                setCurrentExam(res.data.data);
            } else {
                throw new Error(res.data.message || "Failed to fetch exam details");
            }
        } catch (err) {
            const e = err as Error;
            setError(e.message);
            message.error(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Lấy các bài thi theo User ID
     */
    const fetchExamsByUserId = useCallback(async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await ExamService.getExamsByUserId(userId);
            if (res.data.code === 0 || res.data.code === 1000) {
                setExams(res.data.data);
            } else {
                throw new Error(res.data.message || "Failed to fetch user's exams");
            }
        } catch (err) {
            const e = err as Error;
            setError(e.message);
            message.error(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Tạo một bài thi mới
     */
    const createNewExam = useCallback(async (data: CreateExamPayload) => {
        setLoading(true);
        setError(null);
        try {
            const res = await ExamService.createExam(data);
            if (res.data.code === 0 || res.data.code === 1000) {
                message.success("Exam created successfully!");
                // Cập nhật lại danh sách exams (hoặc có thể chỉ cần thêm exam mới vào state)
                setExams((prev) => [...prev, res.data.data]);
            } else {
                throw new Error(res.data.message || "Failed to create exam");
            }
        } catch (err) {
            const e = err as Error;
            setError(e.message);
            message.error(e.message);
            throw e; // Ném lỗi ra để form có thể xử lý
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Xóa một bài thi
     */
    const removeExam = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await ExamService.deleteExam(id);
            if (res.data.code === 0 || res.data.code === 1000) {
                message.success("Exam deleted successfully!");
                // Xóa exam khỏi state
                setExams((prev) => prev.filter((exam) => exam.id !== id));
            } else {
                throw new Error(res.data.message || "Failed to delete exam");
            }
        } catch (err) {
            const e = err as Error;
            setError(e.message);
            message.error(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        exams,
        currentExam,
        loading,
        error,
        fetchAllExams,
        fetchExamById,
        fetchExamsByUserId,
        createNewExam,
        removeExam,
    };
};
