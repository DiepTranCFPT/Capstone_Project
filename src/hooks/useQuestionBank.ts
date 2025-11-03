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
  
  // Map to store difficulty UUIDs: { "easy": "uuid1", "medium": "uuid2", "hard": "uuid3" }
  const [difficultyIdMap, setDifficultyIdMap] = useState<Record<string, string>>({});

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
    difficultyName?: string;
    difficultyId?: string | number; // Check if backend returns difficultyId
    level?: string;
    type?: string;
    questionType?: string;
    createdBy?: string;
    author?: string;
    createdAt?: string;
    created_at?: string;
    options?: { text?: string; isCorrect?: boolean }[] | string[];
    choices?: string[];
    correctAnswer?: number;
    expectedAnswer?: string;
    answer?: string;
    tags?: string[];
  }

  // Backend expects UUID strings for difficultyId
  const getDifficultyId = useCallback((difficulty: "easy" | "medium" | "hard"): string => {
    return difficultyIdMap[difficulty] || difficultyIdMap["medium"] || "";
  }, [difficultyIdMap]);

  interface QuestionAPIPayload {
    content: string;
    subject: string;
    difficultyId: string; 
    type: "mcq" | "frq"; 
    tags?: string[];
    choices?: string[];
    correctAnswer?: number;
    expectedAnswer?: string;
  }

  const transformQuestionForAPI = useCallback((data: NewQuestion): QuestionAPIPayload => {
    console.log("Transform input data:", data);
    console.log("Current difficultyId map:", difficultyIdMap);
    
    const difficultyId = getDifficultyId(data.difficulty);
    if (!difficultyId) {
      console.warn(`No difficultyId UUID found for difficulty: ${data.difficulty}. Please fetch questions first to populate difficulty map.`);
    }
    
    const payload: QuestionAPIPayload = {
      content: data.text, 
      subject: data.subject,
      difficultyId: difficultyId, 
      type: data.type, 
    };

    if (data.tags && data.tags.length > 0) {
      payload.tags = data.tags;
    }

    if (data.type === "mcq") {
      if (data.choices && data.choices.length > 0) {
        const nonEmptyChoices = data.choices.filter((c) => c && c.trim() !== "");
        
        if (nonEmptyChoices.length > 0) {
          payload.choices = nonEmptyChoices;
          const originalCorrectIndex = data.correctIndex ?? 0;

          let correctIndexInFiltered = 0;
          let currentIndex = 0;
          for (let i = 0; i < data.choices.length; i++) {
            if (data.choices[i] && data.choices[i].trim() !== "") {
              if (i === originalCorrectIndex) {
                correctIndexInFiltered = currentIndex;
                break;
              }
              currentIndex++;
            }
          }
          payload.correctAnswer = correctIndexInFiltered;
        } else {
          // If all choices are empty, still send empty array but with correctAnswer 0
          payload.choices = [];
          payload.correctAnswer = 0;
        }
      } else {
        // No choices provided, send empty array
        payload.choices = [];
        payload.correctAnswer = 0;
      }
    }

    // For FRQ: send expectedAnswer (if provided)
    if (data.type === "frq") {
      if (data.expectedAnswer) {
        payload.expectedAnswer = data.expectedAnswer;
      }
    }

    console.log("Transformed payload:", JSON.stringify(payload, null, 2));
    return payload;
  }, [getDifficultyId, difficultyIdMap]);

  const normalizeQuestion = useCallback((raw: RawQuestion): QuestionBankItem => {
    const backendType = raw?.type ?? raw?.questionType;
    const mappedType =
      backendType === "multiple_choice" ? "mcq" : backendType === "essay" ? "frq" : backendType;

    const lowerDifficulty = (raw?.difficultyName || raw?.difficulty || raw?.level || "medium")
      .toString()
      .toLowerCase() as QuestionBankItem["difficulty"];

    // Normalize options from either options[] or choices[] + correctAnswer
    let normalizedOptions: QuestionBankItem["options"] = undefined;
    if (Array.isArray(raw?.options)) {
      const asObjects = (raw.options as Array<{ text?: string; isCorrect?: boolean }>)
        .map((opt) => ({ text: opt?.text ?? "", isCorrect: Boolean(opt?.isCorrect) }));
      normalizedOptions = asObjects;
    } else if (Array.isArray(raw?.choices)) {
      const correctIndex = typeof raw?.correctAnswer === "number" ? raw.correctAnswer : 0;
      normalizedOptions = raw.choices.map((c, idx) => ({ text: c ?? "", isCorrect: idx === correctIndex }));
    }

    return {
      id: raw?.id ?? raw?.questionId ?? raw?.uuid ?? String(raw?.id ?? ""),
      text: raw?.text ?? raw?.questionText ?? raw?.content ?? "",
      subject:
        (raw?.subjectName ?? (typeof raw?.subject === "string" ? raw.subject : raw?.subject?.name)) ||
        "",
      topic:
        (typeof raw?.topic === "string" ? raw?.topic : raw?.topic?.name) ?? raw?.topicName ?? "",
      difficulty: lowerDifficulty,
      type: mappedType ?? "mcq",
      createdBy: raw?.createdBy ?? raw?.author ?? "",
      createdAt: raw?.createdAt ?? raw?.created_at ?? new Date().toISOString(),
      options: normalizedOptions,
      expectedAnswer: raw?.expectedAnswer ?? raw?.answer ?? undefined,
      tags: raw?.tags ?? [],
    } as QuestionBankItem;
  }, []);

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
          // Extract difficultyId UUIDs from questions to build mapping
          const newDifficultyMap: Record<string, string> = {};
          rawList.forEach((q) => {
            if (q.difficultyId) {
              // Try multiple ways to get difficulty name
              const difficultyName = (
                q.difficultyName || 
                q.difficulty || 
                q.level || 
                ""
              ).toLowerCase().trim();
              
              // Check if it matches our difficulty levels
              if (difficultyName === "easy" || difficultyName === "medium" || difficultyName === "hard") {
                newDifficultyMap[difficultyName] = String(q.difficultyId);
                console.log(`Found difficulty: ${difficultyName} -> ${q.difficultyId}`);
              } else if (q.difficultyId) {
                // Log unknown difficulty format for debugging
                console.log(`Unknown difficulty format - name: "${difficultyName}", id: ${q.difficultyId}`, q);
              }
            }
          });
          if (Object.keys(newDifficultyMap).length > 0) {
            setDifficultyIdMap((prev) => ({ ...prev, ...newDifficultyMap }));
            console.log("Updated difficultyId map:", newDifficultyMap);
            console.log("All questions sample:", rawList.slice(0, 3).map(q => ({ 
              difficultyId: q.difficultyId, 
              difficultyName: q.difficultyName, 
              difficulty: q.difficulty,
              level: q.level 
            })));
          }
          items = rawList.map(normalizeQuestion);
          totalCount = rawList.length;
        }
      } else {
        const params = { pageNo, pageSize, keyword: search || undefined };
        const res = await QuestionService.getAll(params);

        type PageLike<T> = PageInfo<T> & { content?: T[]; totalElements?: number };
        const page = res.data.data as PageLike<RawQuestion>;
        const rawItems: RawQuestion[] = page?.items ?? page?.content ?? [];
        
        // Extract difficultyId UUIDs from questions to build mapping
        const newDifficultyMap: Record<string, string> = {};
        rawItems.forEach((q) => {
          if (q.difficultyId) {
            // Try multiple ways to get difficulty name
            const difficultyName = (
              q.difficultyName || 
              q.difficulty || 
              q.level || 
              ""
            ).toLowerCase().trim();
            
            // Check if it matches our difficulty levels
            if (difficultyName === "easy" || difficultyName === "medium" || difficultyName === "hard") {
              newDifficultyMap[difficultyName] = String(q.difficultyId);
              console.log(`Found difficulty: ${difficultyName} -> ${q.difficultyId}`);
            } else if (q.difficultyId) {
              // Log unknown difficulty format for debugging
              console.log(`Unknown difficulty format - name: "${difficultyName}", id: ${q.difficultyId}`, q);
            }
          }
        });
        
        // If we don't have all difficulty IDs, try to fetch more pages or all questions
        const currentMap = { ...difficultyIdMap, ...newDifficultyMap };
        const hasAllDifficulties = currentMap["easy"] && currentMap["medium"] && currentMap["hard"];
        if (!hasAllDifficulties) {
          // Try to fetch first 3 pages to get all difficulty IDs
          console.log("Missing some difficulty IDs, fetching more pages...");
          const fetchMoreDifficulties = async () => {
            const fetchedMap: Record<string, string> = { ...newDifficultyMap };
            for (let p = 0; p < 3; p++) {
              try {
                const moreRes = await QuestionService.getAll({ pageNo: p, pageSize: 50 });
                const morePage = moreRes.data.data as PageLike<RawQuestion>;
                const moreItems: RawQuestion[] = morePage?.items ?? morePage?.content ?? [];
                moreItems.forEach((q) => {
                  if (q.difficultyId) {
                    const diffName = (
                      q.difficultyName || q.difficulty || q.level || ""
                    ).toLowerCase().trim();
                    if ((diffName === "easy" || diffName === "medium" || diffName === "hard") && !fetchedMap[diffName]) {
                      fetchedMap[diffName] = String(q.difficultyId);
                      console.log(`Found difficulty from page ${p}: ${diffName} -> ${q.difficultyId}`);
                    }
                  }
                });
                // Stop if we have all three
                if (fetchedMap["easy"] && fetchedMap["medium"] && fetchedMap["hard"]) {
                  break;
                }
              } catch (err) {
                console.error(`Error fetching page ${p} for difficulties:`, err);
              }
            }
            // Update state with all found difficulties
            if (Object.keys(fetchedMap).length > Object.keys(newDifficultyMap).length) {
              setDifficultyIdMap((prev) => ({ ...prev, ...fetchedMap }));
              console.log("Updated difficultyId map with all pages:", fetchedMap);
            }
          };
          fetchMoreDifficulties();
        }
        
        if (Object.keys(newDifficultyMap).length > 0) {
          setDifficultyIdMap((prev) => ({ ...prev, ...newDifficultyMap }));
          console.log("Updated difficultyId map:", newDifficultyMap);
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId, pageNo, pageSize, search, normalizeQuestion]);

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
    async (id: string, data: Partial<QuestionBankItem> | NewQuestion) => {
      try {
        // If data is NewQuestion format, transform it
        let payload: Partial<QuestionAPIPayload>;
        if ("text" in data && "difficulty" in data && typeof data.difficulty === "string") {
          // It's NewQuestion format, transform it
          payload = transformQuestionForAPI(data as NewQuestion);
        } else {
          // It's already QuestionBankItem format, transform needed fields
          const itemData = data as Partial<QuestionBankItem>;
          payload = {
            ...(itemData.text && { content: itemData.text }),
            ...(itemData.subject && { subject: itemData.subject }),
            ...(itemData.difficulty && {
              difficultyId: getDifficultyId(itemData.difficulty as "easy" | "medium" | "hard"),
            }),
            ...(itemData.type && {
              type: itemData.type, // Keep as "mcq" or "frq", backend expects these values
            }),
            ...(itemData.tags && { tags: itemData.tags }),
            ...(itemData.options &&
              itemData.type === "mcq" && {
                choices: itemData.options.map((opt) => opt.text),
                correctAnswer: itemData.options.findIndex((opt) => opt.isCorrect),
              }),
            ...(itemData.expectedAnswer &&
              itemData.type === "frq" && { expectedAnswer: itemData.expectedAnswer }),
          };
        }

        console.log("Updating question with payload:", payload);
        const res = await QuestionService.update(id, payload as Record<string, unknown>);
        if (res.data.code === 1000 || res.data.code === 0) {
          message.success("Cập nhật thành công");
          fetchQuestions();
        } else {
          const errorMsg = res.data.message || "Cập nhật thất bại";
          console.error("Update question failed:", res.data);
          message.error(errorMsg);
        }
      } catch (error: unknown) {
        console.error("Failed to update question:", error);
        
        // Log full error details for debugging
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { 
            response?: { 
              status?: number;
              data?: { 
                message?: string; 
                data?: Record<string, string>;
                code?: number;
              } 
            } 
          };
          console.error("Full error response:", axiosError.response);
          console.error("Error response data:", axiosError.response?.data);
        }
        
        // Extract error message from different error structures
        let errorMessage = "Không thể cập nhật câu hỏi";
        
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { 
            response?: { 
              data?: { 
                message?: string; 
                data?: Record<string, string>;
                code?: number;
              } 
            } 
          };
          const errorData = axiosError.response?.data;
          
          // Handle validation errors (format: { code: 1002, message: "...", data: { field: "error" } })
          if (errorData?.data && typeof errorData.data === 'object') {
            const validationErrors = Object.values(errorData.data);
            errorMessage = validationErrors.length > 0 
              ? validationErrors.join(', ') 
              : errorData.message || errorMessage;
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.code) {
            errorMessage = `Lỗi ${errorData.code}: ${errorData.message || 'Invalid input data'}`;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        message.error(errorMessage);
      }
    },
    [fetchQuestions, transformQuestionForAPI, getDifficultyId]
  );

  const createQuestion = useCallback(
    async (data: NewQuestion) => {
      try {
        // Transform data to API format
        const payload = transformQuestionForAPI(data);
        console.log("Creating question with payload:", payload);
        const res = await QuestionService.create(payload as unknown as Record<string, unknown>);
        if (res.data.code === 1000 || res.data.code === 0) {
          message.success("Thêm câu hỏi thành công");
          fetchQuestions();
        } else {
          const errorMsg = res.data.message || "Thêm thất bại";
          console.error("Create question failed:", res.data);
          message.error(errorMsg);
        }
      } catch (error: unknown) {
        console.error("Failed to create question:", error);
        
        // Log full error details for debugging
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { 
            response?: { 
              status?: number;
              statusText?: string;
              data?: { 
                message?: string; 
                data?: Record<string, string>;
                code?: number;
              } 
            } 
          };
          console.error("=== QUESTION CREATE ERROR ===");
          console.error("Status:", axiosError.response?.status);
          console.error("Status Text:", axiosError.response?.statusText);
          console.error("Full response:", axiosError.response);
          console.error("Response data:", JSON.stringify(axiosError.response?.data, null, 2));
          console.error("============================");
        }
        
        // Extract error message from different error structures
        let errorMessage = "Không thể thêm câu hỏi";
        
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { 
            response?: { 
              data?: { 
                message?: string; 
                data?: Record<string, string>;
                code?: number;
              } 
            } 
          };
          const errorData = axiosError.response?.data;
          
          // Handle validation errors (format: { code: 1002, message: "...", data: { field: "error" } })
          if (errorData?.data && typeof errorData.data === 'object') {
            const validationErrors = Object.values(errorData.data);
            errorMessage = validationErrors.length > 0 
              ? validationErrors.join(', ') 
              : errorData.message || errorMessage;
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.code) {
            errorMessage = `Lỗi ${errorData.code}: ${errorData.message || 'Invalid input data'}`;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        message.error(errorMessage);
      }
    },
    [fetchQuestions, transformQuestionForAPI]
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
