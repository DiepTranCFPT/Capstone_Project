import { useEffect, useState, useCallback } from "react";
import LearningMaterialService from "~/services/learningMaterialService";

import type { LearningMaterial, PageInfo } from "~/types/learningMaterial";
import type { ApiResponse } from "~/types/api";

const toLearningMaterialArray = (source: unknown): LearningMaterial[] => {
  if (Array.isArray(source)) {
    return source as LearningMaterial[];
  }
  if (!source || typeof source !== "object") {
    return [];
  }

  const obj = source as Record<string, unknown>;

  if (Array.isArray(obj.data)) {
    return obj.data as LearningMaterial[];
  }
  if (Array.isArray(obj.items)) {
    return obj.items as LearningMaterial[];
  }
  if (Array.isArray(obj.content)) {
    return obj.content as LearningMaterial[];
  }

  return [];
};

export const usePublicMaterials = () => {
  const [data, setData] = useState<LearningMaterial[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<LearningMaterial> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res: ApiResponse<LearningMaterial[]> = (await LearningMaterialService.getPublic()).data;
      const materials = toLearningMaterialArray(res.data);

      setData(materials);
      setPageInfo(null);
    } catch (error: unknown) {
      console.error("Failed to fetch public materials:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Đã xảy ra lỗi khi tải tài liệu công khai.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { materials: data, pageInfo, loading, error, refetch: fetchData };
};
