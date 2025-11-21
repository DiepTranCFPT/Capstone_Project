import { useState, useCallback } from "react";
import type { LearningMaterial, LearningMaterialQuery, PageInfo } from "~/types/learningMaterial";
import LearningMaterialService from "~/services/learningMaterialService";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "string" && error.trim() !== "") {
    return error;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
};

export function useLearningMaterial() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<LearningMaterial> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //  Lấy danh sách (có phân trang)
  const fetchAll = useCallback(async (query?: LearningMaterialQuery) => {
    try {
      setLoading(true);
      const res = await LearningMaterialService.getAll(query);
      const data = res.data.data;
      setPageInfo(data);
      setMaterials(data.items || data.content || []);
    } catch (err: unknown) {
      console.error("❌ Fetch materials error:", err);
      setError(getErrorMessage(err, "Failed to load materials"));
    } finally {
      setLoading(false);
    }
  }, []);

  //  Lấy chi tiết
  const getById = useCallback(async (id: string): Promise<LearningMaterial | null> => {
    try {
      setLoading(true);
      const res = await LearningMaterialService.getById(id);
      return res.data.data;
    } catch (err: unknown) {
      console.error("❌ Get material error:", err);
      setError(getErrorMessage(err, "Failed to load material"));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  //  Tạo mới
  const create = useCallback(async (payload: unknown) => {
    try {
      setLoading(true);
      const res = await LearningMaterialService.create(payload);
      return res.data.data;
    } catch (err: unknown) {
      console.error("❌ Create material error:", err);
      const message = getErrorMessage(err, "Failed to create material");
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  //  Cập nhật
  const update = useCallback(async (id: string, payload: Partial<LearningMaterial>) => {
    try {
      setLoading(true);
      const res = await LearningMaterialService.update(id, payload);
      return res.data.data;
    } catch (err: unknown) {
      console.error("❌ Update material error:", err);
      const message = getErrorMessage(err, "Failed to update material");
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  //  Xóa
  const remove = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await LearningMaterialService.delete(id);
    } catch (err: unknown) {
      console.error("❌ Delete material error:", err);
      const message = getErrorMessage(err, "Failed to delete material");
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  //  Tìm kiếm
  const search = useCallback(async (keyword: string) => {
    try {
      setLoading(true);
      const res = await LearningMaterialService.search(keyword);
      setMaterials(res.data.data);
    } catch (err: unknown) {
      console.error("❌ Search error:", err);
      setError(getErrorMessage(err, "Failed to search materials"));
    } finally {
      setLoading(false);
    }
  }, []);

  //  Lấy các materials khác (ví dụ public, my, registered)
  const getPublic = useCallback(async () => {
    const res = await LearningMaterialService.getPublic();
    return res.data.data;
  }, []);

  const getMyMaterials = useCallback(async () => {
    const res = await LearningMaterialService.getMyMaterials();
    return res.data.data;
  }, []);

  const getRegistered = useCallback(async () => {
    const res = await LearningMaterialService.getRegistered();
    return res.data.data;
  }, []);

  return {
    materials,
    pageInfo,
    loading,
    error,
    fetchAll,
    getById,
    create,
    update,
    remove,
    search,
    getPublic,
    getMyMaterials,
    getRegistered,
  };
}

export default useLearningMaterial;
