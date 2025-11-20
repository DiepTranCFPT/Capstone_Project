import { useState, useEffect, useCallback } from "react";
import type { Subject, NewSubject } from "~/types/subject";
import type { PageInfo } from "~/types/pagination";
import SubjectService from "~/services/subjectService";
import { toast } from "~/components/common/Toast";


export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<Subject> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 🔹 Lấy danh sách tất cả môn học
  const fetchSubjects = useCallback(async (params?: { pageNo?: number; pageSize?: number; keyword?: string }) => {
    try {
      setLoading(true);
      const res = await SubjectService.getAll(params);
      setSubjects(res.data.data.items || []);
      setPageInfo(res.data.data);
    } catch {
      toast.error("Không thể tải danh sách môn học");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Lấy chi tiết 1 môn học theo ID
  const getSubjectById = useCallback(async (id: string): Promise<Subject | null> => {
    try {
      const res = await SubjectService.getById(id);
      return res.data.data;
    } catch {
      toast.error("Không thể tải thông tin môn học");
      return null;
    }
  }, []);

  // 🔹 Tạo môn học mới
  const createSubject = useCallback(async (data: NewSubject) => {
    try {
      const res = await SubjectService.create(data);
      toast.success("Tạo môn học thành công");
      fetchSubjects();
      return res.data.data;
    } catch {
      toast.error("Tạo môn học thất bại");
      return null;
    }
  }, [fetchSubjects]);

  // 🔹 Cập nhật môn học
  const updateSubject = useCallback(async (id: string, data: Partial<Subject>) => {
    try {
      const res = await SubjectService.update(id, data);
      toast.success("Cập nhật môn học thành công");
      fetchSubjects();
      return res.data.data;
    } catch {
      toast.error("Cập nhật môn học thất bại");
      return null;
    }
  }, [fetchSubjects]);

  // 🔹 Xóa môn học
  const deleteSubject = useCallback(async (id: string) => {
    try {
      await SubjectService.delete(id);
      toast.success("Xóa môn học thành công");
      fetchSubjects();
    } catch {
      toast.error("Xóa môn học thất bại");
    }
  }, [fetchSubjects]);

  // 🔹 Fetch khi mount
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return {
    subjects,
    pageInfo,
    loading,
    fetchSubjects,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject,
  };
};
