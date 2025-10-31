import { useState, useCallback, useEffect } from "react";
import { message } from "antd";
import type { QuestionBankItem, NewQuestion } from "~/types/question";
import type { PageInfo } from "~/types/pagination";
import QuestionService from "~/services/QuestionService";

export const useQuestionBank = (teacherId?: string) => {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  // Ensure different backend field shapes map to our UI type
  type MaybeName = string | { name?: string } | undefined;
  interface RawQuestion {
    id?: string;
    questionId?: string;
    uuid?: string;
    text?: string;
    questionText?: string;
    content?: string;
    subject?: MaybeName;
    subjectName?: string;
    topic?: string | { name?: string };
    topicName?: string;
    difficulty?: string;
    level?: string;
    type?: string;
    questionType?: string;
    createdBy?: string;
    author?: string;
    createdAt?: string;
    created_at?: string;
    options?: unknown[];
    choices?: unknown[];
    expectedAnswer?: string;
    answer?: string;
    tags?: string[];
  }

  const getName = (value: MaybeName): string => {
    if (typeof value === "string") return value;
    return value?.name ?? "";
  };

  const normalizeQuestion = (raw: RawQuestion): QuestionBankItem => {
    const backendType = raw?.type ?? raw?.questionType;
    const mappedType =
      backendType === "multiple_choice" ? "mcq" : backendType === "essay" ? "frq" : backendType;

    return {
      id: raw?.id ?? raw?.questionId ?? raw?.uuid ?? String(raw?.id ?? ""),
      text: raw?.text ?? raw?.questionText ?? raw?.content ?? "",
      subject: (raw?.subjectName ?? getName(raw?.subject)) || "",
      topic:
        (typeof raw?.topic === "string" ? raw?.topic : raw?.topic?.name) ?? raw?.topicName ?? "",
      difficulty: raw?.difficulty ?? raw?.level ?? "medium",
      type: mappedType ?? "mcq",
      createdBy: raw?.createdBy ?? raw?.author ?? "",
      createdAt: raw?.createdAt ?? raw?.created_at ?? new Date().toISOString(),
      options: (raw?.options ?? raw?.choices ?? []) as QuestionBankItem["options"],
      expectedAnswer: raw?.expectedAnswer ?? raw?.answer ?? undefined,
      tags: raw?.tags ?? [],
    } as QuestionBankItem;
  };

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      let items: QuestionBankItem[] = [];
      let totalCount = 0;

      if (teacherId) {
        // Gọi API theo giáo viên
        const res = await QuestionService.getByTeacherId(teacherId);
        if (res.data.code === 1000 || res.data.code === 0) {
          const rawList = (res.data.data as RawQuestion[]) || [];
          items = rawList.map(normalizeQuestion);
          totalCount = rawList.length;
        }
      } else {
        const params = { pageNo, pageSize, keyword: search || undefined };
        const res = await QuestionService.getAll(params);

        type PageLike<T> = PageInfo<T> & { content?: T[]; totalElements?: number };
        const page = res.data.data as PageLike<RawQuestion>;
        const rawItems: RawQuestion[] = page?.items ?? page?.content ?? [];
        items = rawItems.map(normalizeQuestion);
        totalCount = page?.totalElement ?? page?.totalElements ?? rawItems.length ?? 0;
      }

      setQuestions(items);
      setTotal(totalCount);
    } catch (error) {
      console.error(" Failed to fetch questions:", error);
      message.error("Không thể tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  }, [teacherId, pageNo, pageSize, search]);

  const deleteQuestion = useCallback(
    async (id: string) => {
      try {
        const res = await QuestionService.delete(id);
        if (res.data.code === 1000 || res.data.code === 0) {
          message.success("Xóa câu hỏi thành công");
          fetchQuestions();
        } else {
          message.error(res.data.message || "Xóa thất bại");
        }
      } catch (error) {
        console.error(" Failed to delete question:", error);
        message.error("Không thể xóa câu hỏi");
      }
    },
    [fetchQuestions]
  );

  const updateQuestion = useCallback(
    async (id: string, data: Partial<QuestionBankItem>) => {
      try {
        const res = await QuestionService.update(id, data);
        if (res.data.code === 1000) {
          message.success("Cập nhật thành công");
          fetchQuestions();
        } else {
          message.error(res.data.message || "Cập nhật thất bại");
        }
      } catch (error) {
        console.error(" Failed to update question:", error);
        message.error("Không thể cập nhật câu hỏi");
      }
    },
    [fetchQuestions]
  );

  const createQuestion = useCallback(
    async (data: NewQuestion) => {
      try {
        const res = await QuestionService.create(data);
        if (res.data.code === 1000) {
          message.success("Thêm câu hỏi thành công");
          fetchQuestions();
        } else {
          message.error(res.data.message || "Thêm thất bại");
        }
      } catch (error) {
        console.error(" Failed to create question:", error);
        message.error("Không thể thêm câu hỏi");
      }
    },
    [fetchQuestions]
  );

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    total,
    pageNo,
    setPageNo,
    pageSize,
    setPageSize,
    search,
    setSearch,
    fetchQuestions,
    deleteQuestion,
    updateQuestion,
    createQuestion,
  };
};
