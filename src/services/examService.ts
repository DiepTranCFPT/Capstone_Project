import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type {
  ExamTemplate,
  CreateExamTemplatePayload,
  UpdateExamTemplatePayload,
  CreateExamRulePayload,
  ExamRule,
  MyExamTemplateResponse,
  BrowseExamTemplateParams,
  ExamRatingsResponse,
  ExamRatingsQueryParams,
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
// API trả về danh sách my templates
type MyTemplateListResponse = MyExamTemplateResponse;
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

  // GET /exam-templates/my-templates
  getMyTemplates(
    params?: { pageNo?: number; pageSize?: number; sorts?: string[] }
  ): Promise<AxiosResponse<MyTemplateListResponse>> {
    return axiosInstance.get("/exam-templates/my-templates", { params });
  },

  // GET /exam-templates/browse
  browseTemplates(
    params?: BrowseExamTemplateParams
  ): Promise<AxiosResponse<MyTemplateListResponse>> {
    return axiosInstance.get("/exam-templates/browse", { params });
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

  // === Ratings ===

  // GET /exam-templates/ratings/{id}: Lấy danh sách ratings của một exam template
  getTemplateRatings(
    templateId: string,
    params?: ExamRatingsQueryParams
  ): Promise<AxiosResponse<ExamRatingsResponse>> {
    return axiosInstance.get(`/exam-templates/ratings/${templateId}`, { params });
  },

  // === AI Analysis ===

  // POST /ai/analyze-template: Phân tích template bằng AI
  analyzeTemplate(
    data: CreateExamTemplatePayload
  ): Promise<AxiosResponse<string>> {
    return axiosInstance.post("/ai/analyze-template", data);
  },

};

export default ExamTemplateService;
