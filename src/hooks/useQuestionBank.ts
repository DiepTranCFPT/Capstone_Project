import { useState, useCallback, useEffect } from "react";
import { message } from "antd";
import QuestionService from "~/services/QuestionService";
import type { QuestionBankItem, NewQuestion, QuestionOption } from "~/types/question";

export const useQuestionBank = (teacherId?: string) => {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(false);

  const sanitizeQuestion = useCallback((raw: unknown): QuestionBankItem | null => {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    const record = raw as Record<string, unknown>;

    const normalizeString = (...values: Array<unknown>): string => {
      for (const value of values) {
        if (typeof value === "string" && value.trim()) {
          return value.trim();
        }
        if (typeof value === "number" && Number.isFinite(value)) {
          return value.toString();
        }
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
          return value.toISOString();
        }
        if (value && typeof value === "object") {
          const nestedRecord = value as Record<string, unknown>;
          const candidates: Array<unknown> = [
            nestedRecord.name,
            nestedRecord.label,
            nestedRecord.value,
            nestedRecord.title,
          ];
          for (const candidate of candidates) {
            if (typeof candidate === "string" && candidate.trim()) {
              return candidate.trim();
            }
            if (typeof candidate === "number" && Number.isFinite(candidate)) {
              return candidate.toString();
            }
          }
        }
      }
      return "";
    };

    const id = normalizeString(record["id"]);
    if (!id) {
      return null;
    }

    const text = normalizeString(record["text"], record["content"], record["questionContent"]);
    const subject = normalizeString(record["subject"], record["subjectId"], record["subjectDisplay"]);
    const topicValue = normalizeString(record["topic"], record["topicName"], record["topicDisplay"]);
    const typeRaw = normalizeString(record["type"], record["questionType"], record["typeCode"]).toLowerCase();
    const type: QuestionBankItem["type"] = typeRaw === "frq" ? "frq" : "mcq";

    const difficultyRaw = normalizeString(
      record["difficulty"],
      record["difficultyName"],
      record["difficultyLevel"],
      record["difficultyDisplay"]
    ).toLowerCase();
    const difficulty: QuestionBankItem["difficulty"] =
      difficultyRaw === "easy" || difficultyRaw === "hard" ? difficultyRaw : "medium";

    const createdAt = normalizeString(
      record["createdAt"],
      record["createdDate"],
      record["createdOn"],
      record["createdTime"]
    );

    const createdBy = normalizeString(record["createdBy"], record["authorId"], record["userId"], record["teacherId"]);

    const optionsRaw = (record["options"] ?? record["answers"]) as unknown;
    const options = Array.isArray(optionsRaw)
      ? optionsRaw
          .map((item) => {
            if (!item || typeof item !== "object") {
              return null;
            }
            const optionRecord = item as Record<string, unknown>;
            const optionText = normalizeString(optionRecord["text"], optionRecord["content"], optionRecord["label"]);
            if (!optionText) {
              return null;
            }
            const optionId = normalizeString(optionRecord["id"], optionRecord["optionId"]);
            const isCorrectValue = optionRecord["isCorrect"] ?? optionRecord["correct"] ?? optionRecord["isAnswer"];
            const isCorrect = typeof isCorrectValue === "boolean" ? isCorrectValue : Boolean(isCorrectValue);
            return {
              id: optionId || undefined,
              text: optionText,
              isCorrect,
            } as QuestionOption;
          })
          .filter((item): item is QuestionOption => item !== null)
      : undefined;

    const tagsRaw = record["tags"];
    const tags = Array.isArray(tagsRaw)
      ? tagsRaw.filter((tag) => typeof tag === "string")
      : undefined;

    const expectedAnswer = normalizeString(record["expectedAnswer"], record["answer"], record["solution"]);

    return {
      id,
      text,
      subject,
      topic: topicValue || undefined,
      difficulty,
      type,
      createdBy,
      createdAt,
      options: options as QuestionOption[] | undefined,
      expectedAnswer: expectedAnswer || undefined,
      tags,
    };
  }, []);

  const normalizeQuestions = useCallback(
    (payload: unknown): QuestionBankItem[] => {
      const toArray = (): unknown[] => {
        if (Array.isArray(payload)) {
          return payload;
        }
        if (
          payload &&
          typeof payload === "object"
        ) {
          const record = payload as Record<string, unknown>;
          if (Array.isArray(record.items)) {
            return record.items;
          }
          if (Array.isArray(record.content)) {
            return record.content;
          }
          if (Array.isArray(record.data)) {
            return record.data;
          }
          if (record.data && typeof record.data === "object") {
            const inner = record.data as Record<string, unknown>;
            if (Array.isArray(inner.items)) {
              return inner.items;
            }
            if (Array.isArray(inner.content)) {
              return inner.content;
            }
            if (Array.isArray(inner.data)) {
              return inner.data;
            }
          }
        }
        return [];
      };

      return toArray()
        .map((item) => sanitizeQuestion(item))
        .filter((item): item is QuestionBankItem => item !== null);
    },
    [sanitizeQuestion]
  );

  // 🔹 Lấy tất cả câu hỏi (phân trang, tìm kiếm)
  const fetchQuestions = useCallback(async (params?: {
    pageNo?: number;
    pageSize?: number;
    keyword?: string;
  }) => {
    try {
      setLoading(true);
      const res = await QuestionService.getAll(params);
      setQuestions(normalizeQuestions(res.data?.data)); // getAll trả về PageInfo
    } catch (error) {
      message.error("Không thể tải danh sách câu hỏi!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [normalizeQuestions]);

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

  // 🔹 Transform NewQuestion to API format
  const transformQuestionForAPI = useCallback((data: NewQuestion | Partial<QuestionBankItem>) => {
    const transformed: Record<string, unknown> = {
      // Backend expects `content`; keep `text` for compatibility
      text: data.text,
      content: data.text,
      subjectId: data.subject,
      type: data.type,
    };

    // Transform topic to topicName (required by API)
    if (data.topic && data.topic.trim()) {
      transformed.topicName = data.topic.trim();
    }

    // Transform difficulty to difficultyName (required by API)
    if (data.difficulty && data.difficulty.trim()) {
      transformed.difficultyName = data.difficulty.trim();
    }

    // Transform MCQ choices and correctIndex to options
    // Only process if data is NewQuestion (has choices property)
    if (data.type === "mcq" && "choices" in data && data.choices && "correctIndex" in data && data.correctIndex !== null && data.correctIndex !== undefined) {
      // Filter out empty choices first
      const nonEmptyChoices = data.choices
        .map((choice: string, originalIndex: number) => ({ text: choice, originalIndex }))
        .filter((item: { text: string; originalIndex: number }) => item.text && item.text.trim() !== "");
      
      // Map to options with correct index after filtering
      transformed.options = nonEmptyChoices.map((item: { text: string; originalIndex: number }) => {
        // Find the new index of the originally selected correct answer
        const originalCorrectIndex = data.correctIndex as number;
        // Check if this item's original index matches the correct index
        const isCorrect = item.originalIndex === originalCorrectIndex;
        return {
          text: item.text.trim(),
          isCorrect: isCorrect,
        };
      });
      
      // Ensure at least one option is marked as correct
      if (transformed.options && Array.isArray(transformed.options) && transformed.options.length > 0) {
        const hasCorrectAnswer = transformed.options.some((opt: { isCorrect: boolean }) => opt.isCorrect);
        if (!hasCorrectAnswer && transformed.options.length > 0) {
          // If no correct answer found (maybe due to filtering), mark first as correct
          (transformed.options[0] as { isCorrect: boolean }).isCorrect = true;
          console.warn("[useQuestionBank] No correct answer found after filtering, marking first option as correct");
        }
        // Some backends may also expect 'answers' field
        transformed.answers = transformed.options;
        console.log("[useQuestionBank] MCQ options:", transformed.options);
      } else {
        console.warn("[useQuestionBank] No options found for MCQ question");
      }
    }
    // If updating existing question with options, use them directly
    else if (data.type === "mcq" && "options" in data && data.options && Array.isArray(data.options)) {
      // Ensure at least one option is marked as correct
      const hasCorrectAnswer = data.options.some((opt: QuestionOption) => opt.isCorrect);
      if (!hasCorrectAnswer && data.options.length > 0) {
        // Clone options and mark first as correct if none is correct
        transformed.options = data.options.map((opt: QuestionOption, index: number) => ({
          ...opt,
          isCorrect: index === 0,
        }));
      } else {
        transformed.options = data.options;
      }
      // Some backends may also expect 'answers' field
      transformed.answers = transformed.options;
    }

    // Add expectedAnswer for FRQ (required)
    if (data.type === "frq") {
      if (data.expectedAnswer && data.expectedAnswer.trim()) {
        transformed.expectedAnswer = data.expectedAnswer.trim();
      } else {
        // If no expected answer provided, set empty string (backend should validate)
        transformed.expectedAnswer = "";
      }
    }

    // Add tags if present
    if (data.tags && data.tags.length > 0) {
      transformed.tags = data.tags;
    }

    return transformed;
  }, []);

  // 🔹 Tạo mới
  const createQuestion = useCallback(async (data: NewQuestion) => {
    try {
      const apiData = transformQuestionForAPI(data);
      console.log("[useQuestionBank] Creating question with data:", JSON.stringify(apiData, null, 2));
      console.log("[useQuestionBank] Options detail:", apiData.options);
      const res = await QuestionService.create(apiData);
      message.success("Tạo câu hỏi thành công!");
      return res.data?.data;
    } catch (error: unknown) {
      // Extract error message from backend response
      let errorMessage = "Tạo câu hỏi thất bại!";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string; errors?: unknown } } };
        const responseData = axiosError.response?.data;
        if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (responseData?.errors) {
          console.error("[useQuestionBank] Validation errors:", responseData.errors);
          errorMessage = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
        }
        console.error("[useQuestionBank] Error response:", responseData);
      }
      message.error(errorMessage);
      console.error("[useQuestionBank] Create question error:", error);
      throw error;
    }
  }, [transformQuestionForAPI]);

  // 🔹 Cập nhật
  const updateQuestion = useCallback(
    async (id: string, data: Partial<QuestionBankItem> | NewQuestion) => {
      try {
        const apiData = transformQuestionForAPI(data);
        console.log("[useQuestionBank] Updating question with data:", JSON.stringify(apiData, null, 2));
        const res = await QuestionService.update(id, apiData);
        message.success("Cập nhật câu hỏi thành công!");
        return res.data?.data;
      } catch (error: unknown) {
        // Extract error message from backend response
        let errorMessage = "Cập nhật câu hỏi thất bại!";
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { data?: { message?: string; errors?: unknown } } };
          const responseData = axiosError.response?.data;
          if (responseData?.message) {
            errorMessage = responseData.message;
          } else if (responseData?.errors) {
            console.error("[useQuestionBank] Validation errors:", responseData.errors);
            errorMessage = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
          }
          console.error("[useQuestionBank] Error response:", responseData);
        }
        message.error(errorMessage);
        console.error("[useQuestionBank] Update question error:", error);
        throw error;
      }
    },
    [transformQuestionForAPI]
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

  // 🔹 Lấy theo chủ đề (topicId) - Method not available in service yet
  // const fetchByTopicId = useCallback(async (topicId: string) => {
  //   try {
  //     setLoading(true);
  //     const res = await QuestionService.getByTopicId(topicId);
  //     setQuestions(normalizeQuestions(res.data?.data));
  //   } catch (error) {
  //     message.error("Không thể tải câu hỏi theo chủ đề!");
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [normalizeQuestions]);

  // 🔹 Lấy theo môn học (subjectId)
  const fetchBySubjectId = useCallback(async (subjectId: string) => {
    try {
      setLoading(true);
      const res = await QuestionService.getBySubjectId(subjectId);
      setQuestions(normalizeQuestions(res.data?.data));
    } catch (error) {
      message.error("Không thể tải câu hỏi theo môn học!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [normalizeQuestions]);

  // 🔹 Lấy theo userId (thay cho teacherId)
  const fetchByUserId = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const res = await QuestionService.getByUserId(userId);
      setQuestions(normalizeQuestions(res.data?.data));
    } catch (error) {
      message.error("Không thể tải câu hỏi theo người dùng!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [normalizeQuestions]);

  useEffect(() => {
    if (teacherId) {
      fetchByUserId(teacherId);
    } else {
      fetchQuestions();
    }
  }, [teacherId, fetchByUserId, fetchQuestions]);

  return {
    questions,
    loading,
    fetchQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    fetchByUserId,
    // fetchByTopicId, // Method not available in service yet
    fetchBySubjectId,
  };
};

export default useQuestionBank;
