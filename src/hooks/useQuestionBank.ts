import { useState, useCallback, useEffect } from "react";
import { message } from "antd";
import QuestionService from "~/services/QuestionService";
import axiosInstance from "~/configs/axios";
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

    // Debug: Log correctAnswerId if found
    if (correctAnswerId) {
      console.log("[useQuestionBank] Found correctAnswerId:", correctAnswerId);
    } else {
      console.warn("[useQuestionBank] No correctAnswerId found in question object");
    }

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
  // Note: Backend currently returns answers with only id and content: null
  // This function tries to expand answers and fetch details if needed
  // Once backend is fixed to return full answer data, this will work automatically
  const getQuestionById = useCallback(async (id: string) => {
    try {
      // Try with expand parameter first
      const res = await QuestionService.getById(id);
      let rawData = res.data?.data as unknown as Record<string, unknown> | undefined;

      // Debug: Log raw response from backend
      console.log("[useQuestionBank] Raw response from backend:", JSON.stringify(rawData, null, 2));
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
      message.error("Không thể tải thông tin câu hỏi!");
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
        console.log("[useQuestionBank] MCQ options:", transformed.options);
        console.log("[useQuestionBank] Answers for backend:", transformed.answers);
        console.log("[useQuestionBank] Correct answer ID:", transformed.correctAnswerId);
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
      message.success("Tải template thành công!");
    } catch (error) {
      message.error("Không thể tải template import!");
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
          message.warning(
            `Import hoàn tất: ${result.successCount}/${result.totalProcessed} câu hỏi thành công. ${result.errorCount} lỗi.`
          );
        } else {
          message.success(
            `Import thành công ${result.successCount} câu hỏi!`
          );
        }
        return result;
      }
      return null;
    } catch (error: unknown) {
      let errorMessage = "Import câu hỏi thất bại!";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
      message.error(errorMessage);
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

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
    downloadImportTemplate,
    importQuestions,
  };
};

export default useQuestionBank;
