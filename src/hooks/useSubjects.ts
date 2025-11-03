import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import type { Subject, NewSubject } from "~/types/subject";
import type { PageInfo } from "~/types/pagination";
import SubjectService from "~/services/subjectService";


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
      message.error("Không thể tải danh sách môn học");
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
      message.error("Không thể tải thông tin môn học");
      return null;
    }
  }, []);

  // 🔹 Tạo môn học mới
  const createSubject = useCallback(async (data: NewSubject) => {
    try {
      const res = await SubjectService.create(data);
      message.success("Tạo môn học thành công");
      fetchSubjects();
      return res.data.data;
    } catch {
      message.error("Tạo môn học thất bại");
      return null;
    }
  }, [fetchSubjects]);

  // 🔹 Cập nhật môn học
  const updateSubject = useCallback(async (id: string, data: Partial<Subject>) => {
    try {
      const res = await SubjectService.update(id, data);
      message.success("Cập nhật môn học thành công");
      fetchSubjects();
      return res.data.data;
    } catch {
      message.error("Cập nhật môn học thất bại");
      return null;
    }
  }, [fetchSubjects]);

  // 🔹 Xóa môn học
  const deleteSubject = useCallback(async (id: string) => {
    try {
      await SubjectService.delete(id);
      message.success("Xóa môn học thành công");
      fetchSubjects();
    } catch {
      message.error("Xóa môn học thất bại");
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
