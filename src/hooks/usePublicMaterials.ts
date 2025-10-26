import { useEffect, useState, useCallback } from "react";
import LearningMaterialService from "~/services/learningMaterialService";

import type {
  LearningMaterial,
  LearningMaterialQuery,
  PageInfo,
  ApiResponse,
} from "~/types/learningMaterial";

export const usePublicMaterials = (params: LearningMaterialQuery = {}) => {
  const [data, setData] = useState<LearningMaterial[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<LearningMaterial> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res: ApiResponse<PageInfo<LearningMaterial>> = (
        await LearningMaterialService.getPublic(params)
      ).data;

      setData(res.data.items || []);
      setPageInfo(res.data);
    } catch (error: unknown) {
      console.error(" Failed to fetch public materials:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Đã xảy ra lỗi khi tải tài liệu công khai.");
      }
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, []);

  return { materials: data, pageInfo, loading, error, refetch: fetchData };
};
