import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { StarFilled } from "@ant-design/icons";
import MaterialThumbnail from "~/components/common/MaterialThumbnail";
import type { Material } from "~/types/material";
import { useRegisteredMaterials } from "~/hooks/useRegisteredMaterials";
import LearningMaterialRatingService from "~/services/learningMaterialRatingService";
import type { ApiResponse } from "~/types/api";
import type { LearningMaterialRatingStatistics } from "~/types/learningMaterialRating";

const MaterialCard: React.FC<{ material: Material }> = ({ material }) => {
  const { materials: registeredMaterials } = useRegisteredMaterials();
  const isRegistered = registeredMaterials.some((m) => m.id === material.id);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        const res = await LearningMaterialRatingService.getStatisticsByMaterial(
          material.id
        );
        const payload =
          res.data as
          | ApiResponse<LearningMaterialRatingStatistics>
          | LearningMaterialRatingStatistics
          | null;

        const stats =
          payload && typeof payload === "object" && "data" in payload
            ? (payload as ApiResponse<LearningMaterialRatingStatistics>).data
            : (payload as LearningMaterialRatingStatistics | null);

        if (!canceled && stats) {
          setAverageRating(
            typeof stats.averageRating === "number" ? stats.averageRating : 0
          );
        }
      } catch (error) {
        if (!canceled) {
          setAverageRating(null);
        }
      }
    })();

    return () => {
      canceled = true;
    };
  }, [material.id]);

  return (
    <div className="border rounded-lg shadow-sm p-3 bg-white">
      <MaterialThumbnail
        source={material.thumbnail || material.fileImage || material.image}
        width="100%"
        height={160}
        roundedClass="rounded"
        className="w-full mb-2"
      />
      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
        (material.price === 0 || material.price === undefined || material.price === null)
          ? "bg-green-100 text-green-600"
          : "bg-orange-100 text-orange-600"
      }`}>
        {(material.price === 0 || material.price === undefined || material.price === null) ? "Free" : "TOKEN"}
      </span>
      <h3 className="font-bold mt-2">{material.title}</h3>
      <p className="text-xs text-gray-500">
        {material.typeName || "Material"} • {material.subjectName || "Chưa phân loại"}
      </p>
      <div className="flex items-center gap-2 mt-2 text-sm text-gray-700">
        <StarFilled style={{ color: "#f59e0b" }} />
        <span>{(averageRating ?? 0).toFixed(1)} / 5</span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className={`text-sm font-semibold ${isRegistered ? "text-green-600" : (material.price === 0 || material.price === undefined || material.price === null) ? "text-green-600" : ""}`}>
          {(() => {
            if (isRegistered) {
              return "Registered";
            }
            const price = material.price ?? 0;
            if (price === 0 || price === undefined || price === null) {
              return "Free";
            }
            return new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              maximumFractionDigits: 0,
            }).format(price);
          })()}
        </span>
        <Link
          to={`/materials/${material.id}`}
          className="text-xs border px-2 py-1 rounded hover:bg-gray-100"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default MaterialCard;

