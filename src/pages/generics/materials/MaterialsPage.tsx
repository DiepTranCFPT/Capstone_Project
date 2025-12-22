import { useState, useEffect } from "react";
import Filters from "~/components/materials/Filters";
import MaterialCard from "~/components/materials/MaterialCard";
import MaterialsPageHeader from "~/components/materials/MaterialsPageHeader";
import LanguageNewsletter from "~/components/home/LanguageNewsletter";
import { usePublicMaterials } from "~/hooks/usePublicMaterials";
import useLearningMaterialsTeacher from "~/hooks/useLearningMaterialsTeacher";
import type { LearningMaterialSearchParams } from "~/types/learningMaterial";

const MaterialsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Hook để lấy materials public (fallback khi không search)
  const { materials: publicMaterials, loading: publicLoading, error: publicError } = usePublicMaterials();
  
  // Hook để search materials
  const { materials: searchResults, loading: searchLoading, search: searchMaterials } = useLearningMaterialsTeacher();

  // Debounce search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  // Gọi API search khi có keyword hoặc subject filter
  useEffect(() => {
    const hasActiveFilters = debouncedSearch.trim() || subject !== "All";
    
    if (hasActiveFilters) {
      const searchParams: LearningMaterialSearchParams = {
        keyword: debouncedSearch.trim() || "",
        pageNo: 0,
        pageSize: 100,
      };

      // Thêm subject filter nếu có
      if (subject !== "All") {
        // Note: API có thể không hỗ trợ subject filter trực tiếp,
        // nên sẽ filter ở client-side sau khi nhận kết quả
        searchMaterials(searchParams);
      } else {
        searchMaterials(searchParams);
      }
    }
  }, [debouncedSearch, subject, searchMaterials]);

  // Xác định materials để hiển thị
  const hasActiveFilters = debouncedSearch.trim() || subject !== "All";
  const materials = hasActiveFilters ? searchResults : publicMaterials;
  const loading = hasActiveFilters ? searchLoading : publicLoading;
  const error = hasActiveFilters ? null : publicError;

  // Filter theo subject nếu đang dùng search results
  const filtered = hasActiveFilters && subject !== "All"
    ? materials.filter((m) => {
        // So sánh với subjectId (string) hoặc subjectName
        return String(m.subjectId) === String(subject) || m.subjectName === subject;
      })
    : materials;

  if (loading) return <p className="text-center mt-20">Loading materials...</p>;
  if (error) return <p className="text-center text-red-500 mt-20">{error}</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <MaterialsPageHeader />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white rounded-2xl shadow p-6 sticky top-6">
            <Filters
              search={search}
              setSearch={setSearch}
              subject={subject}
              setSubject={setSubject}
            />
          </div>
        </div>

        <div className="col-span-12 md:col-span-9">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((m) => (
                <MaterialCard key={m.id} material={m} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No materials found.</p>
          )}
        </div>
      </div>

      <div className="mt-16">
        <LanguageNewsletter />
      </div>
    </div>
  );
};

export default MaterialsPage;
