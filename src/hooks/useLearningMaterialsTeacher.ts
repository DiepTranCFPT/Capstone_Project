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

const normalizePageData = (
  raw: unknown,
): { items: LearningMaterial[]; pageInfo: PageInfo<LearningMaterial> | null } => {
  if (Array.isArray(raw)) {
    const items = raw as LearningMaterial[];
    const total = items.length;
    return {
      items,
      pageInfo: {
        pageNo: 0,
        pageSize: total || 10,
        totalPage: 1,
        totalElement: total,
        totalElements: total,
        items,
        content: items,
        sortBy: [],
      },
    };
  }

  if (raw && typeof raw === "object") {
    const page = raw as PageInfo<LearningMaterial>;
    const items = page.items ?? page.content ?? [];
    const totalElements = page.totalElements ?? page.totalElement ?? items.length;
    return {
      items,
      pageInfo: {
        ...page,
        items,
        content: page.content ?? items,
        totalElements,
        totalElement: totalElements,
        sortBy: page.sortBy ?? [],
      },
    };
  }

  return { items: [], pageInfo: null };
};

export function useLearningMaterialsTeacher() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<LearningMaterial> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //  Lấy danh sách (có phân trang)
  const fetchAll = useCallback(async (_query?: LearningMaterialQuery) => {
    try {
      setLoading(true);
      setError(null);
      void _query; // giữ chữ ký hàm cho các nơi đang gọi có query
      const res = await LearningMaterialService.getMyMaterials();
      const { items, pageInfo: normalizedPageInfo } = normalizePageData(res.data.data);
      setMaterials(items);
      setPageInfo(normalizedPageInfo);
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
  const create = useCallback(async (payload: Partial<LearningMaterial> | FormData) => {
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

export default useLearningMaterialsTeacher;


