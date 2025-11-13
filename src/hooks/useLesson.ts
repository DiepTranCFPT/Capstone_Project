// src/hooks/useLesson.ts
import { useState, useCallback } from "react";
import LessonService from "~/services/LessonService";
import type { Lesson, LessonQuery, PageInfo } from "~/types/lesson";

const extractLessons = (source: unknown): Lesson[] => {
  if (Array.isArray(source)) {
    return source as Lesson[];
  }
  if (!source || typeof source !== "object") {
    return [];
  }

  const obj = source as Record<string, unknown>;
  if (Array.isArray(obj.data)) {
    return obj.data as Lesson[];
  }
  if (Array.isArray(obj.items)) {
    return obj.items as Lesson[];
  }
  if (Array.isArray(obj.content)) {
    return obj.content as Lesson[];
  }

  return [];
};

const extractPageInfo = (source: unknown): PageInfo<Lesson> | null => {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return null;
  }
  return source as PageInfo<Lesson>;
};

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  if (typeof err === "string" && err.trim() !== "") {
    return err;
  }
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message?: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return "Đã xảy ra lỗi. Vui lòng thử lại.";
};

interface UseLessonReturn {
  lessons: Lesson[];
  pageInfo: PageInfo<Lesson> | null;
  loading: boolean;
  error: string | null;
  fetchLessons: (params?: LessonQuery) => Promise<void>;
  getLessonById: (id: string) => Promise<Lesson | null>;
  createLesson: (payload: Partial<Lesson>) => Promise<Lesson | null>;
  updateLesson: (id: string, payload: Partial<Lesson>) => Promise<Lesson | null>;
  deleteLesson: (id: string) => Promise<boolean>;
  getLessonsByLearningMaterial: (learningMaterialId: string) => Promise<Lesson[]>;
}

export function useLesson(): UseLessonReturn {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<Lesson> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async (params?: LessonQuery) => {
    setLoading(true);
    setError(null);
    try {
      const res = await LessonService.getAll(params);
      const payload = res.data.data;
      setLessons(extractLessons(payload));
      setPageInfo(extractPageInfo(payload));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const getLessonById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await LessonService.getById(id);
      return res.data.data;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createLesson = useCallback(async (payload: Partial<Lesson>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await LessonService.create(payload);
      return res.data.data;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLesson = useCallback(async (id: string, payload: Partial<Lesson>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await LessonService.update(id, payload);
      return res.data.data;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteLesson = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await LessonService.delete(id);
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLessonsByLearningMaterial = useCallback(async (learningMaterialId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await LessonService.getByLearningMaterial(learningMaterialId);
      return extractLessons(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    lessons,
    pageInfo,
    loading,
    error,
    fetchLessons,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson,
    getLessonsByLearningMaterial,
  };
}
