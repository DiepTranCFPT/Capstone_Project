// src/hooks/useLearningMaterialsAdmin.ts
import { useState, useCallback, useEffect } from "react";
import { message } from "antd";
import type { LearningMaterial, PageInfo } from "~/types/learningMaterial";
import LearningMaterialService from "~/services/learningMaterialService";

export const useLearningMaterialsAdmin = () => {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageNo,
        pageSize,
        keyword: search || undefined,
      };

      const res = await LearningMaterialService.getAll(params);

      const page = res.data.data as PageInfo<LearningMaterial>;

      const items = page.items ?? page.content ?? [];

      const totalCount = page.totalElement ?? page.totalElements ?? 0;

      setMaterials(items);
      setTotal(totalCount);
    } catch (error) {
      console.error(" Failed to fetch materials:", error);
      message.error("Không thể tải danh sách tài liệu");
    } finally {
      setLoading(false);
    }
  }, [pageNo, pageSize, search]);

  const deleteMaterial = useCallback(
    async (id: string) => {
      try {
        const res = await LearningMaterialService.delete(id);
        if (res.data.code === 1000 || res.data.code === 0) {
          message.success("Xóa tài liệu thành công");
          // refetch current page
          fetchMaterials();
        } else {
          message.error(res.data.message || "Xóa thất bại");
        }
      } catch (error) {
        console.error(" Failed to delete material:", error);
        message.error("Không thể xóa tài liệu");
      }
    },
    [fetchMaterials]
  );

  const updateMaterial = useCallback(
    async (id: string, data: Partial<LearningMaterial>) => {
      try {
        const res = await LearningMaterialService.update(id, data);
        if (res.data.code === 1000) {
          message.success("Cập nhật thành công");
          fetchMaterials();
        } else {
          message.error(res.data.message || "Cập nhật thất bại");
        }
      } catch (error) {
        console.error(" Failed to update material:", error);
        message.error("Không thể cập nhật tài liệu");
      }
    },
    [fetchMaterials]
  );

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  return {
    materials,
    loading,
    total,
    pageNo,
    setPageNo,
    pageSize,
    setPageSize,
    search,
    setSearch,
    fetchMaterials,
    deleteMaterial,
    updateMaterial,
  };
};
