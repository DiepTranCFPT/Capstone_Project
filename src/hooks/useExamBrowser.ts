import { useCallback, useEffect, useState } from "react";
// import { toast } from "~/components/common/Toast";
import ExamTemplateService from "~/services/examService";
import type { ApiResponse } from "~/types/api";
import type { BrowseExamTemplateParams, ExamTemplate, MyExamTemplatePageData } from "~/types/test";

export const useBrowseExamTemplates = (
  initialParams: BrowseExamTemplateParams = {}
) => {
  const [templates, setTemplates] = useState<ExamTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái phân trang và filter
  const [params, setParams] = useState<BrowseExamTemplateParams>({
    pageNo: 1,
    pageSize: 10,
    sorts: 'createAt:desc',
    ...initialParams,
  });

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Xử lý lỗi chung
  const handleError = (err: unknown, defaultMessage: string) => {
    setLoading(false);
    const e = err as { response?: { data?: ApiResponse<unknown> } } & Error;
    const apiMessage = e.response?.data?.message;
    const message = apiMessage || e.message || defaultMessage;
    setError(message);
    // toast.error(message);
    return message;
  };

  // Hàm gọi API
  const fetchTemplates = useCallback(
    async (newParams: BrowseExamTemplateParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await ExamTemplateService.browseTemplates(newParams);

        if (res.data.code === 0 || res.data.code === 1000) {
          const pageData: MyExamTemplatePageData = res.data.data;
          setTemplates(pageData.items || []);
          setTotalElements(pageData.totalElement || 0);
          setTotalPages(pageData.totalPage || 0);
          setParams((prev) => ({
            ...prev,
            pageNo: pageData.pageNo || 1,
            pageSize: pageData.pageSize || 10,
          }));
        } else {
          throw new Error(res.data.message || "Failed to fetch browse templates");
        }
      } catch (err) {
        handleError(err, "Failed to fetch browse templates");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch dữ liệu lần đầu khi component mount
  useEffect(() => {
    fetchTemplates(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần lúc đầu

  /**
   * Hàm để set filter và gọi lại API
   */
  const applyFilters = useCallback(
    (filters: Omit<BrowseExamTemplateParams, "pageNo" | "pageSize">) => {
      // Create new params with only pageSize preserved, and merge with new filters
      const newParams: BrowseExamTemplateParams = {
        pageNo: 1,
        pageSize: params.pageSize || 10,
        ...filters, // Only include filters that are actually set
      };
      setParams(newParams);
      fetchTemplates(newParams);
    },
    [params.pageSize, fetchTemplates]
  );

  /**
   * Hàm để xử lý khi Ant Design Table thay đổi trang hoặc kích thước trang.
   * Antd pagination và API đều là 1-based.
   */
  const handlePageChange = (newPage: number, newSize: number) => {
    const newParams = { ...params, pageNo: newPage, pageSize: newSize };
    setParams(newParams);
    fetchTemplates(newParams);
  };

  return {
    templates,
    loading,
    error,
    pageNo: params.pageNo || 1, // API và UI đều dùng 1-based
    pageSize: params.pageSize || 10,
    totalElements,
    totalPages,
    filters: params, // Trả ra filter hiện tại
    fetchTemplates, // Hàm gọi lại API với params hiện tại
    applyFilters, // Hàm để set filter mới
    handlePageChange, // Hàm để component Table gọi khi thay đổi trang
  };
};
