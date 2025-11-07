import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import QuestionService from "~/services/QuestionService";
import type { QuestionTopic} from "~/types/questionTopic";
import type { PageInfo } from "~/types/pagination";

export const useQuestionTopics = () => {
  const [topics, setTopics] = useState<QuestionTopic[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<QuestionTopic> | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const fetchTopics = useCallback(
    async (params?: { pageNo?: number; pageSize?: number; keyword?: string }) => {
      try {
        setLoading(true);
        const res = await QuestionService.getAllTopics(params);
        console.log("[useQuestionTopics] Full API Response:", res);
        console.log("[useQuestionTopics] Response.data:", res.data);
        
        let list: QuestionTopic[] = [];
        
        // Handle different response formats
        // Case 1: Direct array response
        if (Array.isArray(res.data)) {
          list = res.data as QuestionTopic[];
          console.log("[useQuestionTopics] Direct array response, count:", list.length);
        }
        // Case 2: Wrapped in ApiResponse with data field
        else if (res.data?.data) {
          const data = res.data.data;
          // Check if data.data is an array
          if (Array.isArray(data)) {
            list = data as QuestionTopic[];
            console.log("[useQuestionTopics] ApiResponse<Array>, count:", list.length);
          }
          // Check if data.data is PageInfo
          else if (data && typeof data === "object" && ("items" in data || "content" in data)) {
            const page = data as PageInfo<QuestionTopic>;
            list = (page.items || page.content || []) as QuestionTopic[];
            setPageInfo(page);
            console.log("[useQuestionTopics] ApiResponse<PageInfo>, count:", list.length);
          }
        }
        // Case 3: ApiResponse format but check structure
        else if (res.data && typeof res.data === "object" && "data" in res.data) {
          const innerData = (res.data as { data: unknown }).data;
          if (Array.isArray(innerData)) {
            list = innerData as QuestionTopic[];
            console.log("[useQuestionTopics] Nested ApiResponse<Array>, count:", list.length);
          }
        } else {
          console.warn("[useQuestionTopics] Unexpected response format:", res.data);
        }
        
        console.log("[useQuestionTopics] Final topics list:", list);
        setTopics(list);
      } catch (error) {
        message.error("Không thể tải danh sách chủ đề câu hỏi!");
        console.error("[useQuestionTopics] Error:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTopics({ pageSize: 1000 });
  }, [fetchTopics]);

  return {
    topics,
    pageInfo,
    loading,
    fetchTopics,
  };
};

export default useQuestionTopics;

