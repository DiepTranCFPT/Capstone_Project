import React from "react";
import { Spin, Empty } from "antd";
import { Link } from "react-router-dom";
import MaterialThumbnail from "~/components/common/MaterialThumbnail";
import type { LearningMaterial } from "~/types/learningMaterial";

interface RegisteredMaterialsListProps {
  materials: LearningMaterial[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const RegisteredMaterialsList: React.FC<RegisteredMaterialsListProps> = ({
  materials,
  loading,
  error,
  onRetry,
}) => {
  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "N/A";
    if (price === 0) return "Free";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <Empty
        description={
          <div>
            <p className="mb-2">No registered courses</p>
            <p className="text-xs text-gray-400">
              If you just registered a course, please wait a few seconds and refresh the page.
            </p>
          </div>
        }
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <div className="flex gap-3 justify-center">
          <Link
            to="/materials"
            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 inline-block"
          >
            Browse Courses
          </Link>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 inline-block"
            >
              Refresh
            </button>
          )}
        </div>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {materials.map((material: LearningMaterial) => {
        const materialPrice = (material as unknown as { price?: number }).price;
        return (
          <Link
            key={material.id}
            to={`/materials/${material.id}`}
            className="group border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden bg-white"
          >
            <div className="relative">
              <MaterialThumbnail
                source={material.thumbnail || (material as unknown as { fileImage?: string }).fileImage}
                width="100%"
                height={200}
                roundedClass="rounded-t-xl"
                className="w-full"
                fit="cover"
              />
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-teal-500 text-white">
                  Enrolled
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                {material.title}
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {material.typeName}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {material.subjectName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${
                    materialPrice === 0 ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {formatPrice(materialPrice)}
                </span>
                <span className="text-xs text-gray-500 group-hover:text-teal-600 transition-colors">
                  View Details →
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default RegisteredMaterialsList;

