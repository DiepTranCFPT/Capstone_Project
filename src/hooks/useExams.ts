import { useState, useCallback } from "react";
import { message } from "antd";
import ExamTemplateService from "~/services/examService";
import type {
  ExamTemplate,
  CreateExamTemplatePayload,
  UpdateExamTemplatePayload,
  CreateExamRulePayload,
  ApiExam,
} from "~/types/test";
import type { PageInfo } from "~/types/pagination";
import type { ApiResponse } from "~/types/api";
import { toast } from "~/components/common/Toast";


    export const useExamTemplates = () => {
      const [templates, setTemplates] = useState<ExamTemplate[]>([]);
      const [currentTemplate, setCurrentTemplate] = useState<ExamTemplate | null>(null);
      const [pageInfo, setPageInfo] = useState<PageInfo<ExamTemplate> | null>(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);

      const handleError = (err: unknown, defaultMessage: string) => {
        setLoading(false);
        const e = err as { response?: { data?: ApiResponse<unknown> } } & Error;
        const apiMessage = e.response?.data?.message;
        setError(apiMessage || e.message || defaultMessage);
        toast.error(apiMessage || defaultMessage);
      };

      // --- Template Functions ---

      const fetchAllTemplates = useCallback(async (params?: { pageNo?: number; pageSize?: number; keyword?: string }) => {
        setLoading(true);
        setError(null);
        try {
          const res = await ExamTemplateService.getAllTemplates(params);
          if (res.data.code === 0 || res.data.code === 1000) {
            setTemplates(res.data.data.items || []);
            setPageInfo(res.data.data);
          } else {
            throw new Error(res.data.message || "Failed to fetch templates");
          }
        } catch (err) {
          handleError(err, "Không thể tải danh sách khuôn mẫu");
        } finally {
          setLoading(false);
        }
      }, []);

      const fetchTemplateById = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
          const res = await ExamTemplateService.getTemplateById(id);
          if (res.data.code === 0 || res.data.code === 1000) {
            setCurrentTemplate(res.data.data);
          } else {
            throw new Error(res.data.message || "Failed to fetch template details");
          }
        } catch (err) {
          handleError(err, "Không thể tải chi tiết khuôn mẫu");
        } finally {
          setLoading(false);
        }
      }, []);

      const createNewTemplate = useCallback(
        async (data: CreateExamTemplatePayload) => {
          setLoading(true);
          setError(null);
          try {
            const res = await ExamTemplateService.createTemplate(data);
            if (res.data.code === 0 || res.data.code === 1000) {
              toast.success("Tạo khuôn mẫu thành công!");
              // Cập nhật lại danh sách (hoặc có thể điều hướng)
              fetchAllTemplates(); 
              return res.data.data; // Trả về template đã tạo
            } else {
              throw new Error(res.data.message || "Failed to create template");
            }
          } catch (err) {
            handleError(err, "Tạo khuôn mẫu thất bại");
            throw err;
          } finally {
            setLoading(false);
          }
        },
        [fetchAllTemplates]
      );

      const updateTemplateDetails = useCallback(
        async (id: string, data: UpdateExamTemplatePayload) => {
          setLoading(true);
          setError(null);
          try {
            const res = await ExamTemplateService.updateTemplate(id, data);
            if (res.data.code === 0 || res.data.code === 1000) {
              toast.success("Cập nhật thông tin thành công!");
              setCurrentTemplate(res.data.data); // Cập nhật template hiện tại
            } else {
              throw new Error(res.data.message || "Failed to update template");
            }
          } catch (err) {
            handleError(err, "Cập nhật thất bại");
            throw err;
          } finally {
            setLoading(false);
          }
        },
        []
      );

      const removeTemplate = useCallback(
        async (id: string) => {
          setLoading(true);
          setError(null);
          try {
            const res = await ExamTemplateService.deleteTemplate(id);
            if (res.data.code === 0 || res.data.code === 1000) {
              toast.success("Xóa khuôn mẫu thành công!");
              setTemplates((prev) => prev.filter((t) => t.id !== id));
            } else {
              throw new Error(res.data.message || "Failed to delete template");
            }
          } catch (err) {
            handleError(err, "Xóa thất bại");
          } finally {
            setLoading(false);
          }
        },
        []
      );

      // --- Rule Functions ---

      const addRule = useCallback(
        async (templateId: string, data: CreateExamRulePayload) => {
          setLoading(true);
          try {
            const res = await ExamTemplateService.addRuleToTemplate(templateId, data);
            if (res.data.code === 0 || res.data.code === 1000) {
              toast.success("Thêm quy tắc thành công!");
              // Tải lại chi tiết template để cập nhật danh sách rules
              fetchTemplateById(templateId);
            } else {
              throw new Error(res.data.message || "Failed to add rule");
            }
          } catch (err) {
            handleError(err, "Thêm quy tắc thất bại");
          } finally {
            setLoading(false);
          }
        },
        [fetchTemplateById]
      );

      const updateRule = useCallback(
        async (templateId: string, ruleId: string, data: CreateExamRulePayload) => {
           setLoading(true);
          try {
            const res = await ExamTemplateService.updateRule(ruleId, data);
            if (res.data.code === 0 || res.data.code === 1000) {
              toast.success("Cập nhật quy tắc thành công!");
              fetchTemplateById(templateId); // Tải lại template cha
            } else {
              throw new Error(res.data.message || "Failed to update rule");
            }
          } catch (err) {
            handleError(err, "Cập nhật quy tắc thất bại");
          } finally {
            setLoading(false);
          }
        },
        [fetchTemplateById]
      );

      const removeRule = useCallback(
        async (templateId: string, ruleId: string) => {
          setLoading(true);
          try {
            const res = await ExamTemplateService.deleteRule(ruleId);
            if (res.data.code === 0 || res.data.code === 1000) {
              toast.success("Xóa quy tắc thành công!");
              fetchTemplateById(templateId); // Tải lại template cha
            } else {
              throw new Error(res.data.message || "Failed to delete rule");
            }
          } catch (err) {
            handleError(err, "Xóa quy tắc thất bại");
          } finally {
            setLoading(false);
          }
        },
        [fetchTemplateById]
      );

      return {
        templates,
        currentTemplate,
        pageInfo,
        loading,
        error,
        fetchAllTemplates,
        fetchTemplateById,
        createNewTemplate,
        updateTemplateDetails,
        removeTemplate,
        addRule,
        updateRule,
        removeRule,
      };
    };

    // Hook for student exam functionality (uses active templates as exams)
    export const useExams = () => {
      const [exams, setExams] = useState<ApiExam[]>([]);
      const [currentExam, setCurrentExam] = useState<ApiExam | null>(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);

      const handleError = (err: unknown, defaultMessage: string) => {
        setLoading(false);
        const e = err as { response?: { data?: ApiResponse<unknown> } } & Error;
        const apiMessage = e.response?.data?.message;
        setError(apiMessage || e.message || defaultMessage);
        message.error(apiMessage || defaultMessage);
      };

      // Convert ExamTemplate to ApiExam format
      const convertTemplateToExam = (template: ExamTemplate): ApiExam => ({
        id: template.id,
        title: template.title,
        description: template.description,
        subject: template.subject,
        duration: template.duration,
        passingScore: template.passingScore,
        isActive: template.isActive,
        createdBy: template.createdBy,
        createdAt: template.createdAt,
        rules: template.rules.map(rule => ({
          id: rule.id,
          topic: rule.topicName,
          difficulty: rule.difficultyName,
          questionType: rule.questionType,
          numberOfQuestions: rule.numberOfQuestions,
          points: rule.points
        })),
        averageRating: template.averageRating,
        totalRatings: template.totalRatings,
        totalTakers: template.totalTakers
      });

      const fetchAllExams = useCallback(async (params?: { pageNo?: number; pageSize?: number; keyword?: string }) => {
        setLoading(true);
        setError(null);
        try {
          const res = await ExamTemplateService.getAllTemplates(params);
          if (res.data.code === 0 || res.data.code === 1000) {
            // Filter only active templates and convert to ApiExam format
            const activeTemplates = (res.data.data.items || []).filter((template: ExamTemplate) => template.isActive);
            const examData = activeTemplates.map(convertTemplateToExam);
            setExams(examData);
          } else {
            throw new Error(res.data.message || "Failed to fetch exams");
          }
        } catch (err) {
          handleError(err, "Không thể tải danh sách bài thi");
        } finally {
          setLoading(false);
        }
      }, []);

      const fetchExamById = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
          const res = await ExamTemplateService.getTemplateById(id);
          if (res.data.code === 0 || res.data.code === 1000) {
            const examData = convertTemplateToExam(res.data.data);
            setCurrentExam(examData);
          } else {
            throw new Error(res.data.message || "Failed to fetch exam details");
          }
        } catch (err) {
          handleError(err, "Không thể tải chi tiết bài thi");
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
      };
    };
