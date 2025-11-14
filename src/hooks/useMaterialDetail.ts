import { useEffect, useState } from "react";
import LearningMaterialService from "~/services/learningMaterialService";
import type { LearningMaterial } from "~/types/learningMaterial";

export const useMaterialDetail = (id: string | undefined) => {
  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setMaterial(null);
      return;
    }

    const fetchMaterial = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await LearningMaterialService.getById(id);
        const materialData = res.data.data;

        setMaterial(materialData);
      } catch (error: unknown) {
        console.error("Failed to fetch material detail:", error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Đã xảy ra lỗi khi tải chi tiết tài liệu.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id]);

  return { material, loading, error };
};
