import { useState, useEffect } from "react";
import Filters from "~/components/materials/Filters";
import MaterialCard from "~/components/materials/MaterialCard";
import MaterialsPageHeader from "~/components/materials/MaterialsPageHeader";
import LanguageNewsletter from "~/components/home/LanguageNewsletter";
import { usePublicMaterials } from "~/hooks/usePublicMaterials";
import useLearningMaterialsTeacher from "~/hooks/useLearningMaterialsTeacher";
import { useAuth } from "~/hooks/useAuth";
import type { LearningMaterialSearchParams } from "~/types/learningMaterial";

const MaterialsPage: React.FC = () => {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [teacher, setTeacher] = useState("All");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Hook để lấy materials public (fallback khi không search)
  const { materials: publicMaterials, loading: publicLoading, error: publicError } = usePublicMaterials();
  
  // Hook để search materials (chỉ dùng khi đã login)
  const { materials: searchResults, loading: searchLoading, search: searchMaterials } = useLearningMaterialsTeacher();

  // Debounce search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!user) return; // Không gọi API search nếu chưa login, chỉ dùng public materials
    
    const hasActiveFilters = debouncedSearch.trim() || subject !== "All" || teacher !== "All";
    
    if (hasActiveFilters) {
      const searchParams: LearningMaterialSearchParams = {
        keyword: debouncedSearch.trim() || "",
        pageNo: 0,
        pageSize: 120,
      };

      if (subject !== "All" || teacher !== "All") {

        searchMaterials(searchParams);
      } else {
        searchMaterials(searchParams);
      }
    }
  }, [debouncedSearch, subject, teacher, searchMaterials, user]);

  // Xác định materials để hiển thị
  // Nếu chưa login, chỉ dùng public materials và filter ở client-side
  // Nếu đã login, dùng API search khi có filter
  const hasActiveFilters = debouncedSearch.trim() || subject !== "All" || teacher !== "All";
  const materials = (user && hasActiveFilters) ? searchResults : publicMaterials;
  const loading = (user && hasActiveFilters) ? searchLoading : publicLoading;
  const error = (user && hasActiveFilters) ? null : publicError;

  // Filter theo search keyword và subject ở client-side
  const filtered = materials.filter((m) => {
    // Filter theo search keyword
    if (debouncedSearch.trim()) {
      const keyword = debouncedSearch.toLowerCase().trim();
      const matchesSearch = 
        m.title?.toLowerCase().includes(keyword) ||
        m.description?.toLowerCase().includes(keyword);
      if (!matchesSearch) return false;
    }

    // Filter theo subject
    if (subject !== "All") {
      const matchesSubject = 
        String(m.subjectId) === String(subject) || 
        m.subjectName === subject;
      if (!matchesSubject) return false;
    }

    // Filter theo teacher
    if (teacher !== "All") {
      const matchesTeacher = m.authorId === teacher;
      if (!matchesTeacher) return false;
    }

    return true;
  });

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
              teacher={teacher}
              setTeacher={setTeacher}
            />
          </div>
        </div>

        <div className="col-span-12 md:col-span-9">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.slice(0, 12).map((m) => (
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
