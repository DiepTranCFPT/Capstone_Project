import { useState, useEffect, useCallback } from "react";
import QuestionTopicService from "~/services/questionTopicService";
import type { QuestionTopic } from "~/types/questionTopic";
import type { PageInfo } from "~/types/pagination";
import type { QuestionTopicPayload } from "~/services/questionTopicService";
import { toast } from "~/components/common/Toast";

export const useQuestionTopics = () => {
  const [topics, setTopics] = useState<QuestionTopic[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<QuestionTopic> | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Lấy tất cả Topic (có phân trang)
  const fetchTopics = useCallback(
    async (params?: { pageNo?: number; pageSize?: number; keyword?: string; sorts?: string[] }) => {
      try {
        setLoading(true);
        const res = await QuestionTopicService.getAll(params);
        console.log("[useQuestionTopics] Full API Response:", res);
        console.log("[useQuestionTopics] Response.data:", res.data);

        let list: QuestionTopic[] = [];
        let extractedPageInfo: PageInfo<QuestionTopic> | null = null;

        // Handle different response formats
        // Case 1: Direct array response
        if (Array.isArray(res.data)) {
          list = res.data as QuestionTopic[];
          console.log("[useQuestionTopics] Direct array response, count:", list.length);
        }
        // Case 2: Direct object with items field (PageInfo at root)
        else if (res.data && typeof res.data === "object" && "items" in res.data && Array.isArray(res.data.items)) {
          const page = res.data as unknown as PageInfo<QuestionTopic>;
          list = page.items || [];
          extractedPageInfo = page;
          console.log("[useQuestionTopics] Direct items array, count:", list.length);
        }
        // Case 3: Wrapped in ApiResponse with data field
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
            extractedPageInfo = page;
            console.log("[useQuestionTopics] ApiResponse<PageInfo>, count:", list.length);
          }
        }
        // Case 4: ApiResponse format but check structure
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
        console.log("[useQuestionTopics] PageInfo:", extractedPageInfo);
        setTopics(list);
        setPageInfo(extractedPageInfo);
        return { items: list, pageInfo: extractedPageInfo };
      } catch (error) {
        // Ensure topics is always an array even on error
        setTopics([]);
        setPageInfo(null);
        toast.error("Failed to load topics!");
        console.error("[useQuestionTopics] Error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Lấy Topic của giáo viên đang đăng nhập
  const fetchMyTopics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await QuestionTopicService.getMyTopics();
      const list = res.data?.data || res.data || [];
      setTopics(list);
      return list;
    } catch (error) {
      setTopics([]);
      toast.error("Failed to load your topics!");
      console.error("[useQuestionTopics] fetchMyTopics Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy Topic theo SubjectId
  const fetchTopicsBySubject = useCallback(async (subjectId: string, params?: { pageNo?: number; pageSize?: number }) => {
    try {
      setLoading(true);
      // Use large pageSize to get all topics for the subject
      const queryParams = { pageSize: 1000, ...params };
      const res = await QuestionTopicService.getBySubjectId(subjectId, queryParams);
      const list = res.data?.data || res.data || [];
      setTopics(list);
      return list;
    } catch (error) {
      setTopics([]);
      toast.error("Failed to load topics by subject!");
      console.error("[useQuestionTopics] fetchTopicsBySubject Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo Topic mới
  const createTopic = useCallback(
    async (data: QuestionTopicPayload | Record<string, unknown>) => {
      try {
        setLoading(true);
        const res = await QuestionTopicService.create(data);
        const newTopic = res.data?.data || res.data;
        toast.success("Create topic successfully!");
        // Refresh topics list
        await fetchTopics();
        return newTopic;
      } catch (error) {
        toast.error("Failed to create topic!");
        console.error("[useQuestionTopics] createTopic Error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchTopics]
  );

  // Cập nhật Topic
  const updateTopic = useCallback(
    async (
      topicId: string,
      data: Partial<QuestionTopic> | Record<string, unknown>
    ) => {
      try {
        setLoading(true);
        const res = await QuestionTopicService.update(topicId, data);
        const updatedTopic = res.data?.data || res.data;
        toast.success("Update topic successfully!");
        // Refresh topics list
        await fetchTopics();
        return updatedTopic;
      } catch (error) {
        toast.error("Failed to update topic!");
        console.error("[useQuestionTopics] updateTopic Error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchTopics]
  );

  // Xóa Topic
  const deleteTopic = useCallback(
    async (topicId: string) => {
      try {
        setLoading(true);
        const res = await QuestionTopicService.delete(topicId);
        toast.success("Delete topic successfully!");
        // Refresh topics list
        await fetchTopics();
        return res.data?.data || res.data;
      } catch (error) {
        toast.error("Failed to delete topic!");
        console.error("[useQuestionTopics] deleteTopic Error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchTopics]
  );

  useEffect(() => {
    fetchTopics({ pageSize: 1000 });
  }, [fetchTopics]);

  return {
    topics,
    pageInfo,
    loading,
    fetchTopics,
    fetchMyTopics,
    fetchTopicsBySubject,
    createTopic,
    updateTopic,
    deleteTopic,
  };
};

export default useQuestionTopics;
