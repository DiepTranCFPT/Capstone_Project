import { useState, useCallback } from "react";
import { message } from "antd";
import QuestionService from "~/services/QuestionService";
import type { QuestionBankItem, NewQuestion } from "~/types/question";

export const useQuestionBank = () => {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Lấy tất cả câu hỏi (phân trang, tìm kiếm)
  const fetchQuestions = useCallback(async (params?: {
    pageNo?: number;
    pageSize?: number;
    keyword?: string;
  }) => {
    try {
      setLoading(true);
      const res = await QuestionService.getAll(params);
      setQuestions(res.data?.data?.items || []); // getAll trả về PageInfo
    } catch (error) {
      message.error("Không thể tải danh sách câu hỏi!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Lấy chi tiết câu hỏi
  const getQuestionById = useCallback(async (id: string) => {
    try {
      const res = await QuestionService.getById(id);
      return res.data?.data;
    } catch (error) {
      message.error("Không thể tải thông tin câu hỏi!");
      console.error(error);
    }
  }, []);

  // 🔹 Tạo mới
  const createQuestion = useCallback(async (data: NewQuestion) => {
    try {
      const res = await QuestionService.create(data);
      message.success("Tạo câu hỏi thành công!");
      return res.data?.data;
    } catch (error) {
      message.error("Tạo câu hỏi thất bại!");
      console.error(error);
    }
  }, []);

  // 🔹 Cập nhật
  const updateQuestion = useCallback(
    async (id: string, data: Partial<QuestionBankItem>) => {
      try {
        const res = await QuestionService.update(id, data);
        message.success("Cập nhật câu hỏi thành công!");
        return res.data?.data;
      } catch (error) {
        message.error("Cập nhật câu hỏi thất bại!");
        console.error(error);
      }
    },
    []
  );

  // 🔹 Xóa
  const deleteQuestion = useCallback(async (id: string) => {
    try {
      await QuestionService.delete(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      message.success("Xóa câu hỏi thành công!");
    } catch (error) {
      message.error("Xóa câu hỏi thất bại!");
      console.error(error);
    }
  }, []);

  // 🔹 Lấy theo chủ đề (topicId)
  const fetchByTopicId = useCallback(async (topicId: string) => {
    try {
      setLoading(true);
      const res = await QuestionService.getByTopicId(topicId);
      setQuestions(res.data?.data || []); // trả về mảng trực tiếp
    } catch (error) {
      message.error("Không thể tải câu hỏi theo chủ đề!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Lấy theo môn học (subjectId)
  const fetchBySubjectId = useCallback(async (subjectId: string) => {
    try {
      setLoading(true);
      const res = await QuestionService.getBySubjectId(subjectId);
      setQuestions(res.data?.data || []); // trả về mảng trực tiếp
    } catch (error) {
      message.error("Không thể tải câu hỏi theo môn học!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Lấy theo userId (thay cho teacherId)
  const fetchByUserId = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const res = await QuestionService.getByUserId(userId);
      setQuestions(res.data?.data || []); // trả về mảng trực tiếp
    } catch (error) {
      message.error("Không thể tải câu hỏi theo người dùng!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    questions,
    loading,
    fetchQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    fetchByUserId,
    fetchByTopicId,
    fetchBySubjectId,
  };
};

export default useQuestionBank;
