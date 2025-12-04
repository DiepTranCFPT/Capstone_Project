// src/hooks/useNotes.ts
import { useState, useCallback } from "react";
import NoteService from "~/services/noteService";
import type { Note, NotePayload } from "~/types/note";
import type { ApiResponse } from "~/types/api";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as {
      response?: { data?: { message?: string; error?: string } };
    };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim() !== "") {
    return error;
  }

  return fallback;
};

const isNotFoundError = (error: unknown): boolean => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as { response?: { status?: number } };
    return axiosError.response?.status === 404;
  }
  return false;
};

export const useNotes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);

  const fetchMyNotes = useCallback(async (): Promise<Note[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await NoteService.getMyNotes();
      const responseData = response.data as ApiResponse<Note[] | Note | null>;
      const raw = responseData.data;
      const data = Array.isArray(raw) ? raw : raw ? [raw] : [];

      setNotes(data);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải danh sách ghi chú của bạn."));
      setNotes([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotesByLesson = useCallback(
    async (lessonId: string): Promise<Note[]> => {
      try {
        setLoading(true);
        setError(null);

        const response = await NoteService.getNotesByLesson(lessonId);
        const responseData = response.data as ApiResponse<Note[] | Note | null>;
        const raw = responseData.data;
        const data = Array.isArray(raw) ? raw : raw ? [raw] : [];

        setNotes(data);
        return data;
      } catch (err) {
        if (isNotFoundError(err)) {
          setNotes([]);
          setError(null);
          return [];
        }
        setError(
          getErrorMessage(err, "Không thể tải danh sách ghi chú cho bài học.")
        );
        setNotes([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchNotesByLessonAndUser = useCallback(
    async (lessonId: string, userId: string): Promise<Note[]> => {
      try {
        setLoading(true);
        setError(null);

        const response = await NoteService.getNotesByLessonAndUser(
          lessonId,
          userId
        );
        const responseData = response.data as ApiResponse<Note[] | Note | null>;
        const raw = responseData.data;
        const data = Array.isArray(raw) ? raw : raw ? [raw] : [];

        setNotes(data);
        return data;
      } catch (err) {
        if (isNotFoundError(err)) {
          setNotes([]);
          setError(null);
          return [];
        }
        setError(
          getErrorMessage(
            err,
            "Không thể tải danh sách ghi chú cho bài học và người dùng này."
          )
        );
        setNotes([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createNote = useCallback(
    async (payload: NotePayload): Promise<Note | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await NoteService.createNote(payload);
        const responseData = response.data as ApiResponse<Note>;
        const note = responseData.data ?? null;

        if (note) {
          setNotes((prev) => [note, ...prev]);
        }

        return note;
      } catch (err) {
        setError(getErrorMessage(err, "Không thể tạo ghi chú."));
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateNote = useCallback(
    async (
      noteId: string,
      payload: Partial<NotePayload>
    ): Promise<Note | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await NoteService.updateNote(noteId, payload);
        const responseData = response.data as ApiResponse<Note>;
        const updated = responseData.data ?? null;

        if (updated) {
          setNotes((prev) =>
            prev.map((n) => (n.id === noteId ? { ...n, ...updated } : n))
          );
        }

        return updated;
      } catch (err) {
        setError(getErrorMessage(err, "Không thể cập nhật ghi chú."));
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await NoteService.deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));

      return true;
    } catch (err) {
      setError(getErrorMessage(err, "Không thể xoá ghi chú."));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    notes,
    fetchMyNotes,
    fetchNotesByLesson,
    fetchNotesByLessonAndUser,
    createNote,
    updateNote,
    deleteNote,
  };
};

export default useNotes;


