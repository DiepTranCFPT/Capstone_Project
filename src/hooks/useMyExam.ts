import { useCallback, useEffect, useState } from "react";
import { toast } from "~/components/common/Toast";
import ExamTemplateService from "~/services/examService";
import type { ApiResponse } from "~/types/api";
import type { ExamTemplate, MyExamTemplatePageData } from "~/types/test";

/**
 * Hook để lấy danh sách "my-templates" (các bài thi của tôi)
 */
export const useMyExamTemplates = () => {
  const [templates, setTemplates] = useState<ExamTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái phân trang (lưu ý: API dùng 0-based index)
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Xử lý lỗi chung
  const handleError = (err: unknown, defaultMessage: string) => {
    setLoading(false);
    const e = err as { response?: { data?: ApiResponse<unknown> } } & Error;
    const apiMessage = e.response?.data?.message;
    const message = apiMessage || e.message || defaultMessage;
    setError(message);
    toast.error(message);
    return message;
  };

  // Hàm gọi API
  const fetchMyTemplates = useCallback(
    async (currentPage = pageNo, currentSize = pageSize) => {
      setLoading(true);
      setError(null);
      try {
        const params = { pageNo: currentPage, pageSize: currentSize };
        const res = await ExamTemplateService.getMyTemplates(params);

        if (res.data.code === 0 || res.data.code === 1000) {
          const pageData: MyExamTemplatePageData = res.data.data;
          setTemplates(pageData.items || []);
          setTotalElements(pageData.totalElement || 0);
          setTotalPages(pageData.totalPage || 0);
          setPageNo(pageData.pageNo || 0);
          setPageSize(pageData.pageSize || 10);
        } else {
          throw new Error(res.data.message || "Failed to fetch my templates");
        }
      } catch (err) {
        handleError(err, "Failed to fetch my templates");
      } finally {
        setLoading(false);
      }
    },
    [pageNo, pageSize]
  ); // Phụ thuộc vào state để gọi lại khi state thay đổi (nếu cần)

  // Fetch dữ liệu lần đầu khi component mount
  useEffect(() => {
    fetchMyTemplates(0, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần lúc đầu

  /**
   * Hàm để xử lý khi Ant Design Table thay đổi trang hoặc kích thước trang.
   * Antd pagination là 1-based, nên ta trừ 1.
   */
  const handlePageChange = (newPage: number, newSize: number) => {
    fetchMyTemplates(newPage - 1, newSize);
  };

  return {
    templates,
    loading,
    error,
    pageNo: pageNo + 1, // Chuyển 0-based (API) sang 1-based (cho Antd Table)
    pageSize,
    totalElements,
    totalPages,
    fetchMyTemplates,
    handlePageChange, // Hàm để component Table gọi khi thay đổi trang
  };
};