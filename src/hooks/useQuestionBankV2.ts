import { useState, useCallback, useEffect } from "react";
import { message } from "antd";
import type { QuestionV2, QuestionV2PaginationResponse } from "~/types/question";
import QuestionService from "~/services/QuestionService";

export type SortOrder = 'createAt:desc' | 'createAt:asc';

export const useQuestionBankV2 = (questionType?: 'mcq' | 'frq') => {
  const [questions, setQuestions] = useState<QuestionV2[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sorts, setSorts] = useState<SortOrder[]>(['createAt:desc']); // Default sort by newest

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params: { pageNo: number; pageSize: number; type?: string; sorts?: string } = {
        pageNo,
        pageSize,
        sorts: sorts[0], // Send as single string, not array
      };
      if (questionType) {
        params.type = questionType;
      }
      const res = await QuestionService.getAllV2(params);

      if (res.data.code === 1000 || res.data.code === 0) {
        const data: QuestionV2PaginationResponse = res.data.data;
        console.log('useQuestionBankV2 - API Response:', data);
        setQuestions(data.items);
        setTotal(data.totalElement);
        setTotalPages(data.totalPage);
      } else {
        console.error('useQuestionBankV2 - API Error:', res.data);
        message.error(res.data.message || "Failed to fetch questions");
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      message.error("Unable to load questions list");
    } finally {
      setLoading(false);
    }
  }, [pageNo, pageSize, questionType, sorts]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    total,
    totalPages,
    pageNo,
    setPageNo,
    pageSize,
    setPageSize,
    sorts,
    setSorts,
    fetchQuestions,
  };
};
