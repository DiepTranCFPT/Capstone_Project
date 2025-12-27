import { useState, useCallback } from "react";
import QuestionService from "~/services/QuestionService";
import axiosInstance from "~/configs/axios";
import type {
  QuestionBankItem,
  NewQuestion,
  QuestionOption,
  CreateQuestionContextRequest,
  UpdateQuestionContextRequest,
  QuestionContext
} from "~/types/question";
import { toast } from "~/components/common/Toast";

type QuestionBankPageMeta = {
  pageNo: number;
  pageSize: number;
  totalElement: number;
  totalPage?: number;
};

export const useQuestionBank = () => {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageMeta, setPageMeta] = useState<QuestionBankPageMeta | null>(null);

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

    // Try multiple field names for options/answers
    // Note: Backend currently returns answers with only id and content: null
    // Frontend will try to fetch answer details if content is missing
    const optionsRaw = (record["options"] ??
      record["answers"] ??
      record["choices"] ??
      record["answerOptions"] ??
      record["answer_options"]) as unknown;

    // Try to get correctAnswerId from question object
    const correctAnswerId = normalizeString(
      record["correctAnswerId"],
      record["correct_answer_id"],
      record["correctAnswer"],
      record["correct_answer"],
      (record["correctAnswer"] as Record<string, unknown>)?.["id"],
      (record["correctAnswer"] as Record<string, unknown>)?.["answerId"]
    );

    // Debug logs removed - correctAnswerId is optional and not always present

    const options = Array.isArray(optionsRaw)
      ? optionsRaw
        .map((item) => {
          if (!item) {
            return null;
          }

          // Handle both object and string cases
          let optionRecord: Record<string, unknown>;
          if (typeof item === "string") {
            // If item is a string, convert to object
            optionRecord = { text: item, content: item, label: item };
          } else if (typeof item === "object") {
            optionRecord = item as Record<string, unknown>;

            // Check if there's a nested answer object
            if (optionRecord["answer"] && typeof optionRecord["answer"] === "object") {
              const nestedAnswer = optionRecord["answer"] as Record<string, unknown>;
              optionRecord = { ...optionRecord, ...nestedAnswer };
            }

            // Check if there's a nested content object
            if (optionRecord["content"] && typeof optionRecord["content"] === "object") {
              const nestedContent = optionRecord["content"] as Record<string, unknown>;
              optionRecord = { ...optionRecord, ...nestedContent };
            }
          } else {
            return null;
          }

          const optionText = normalizeString(
            optionRecord["text"],
            optionRecord["content"],
            optionRecord["label"],
            optionRecord["optionText"],
            optionRecord["option_text"],
            optionRecord["answerText"],
            optionRecord["answer_text"],
            optionRecord["name"],
            optionRecord["title"],
            optionRecord["value"]
          );

          if (!optionText) {
            return null;
          }

          const optionId = normalizeString(
            optionRecord["id"],
            optionRecord["optionId"],
            optionRecord["option_id"],
            optionRecord["answerId"],
            optionRecord["answer_id"]
          );

          // Check if this option is correct by comparing with correctAnswerId
          let isCorrect = false;
          if (correctAnswerId && optionId) {
            isCorrect = correctAnswerId === optionId;
          } else {
            // Fallback to check field in option object
            const isCorrectValue = optionRecord["isCorrect"] ??
              optionRecord["correct"] ??
              optionRecord["isAnswer"] ??
              optionRecord["is_answer"] ??
              optionRecord["isCorrectAnswer"] ??
              optionRecord["is_correct_answer"] ??
              false;
            isCorrect = typeof isCorrectValue === "boolean" ? isCorrectValue : Boolean(isCorrectValue);
          }

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

    // Try multiple field names for expected answer
    // For FRQ, also check answers array for the correct answer content
    let expectedAnswer = normalizeString(
      record["expectedAnswer"],
      record["expected_answer"],
      record["answer"],
      record["solution"],
      record["correctAnswer"],
      record["correct_answer"],
      record["expectedResponse"],
      record["expected_response"]
    );

    // If expectedAnswer is still empty and this is FRQ, try to get from answers array
    if (!expectedAnswer && type === "frq") {
      // Check both optionsRaw (which may include answers) and record["answers"] separately
      const answersArray = Array.isArray(record["answers"])
        ? record["answers"]
        : (Array.isArray(optionsRaw) ? optionsRaw : []);

      if (answersArray.length > 0) {
        // Find the correct answer in the answers array
        const correctAnswer = answersArray.find((item: unknown) => {
          if (!item || typeof item !== "object") return false;
          const itemRecord = item as Record<string, unknown>;
          const isCorrect = itemRecord["isCorrect"] ??
            itemRecord["correct"] ??
            itemRecord["isAnswer"] ??
            itemRecord["is_answer"] ??
            itemRecord["isCorrectAnswer"] ??
            itemRecord["is_correct_answer"] ??
            false;
          return Boolean(isCorrect);
        });

        // If no correct answer found, use the first answer (for FRQ, usually there's only one)
        const answerToUse = correctAnswer || answersArray[0];

        if (answerToUse && typeof answerToUse === "object") {
          const answerRecord = answerToUse as Record<string, unknown>;
          expectedAnswer = normalizeString(
            answerRecord["content"],
            answerRecord["text"],
            answerRecord["answerText"],
            answerRecord["answer_text"],
            answerRecord["expectedAnswer"],
            answerRecord["expected_answer"],
            answerRecord["solution"]
          );
        }
      }
    }
    // Extract imageUrl and audioUrl
    const imageUrl = normalizeString(
      record["imageUrl"],
      record["image_url"],
      record["image"]
    ) || undefined;

    const audioUrl = normalizeString(
      record["audioUrl"],
      record["audio_url"],
      record["audio"]
    ) || undefined;

    // Extract questionContext
    const questionContextRaw = record["questionContext"] ?? record["context"] ?? record["question_context"];
    let questionContext: QuestionBankItem["questionContext"] = undefined;
    if (questionContextRaw && typeof questionContextRaw === "object") {
      const ctx = questionContextRaw as Record<string, unknown>;
      questionContext = {
        id: normalizeString(ctx["id"]) || "",
        title: normalizeString(ctx["title"]) || "",
        content: normalizeString(ctx["content"]) || "",
        imageUrl: normalizeString(ctx["imageUrl"], ctx["image_url"]) || "",
        audioUrl: normalizeString(ctx["audioUrl"], ctx["audio_url"]) || "",
        subjectId: normalizeString(ctx["subjectId"], ctx["subject_id"]) || "",
        subjectName: normalizeString(ctx["subjectName"], ctx["subject_name"]) || "",
      };
    }

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
      imageUrl,
      audioUrl,
      questionContext,
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

  const extractPageMeta = useCallback((payload: unknown): QuestionBankPageMeta | null => {
    const unwrap = (val: unknown): Record<string, unknown> | null => {
      if (!val || typeof val !== "object") return null;
      return val as Record<string, unknown>;
    };

    const record = unwrap(payload) ?? unwrap((payload as Record<string, unknown> | undefined)?.data) ?? null;
    if (!record) return null;

    const pageNo = typeof record.pageNo === "number" ? record.pageNo : 0;
    const pageSize = typeof record.pageSize === "number" ? record.pageSize : 10;

    const totalElement =
      typeof record.totalElement === "number"
        ? record.totalElement
        : typeof record.totalElements === "number"
          ? record.totalElements
          : typeof record.total === "number"
            ? record.total
            : NaN;

    if (!Number.isFinite(totalElement)) return null;

    const totalPage =
      typeof record.totalPage === "number"
        ? record.totalPage
        : typeof record.totalPages === "number"
          ? record.totalPages
          : undefined;

    return {
      pageNo,
      pageSize,
      totalElement,
      totalPage,
    };
  }, []);

  // 🔹 Lấy tất cả câu hỏi (phân trang, tìm kiếm)
  const fetchQuestions = useCallback(async (params?: {
    pageNo?: number;
    pageSize?: number;
    keyword?: string;
  }) => {
    try {
      setLoading(true);
      const res = await QuestionService.getAll(params);
      setQuestions(normalizeQuestions(res.data?.data)); // getAll trả về PageInfo / PaginationResponse
      setPageMeta(extractPageMeta(res.data?.data));
    } catch (error) {
      toast.error("Unable to load question list!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [normalizeQuestions, extractPageMeta]);

  // 🔹 Lấy chi tiết câu hỏi
  // Note: Backend currently returns answers with only id and content: null
  // This function tries to expand answers and fetch details if needed
  // Once backend is fixed to return full answer data, this will work automatically
  const getQuestionById = useCallback(async (id: string) => {
    try {
      // Try with expand parameter first
      const res = await QuestionService.getById(id);
      let rawData = res.data?.data as unknown as Record<string, unknown> | undefined;

      // Debug: Log raw response from backend
      if (rawData && rawData.answers && Array.isArray(rawData.answers)) {
        console.log("[useQuestionBank] Answers from backend:", rawData.answers);
      }

      // If answers still don't have content, try fetching answer details separately
      // TODO: Remove this workaround once backend returns full answer data
      if (rawData && rawData.answers && Array.isArray(rawData.answers)) {
        const answersWithContent = await Promise.all(
          (rawData.answers as Array<{ id: string; content: unknown }>).map(async (answer: { id: string; content: unknown }) => {
            // If answer has id but no content, try to fetch answer details
            if (answer.id && !answer.content) {
              try {
                // Try to get answer details - adjust endpoint if needed
                const answerRes = await axiosInstance.get(`/answers/${answer.id}`);
                const answerData = answerRes.data?.data;
                if (answerData) {
                  return {
                    ...answer,
                    content: answerData.content || answerData.text || answerData.answerText,
                    isCorrect: answerData.isCorrect || answerData.correct || answerData.isAnswer,
                  };
                }
              } catch (err) {
                // Silently fail - backend may not have this endpoint yet
                console.warn(`[useQuestionBank] Could not fetch answer ${answer.id}:`, err);
              }
            }
            return answer;
          })
        );
        rawData = { ...rawData, answers: answersWithContent };
      }

      if (rawData) {
        // Normalize the question data using sanitizeQuestion
        const normalized = sanitizeQuestion(rawData);
        return normalized;
      }
      return null;
    } catch (error) {
      toast.error("Unable to load question details!");
      console.error(error);
      return null;
    }
  }, [sanitizeQuestion]);

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
        const trimmedText = item.text.trim();
        return {
          text: trimmedText,
          content: trimmedText, // Backend requires content field
          isCorrect: isCorrect,
          correct: isCorrect, // Backend may expect 'correct' field
          isAnswer: isCorrect, // Backend may expect 'isAnswer' field
          isCorrectAnswer: isCorrect, // Backend may expect 'isCorrectAnswer' field
        };
      });

      // Ensure at least one option is marked as correct
      if (transformed.options && Array.isArray(transformed.options) && transformed.options.length > 0) {
        const hasCorrectAnswer = transformed.options.some((opt: { isCorrect: boolean }) => opt.isCorrect);
        if (!hasCorrectAnswer && transformed.options.length > 0) {
          // If no correct answer found (maybe due to filtering), mark first as correct
          const firstOption = transformed.options[0] as Record<string, unknown>;
          firstOption.isCorrect = true;
          firstOption.correct = true;
          firstOption.isAnswer = true;
          firstOption.isCorrectAnswer = true;
          console.warn("[useQuestionBank] No correct answer found after filtering, marking first option as correct");
        }
        // Find the correct answer and set correctAnswerId
        const correctOption = transformed.options.find((opt: { isCorrect?: boolean }) => opt.isCorrect);
        if (correctOption && (correctOption as { id?: string }).id) {
          transformed.correctAnswerId = (correctOption as { id: string }).id;
          transformed.correct_answer_id = (correctOption as { id: string }).id;
        }
        // Backend expects answers array with format: { content, isCorrect, explanation }
        // Clean up options to match backend format
        transformed.answers = (transformed.options as Array<Record<string, unknown>>).map((opt) => ({
          content: opt.content || opt.text,
          isCorrect: opt.isCorrect || false,
          explanation: opt.explanation || "", // Backend may expect explanation field
        }));

      } else {
        console.warn("[useQuestionBank] No options found for MCQ question");
      }
    }
    // If updating existing question with options, use them directly
    else if (data.type === "mcq" && "options" in data && data.options && Array.isArray(data.options)) {
      // Ensure at least one option is marked as correct
      const hasCorrectAnswer = data.options.some((opt: QuestionOption) => opt.isCorrect);
      // Map options to include content field (backend requires content)
      const mappedOptions = data.options.map((opt: QuestionOption) => ({
        ...opt,
        content: opt.text, // Backend requires content field
        correct: opt.isCorrect, // Backend may expect 'correct' field
        isAnswer: opt.isCorrect, // Backend may expect 'isAnswer' field
        isCorrectAnswer: opt.isCorrect, // Backend may expect 'isCorrectAnswer' field
      }));
      if (!hasCorrectAnswer && mappedOptions.length > 0) {
        // Clone options and mark first as correct if none is correct
        transformed.options = mappedOptions.map((opt, index: number) => {
          const isFirst = index === 0;
          return {
            ...opt,
            isCorrect: isFirst,
            correct: isFirst,
            isAnswer: isFirst,
            isCorrectAnswer: isFirst,
          };
        });
      } else {
        transformed.options = mappedOptions;
      }
      // Find the correct answer and set correctAnswerId
      if (Array.isArray(transformed.options)) {
        const correctOption = transformed.options.find((opt: { isCorrect?: boolean }) => opt.isCorrect);
        if (correctOption && (correctOption as { id?: string }).id) {
          transformed.correctAnswerId = (correctOption as { id: string }).id;
          transformed.correct_answer_id = (correctOption as { id: string }).id;
        }
      }
      // Backend expects answers array with format: { content, isCorrect, explanation }
      // Clean up options to match backend format
      if (Array.isArray(transformed.options)) {
        transformed.answers = transformed.options.map((opt: Record<string, unknown>) => ({
          content: opt.content || opt.text,
          isCorrect: opt.isCorrect || false,
          explanation: opt.explanation || "", // Backend may expect explanation field
        }));
      }
    }

    // Add expectedAnswer for FRQ (required)
    // Backend requires at least one answer, so for FRQ we need to send expectedAnswer as an answer
    if (data.type === "frq") {
      if (data.expectedAnswer && data.expectedAnswer.trim()) {
        transformed.expectedAnswer = data.expectedAnswer.trim();
        // Backend expects answers array with format: { content, isCorrect, explanation }
        transformed.answers = [
          {
            content: data.expectedAnswer.trim(),
            isCorrect: true,
            explanation: "", // Backend may expect explanation field
          }
        ];
      } else {
        // If no expected answer provided, set empty string (backend should validate)
        transformed.expectedAnswer = "";
        // Still send empty answers array to satisfy backend requirement
        transformed.answers = [];
      }
    }

    // Add tags if present
    if (data.tags && data.tags.length > 0) {
      transformed.tags = data.tags;
    }

    // Add context fields if present
    if ("contextId" in data && data.contextId) {
      transformed.contextId = data.contextId;
    }

    // Add inline context if present (for creating new context with question)
    if ("context" in data && data.context) {
      transformed.context = data.context;
    }

    // Add image and audio URLs if present
    if ("imageUrl" in data && data.imageUrl) {
      transformed.imageUrl = data.imageUrl;
    }
    if ("audioUrl" in data && data.audioUrl) {
      transformed.audioUrl = data.audioUrl;
    }

    return transformed;
  }, []);

  // 🔹 Tạo mới
  const createQuestion = useCallback(async (data: NewQuestion) => {
    try {
      const apiData = transformQuestionForAPI(data);
      const res = await QuestionService.create(apiData);
      toast.success("Created question successfully!");
      return res.data?.data;
    } catch (error: unknown) {
      // Extract error message from backend response
      let errorMessage = "Create question failed!";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string; errors?: unknown } } };
        const responseData = axiosError.response?.data;
        if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (responseData?.errors) {
          console.error("[useQuestionBank] Validation errors:", responseData.errors);
          errorMessage = "Invalid data. Please check again.";
        }
        console.error("[useQuestionBank] Error response:", responseData);
      }
      toast.error(errorMessage);
      console.error("[useQuestionBank] Create question error:", error);
      throw error;
    }
  }, [transformQuestionForAPI]);

  // 🔹 Cập nhật
  const updateQuestion = useCallback(
    async (id: string, data: Partial<QuestionBankItem> | NewQuestion) => {
      try {
        const apiData = transformQuestionForAPI(data);
        const res = await QuestionService.update(id, apiData);
        toast.success("Updated question successfully!");
        return res.data?.data;
      } catch (error: unknown) {
        // Extract error message from backend response
        let errorMessage = "Failed to update question!";
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { data?: { message?: string; errors?: unknown } } };
          const responseData = axiosError.response?.data;
          if (responseData?.message) {
            errorMessage = responseData.message;
          } else if (responseData?.errors) {
            console.error("[useQuestionBank] Validation errors:", responseData.errors);
            errorMessage = "Invalid data. Please check again.";
          }
          console.error("[useQuestionBank] Error response:", responseData);
        }
        toast.error(errorMessage);
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
      toast.success("Deleted question successfully!");
    } catch (error) {
      toast.error("Failed to delete question!");
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
  const fetchBySubjectId = useCallback(async (subjectId: string, params?: { pageNo?: number; pageSize?: number; sorts?: string }) => {
    try {
      setLoading(true);
      const res = await QuestionService.getBySubjectId(subjectId, params);
      setQuestions(normalizeQuestions(res.data?.data));
      setPageMeta(extractPageMeta(res.data?.data));
    } catch (error) {
      toast.error("Failed to load questions by subject!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [normalizeQuestions, extractPageMeta]);

  // 🔹 Lấy theo topic (topicId)
  const fetchByTopicId = useCallback(async (topicId: string, params?: { pageNo?: number; pageSize?: number; sorts?: string }) => {
    try {
      setLoading(true);
      const res = await QuestionService.getByTopicId(topicId, params);
      setQuestions(normalizeQuestions(res.data?.data));
      setPageMeta(extractPageMeta(res.data?.data));
    } catch (error) {
      toast.error("Failed to load questions by topic!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [normalizeQuestions, extractPageMeta]);

  // 🔹 Lấy theo userId (thay cho teacherId)
  const fetchByUserId = useCallback(async (userId: string, params?: { pageNo?: number; pageSize?: number; keyword?: string; sorts?: string }) => {
    try {
      setLoading(true);
      const res = await QuestionService.getByUserId(userId, params);
      setQuestions(normalizeQuestions(res.data?.data));
      setPageMeta(extractPageMeta(res.data?.data));
    } catch (error) {
      toast.error("Failed to load questions by user!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [normalizeQuestions, extractPageMeta]);

  // 🔹 Tải template import câu hỏi
  const downloadImportTemplate = useCallback(async () => {
    try {
      setLoading(true);
      const res = await QuestionService.getImportTemplate();
      // Create download link
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'question_import_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Download template successfully!");
    } catch (error) {
      toast.error("Failed to download template!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Import câu hỏi từ file Excel
  const importQuestions = useCallback(async (
    subjectId: string,
    file: File,
    skipErrors: boolean = false
  ) => {
    try {
      setLoading(true);
      const res = await QuestionService.importQuestions(subjectId, file, skipErrors);
      const result = res.data?.data;

      if (result) {
        if (result.errorCount > 0) {
          toast.warning(
            `Import completed: ${result.successCount}/${result.totalProcessed} questions imported. ${result.errorCount} errors.`
          );
        } else {
          toast.success(
            `Imported ${result.successCount} questions successfully!`
          );
        }
        return result;
      }
      return null;
    } catch (error: unknown) {
      let errorMessage = "Import failed!";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
      toast.error(errorMessage);
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Xóa nhiều câu hỏi cùng lúc (batch delete)
  const batchDeleteQuestions = useCallback(async (questionIds: string[]): Promise<boolean> => {
    if (questionIds.length === 0) {
      toast.warning("Please select at least one question to delete");
      return false;
    }

    try {
      setLoading(true);
      const res = await QuestionService.batchDelete(questionIds);
      if (res.data.code === 0 || res.data.code === 1000) {
        toast.success(`Deleted ${questionIds.length} questions successfully`);
        // Remove deleted questions from state
        setQuestions((prev) => prev.filter((q) => !questionIds.includes(q.id)));
        return true;
      } else {
        toast.error(res.data.message || "Delete questions failed!");
        return false;
      }
    } catch (error) {
      console.error("Failed to batch delete questions:", error);
      toast.error("Failed to batch delete questions!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Tạo question context mới
  const createQuestionContext = useCallback(async (data: CreateQuestionContextRequest): Promise<QuestionContext | null> => {
    try {
      setLoading(true);
      const res = await QuestionService.createContext(data);
      if (res.data.code === 0 || res.data.code === 1000) {
        toast.success("Create context successfully!");
        return res.data.data;
      } else {
        toast.error(res.data.message || "Create context failed!");
        return null;
      }
    } catch (error: unknown) {
      let errorMessage = "Create context failed!";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
      toast.error(errorMessage);
      console.error("[useQuestionBank] Create context error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Cập nhật question context
  const updateQuestionContext = useCallback(async (id: string, data: UpdateQuestionContextRequest): Promise<QuestionContext | null> => {
    try {
      setLoading(true);
      const res = await QuestionService.updateContext(id, data);
      if (res.data.code === 0 || res.data.code === 1000) {
        toast.success("Update context successfully!");
        return res.data.data;
      } else {
        toast.error(res.data.message || "Update context failed!");
        return null;
      }
    } catch (error: unknown) {
      let errorMessage = "Update context failed!";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
      toast.error(errorMessage);
      console.error("[useQuestionBank] Update context error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Upload file cho questions
  const uploadQuestionFile = useCallback(async (file: File): Promise<string | null> => {
    try {
      setLoading(true);
      const res = await QuestionService.uploadQuestionFile(file);
      if (res.data.code === 0 || res.data.code === 1000) {
        toast.success("Upload file successfully!");
        return res.data.data;
      } else {
        toast.error(res.data.message || "Upload file failed!");
        return null;
      }
    } catch (error: unknown) {
      let errorMessage = "Upload file failed!";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
      toast.error(errorMessage);
      console.error("[useQuestionBank] Upload file error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Lấy danh sách contexts của user hiện tại (GET /questions-v2/context/me)
  const fetchMyContexts = useCallback(async (params?: { pageNo?: number; pageSize?: number; sorts?: string[] }): Promise<{
    items: QuestionContext[];
    totalElement: number;
    totalPage: number;
    pageNo: number;
    pageSize: number;
  } | null> => {
    try {
      setLoading(true);
      const res = await QuestionService.getMyContexts(params);
      if (res.data.code === 0 || res.data.code === 1000) {
        const data = res.data.data;
        return {
          items: data.items || [],
          totalElement: data.totalElement || 0,
          totalPage: data.totalPage || 0,
          pageNo: data.pageNo || 0,
          pageSize: data.pageSize || 10,
        };
      } else {
        toast.error(res.data.message);
        return null;
      }
    } catch (error: unknown) {
      console.error("[useQuestionBank] Fetch my contexts error:", error);
      toast.error("Fail to fetch my contexts");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Lấy danh sách câu hỏi trùng lặp (GET /questions-v2/duplicates)
  const fetchDuplicates = useCallback(async (): Promise<string[]> => {
    try {
      setLoading(true);
      const res = await QuestionService.getDuplicates();
      if (res.data.code === 0 || res.data.code === 1000) {
        return res.data.data || [];
      } else {
        toast.error(res.data.message);
        return [];
      }
    } catch (error: unknown) {
      console.error("[useQuestionBank] Fetch duplicates error:", error);
      toast.error("Fail to fetch duplicates");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Lấy danh sách context trùng lặp (GET /questions-v2/context/duplicates)
  const fetchContextDuplicates = useCallback(async (): Promise<string[]> => {
    try {
      setLoading(true);
      const res = await QuestionService.getContextDuplicates();
      if (res.data.code === 0 || res.data.code === 1000) {
        return res.data.data || [];
      } else {
        toast.error(res.data.message);
        return [];
      }
    } catch (error: unknown) {
      console.error("[useQuestionBank] Fetch context duplicates error:", error);
      toast.error("Fail to fetch context duplicates");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Export câu hỏi ra file để tạo tài liệu (POST /questions-v2/export)
  const exportQuestionsToText = useCallback(async (
    subjectId: string,
    questionIds: string[]
  ): Promise<boolean> => {
    if (questionIds.length === 0) {
      toast.warning("Please select at least one question to export");
      return false;
    }

    try {
      setLoading(true);
      const res = await QuestionService.exportQuestionsToText(subjectId, questionIds);
      // The API returns a file blob
      const blob = res.data;
      if (blob && blob.size > 0) {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // Try to get filename from Content-Disposition header
        const contentDisposition = res.headers['content-disposition'];
        let filename = `questions_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(`Exported ${questionIds.length} question(s) successfully!`);
        return true;
      } else {
        toast.error("Export returned empty content");
        return false;
      }
    } catch (error: unknown) {
      let errorMessage = "Export questions failed!";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: Blob } };
        // Try to read error message from blob
        if (axiosError.response?.data instanceof Blob) {
          try {
            const text = await axiosError.response.data.text();
            const jsonError = JSON.parse(text);
            if (jsonError.message) {
              errorMessage = jsonError.message;
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
      toast.error(errorMessage);
      console.error("[useQuestionBank] Export questions error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Tìm kiếm câu hỏi (GET /questions-v2/search)
  const searchQuestions = useCallback(async (params: {
    keyword: string;
    pageNo?: number;
    pageSize?: number;
    sorts?: string[];
  }) => {
    try {
      setLoading(true);
      const res = await QuestionService.search(params);
      const data = res.data?.data;
      if (data) {
        setQuestions(normalizeQuestions(data));
        setPageMeta(extractPageMeta(res.data?.data));
      } else {
        setQuestions([]);
        setPageMeta(null);
      }
    } catch (error) {
      toast.error("Failed to search questions!");
      console.error("[useQuestionBank] Search error:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [normalizeQuestions, extractPageMeta]);

  return {
    questions,
    loading,
    pageMeta,
    fetchQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    batchDeleteQuestions,
    fetchByUserId,
    fetchByTopicId,
    fetchBySubjectId,
    downloadImportTemplate,
    importQuestions,
    createQuestionContext,
    updateQuestionContext,
    uploadQuestionFile,
    fetchMyContexts,
    fetchDuplicates,
    fetchContextDuplicates,
    searchQuestions,
    exportQuestionsToText,
  };
};

export default useQuestionBank;

