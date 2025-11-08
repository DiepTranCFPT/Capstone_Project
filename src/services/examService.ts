import axiosInstance from "~/configs/axios";
    import type { AxiosResponse } from "axios";
    import type { ApiResponse } from "~/types/api";
import type {
  ExamTemplate,
  CreateExamTemplatePayload,
  UpdateExamTemplatePayload,
  CreateExamRulePayload,
  ExamRule,
  QuestionTopic,
  // ApiExam
} from "~/types/test"; // Đảm bảo bạn đã cập nhật file test.ts
    import type { PageInfo } from "~/types/pagination";

    // API trả về danh sách có phân trang
    type TemplateListResponse = ApiResponse<PageInfo<ExamTemplate>>;
    // API trả về chi tiết 1 template
    type TemplateDetailResponse = ApiResponse<ExamTemplate>;
    // API trả về chi tiết 1 rule
    type RuleDetailResponse = ApiResponse<ExamRule>;
    // API trả về danh sách question topics
    type QuestionTopicListResponse = ApiResponse<QuestionTopic[]>;
    // API trả về danh sách exams
    // type ExamListResponse = ApiResponse<PageInfo<ApiExam>>;
    // // API trả về chi tiết 1 exam
    // type ExamDetailResponse = ApiResponse<ApiExam>;

    const ExamTemplateService = {
      // === Template CRUD ===

      // GET /exam-templates
      getAllTemplates(
        params?: { pageNo?: number; pageSize?: number; keyword?: string }
      ): Promise<AxiosResponse<TemplateListResponse>> {
        return axiosInstance.get("/exam-templates", { params });
      },

      // GET /exam-templates/{id}
      getTemplateById(id: string): Promise<AxiosResponse<TemplateDetailResponse>> {
        return axiosInstance.get(`/exam-templates/${id}`);
      },

      // POST /exam-templates
      createTemplate(
        data: CreateExamTemplatePayload
      ): Promise<AxiosResponse<TemplateDetailResponse>> {
        return axiosInstance.post("/exam-templates", data);
      },

      // PUT /exam-templates/{id}
      updateTemplate(
        id: string,
        data: UpdateExamTemplatePayload
      ): Promise<AxiosResponse<TemplateDetailResponse>> {
        return axiosInstance.put(`/exam-templates/${id}`, data);
      },

      // DELETE /exam-templates/{id}
      deleteTemplate(id: string): Promise<AxiosResponse<ApiResponse<object>>> {
        return axiosInstance.delete(`/exam-templates/${id}`);
      },

      // === Rule CRUD ===

      // POST /exam-templates/{templateId}/rules
      addRuleToTemplate(
        templateId: string,
        data: CreateExamRulePayload
      ): Promise<AxiosResponse<RuleDetailResponse>> {
        return axiosInstance.post(`/exam-templates/${templateId}/rules`, data);
      },

      // PUT /exam-templates/rules/{ruleId}
      updateRule(
        ruleId: string,
        data: CreateExamRulePayload
      ): Promise<AxiosResponse<RuleDetailResponse>> {
        return axiosInstance.put(`/exam-templates/rules/${ruleId}`, data);
      },

      // DELETE /exam-templates/rules/{ruleId}
      deleteRule(ruleId: string): Promise<AxiosResponse<ApiResponse<object>>> {
        return axiosInstance.delete(`/exam-templates/rules/${ruleId}`);
      },

      // === Question Topics ===

      // GET /api/questions-topic
      getQuestionTopics(): Promise<AxiosResponse<QuestionTopicListResponse>> {
        return axiosInstance.get("/question-topics");
      },
    };

    export default ExamTemplateService;
