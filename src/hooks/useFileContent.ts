import { useState, useEffect, useCallback } from "react";
import FileContentService from "~/services/fileContentService";
import type { FileMaterial, FileLesson } from "~/types/fileContent";

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  if (typeof err === "string") {
    return err;
  }
  return "Unexpected error";
};

// --- Hook 1: Lấy danh sách Materials ---
export const useFileMaterials = (fileName: string | undefined) => {
  const [materials, setMaterials] = useState<FileMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm fetch data (được tách ra để có thể gọi lại khi cần - refetch)
  const fetchMaterials = useCallback(async () => {
    if (!fileName) return;

    setLoading(true);
    setError(null);
    try {
      const response = await FileContentService.getMaterials(fileName);
      // Giả định data nằm trong response.data.data theo chuẩn ApiResponse
      setMaterials(response.data.data); 
    } catch (err: unknown) {
      console.error("Error fetching materials:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [fileName]);

  // Gọi API khi fileName thay đổi
  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  return { materials, loading, error, refetch: fetchMaterials };
};

// --- Hook 2: Lấy thông tin Lesson ---
export const useFileLesson = (fileName: string | undefined) => {
  const [lesson, setLesson] = useState<FileLesson | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLesson = useCallback(async () => {
    if (!fileName) return;

    setLoading(true);
    setError(null);
    try {
      const response = await FileContentService.getLesson(fileName);
      setLesson(response.data.data);
    } catch (err: unknown) {
      console.error("Error fetching lesson:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [fileName]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  return { lesson, loading, error, refetch: fetchLesson };
};