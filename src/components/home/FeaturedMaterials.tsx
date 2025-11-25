import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MaterialThumbnail from "~/components/common/MaterialThumbnail";
import { usePublicMaterials } from "~/hooks/usePublicMaterials";

const FeaturedMaterials: React.FC = () => {
  const { materials, loading, error } = usePublicMaterials();
  const [activeCategory, setActiveCategory] = useState("All Categories");

  const categories = useMemo(() => {
    const dynamicCategories = new Set<string>();
    materials.forEach((item) => {
      if (item.subjectName) dynamicCategories.add(item.subjectName);
      if (item.typeName) dynamicCategories.add(item.typeName);
    });
    return ["All Categories", ...dynamicCategories];
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    if (activeCategory === "All Categories") return materials;
    return materials.filter(
      (item) =>
        item.subjectName === activeCategory || item.typeName === activeCategory,
    );
  }, [materials, activeCategory]);

  const displayedMaterials = filteredMaterials.slice(0, 3);

  return (
    <div className="w-full bg-white py-16">
      {/* Header */}
      <div className="flex justify-center items-center mb-4">
        <div className="flex items-center space-x-3 border border-black/20 rounded-[30px] px-6 py-2 bg-white">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
            <img
              src="/education_6041280.png"
              alt="Top class materials logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className="text-black font-normal">Top Class Materials</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-center mb-8">
        Explore Featured Materials
      </h2>

      {/* Categories */}
      {categories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-[30px] border transition-colors ${
                activeCategory === cat
                  ? "bg-teal-400 text-white font-medium border-teal-400"
                  : "bg-white border-black/20 text-black hover:border-teal-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Courses */}
      <div className="flex justify-center gap-8 flex-wrap min-h-[280px]">
        {loading && (
          <div className="text-gray-500 text-sm">Đang tải tài liệu nổi bật...</div>
        )}
        {!loading && error && (
          <p className="text-red-500 text-sm text-center max-w-md">{error}</p>
        )}
        {!loading && !error && displayedMaterials.length === 0 && (
          <p className="text-gray-500 text-sm text-center">Chưa có tài liệu công khai nào.</p>
        )}
        {!loading &&
          !error &&
          displayedMaterials.map((material) => {
            const priceLabel = material.isPublic ? "Free" : "Premium";
            const thumbnail =
              material.thumbnail || material.fileImage || material.contentUrl || "";

            return (
              <div
                key={material.id}
                className="w-72 bg-white rounded-[10px] shadow border border-black/20 p-4 flex flex-col"
              >
                <MaterialThumbnail
                  source={thumbnail}
                  width="100%"
                  height={176}
                  roundedClass="rounded-[10px]"
                  className="mb-4"
                />
                <span className="text-xs font-bold text-teal-700 bg-slate-200 px-3 py-1 rounded-[20px] w-fit">
                  {priceLabel}
                </span>
                <h3 className="text-sm font-bold mt-3 mb-2 line-clamp-2">{material.title}</h3>
                <div className="text-[11px] text-black/50 space-y-1 mb-4">
                  <div>
                    {material.typeName || "Material"} • {material.subjectName || "Chưa phân loại"}
                  </div>
                  {material.authorName && <div>Giảng viên: {material.authorName}</div>}
                </div>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-[10px] font-semibold">{priceLabel}</span>
                  <Link
                    to={`/materials/${material.id}`}
                    className="text-[10px] px-3 py-1 border border-black/10 rounded-[10px] hover:bg-gray-100 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-12">
        <Link
          to="/materials"
          className="w-11 h-11 bg-teal-400 rounded-[5px] flex items-center justify-center text-white font-bold hover:bg-teal-500 transition-colors"
        >
          &gt;
        </Link>
      </div>
    </div>
  );
};

export default FeaturedMaterials;
