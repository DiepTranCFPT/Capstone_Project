import { useState } from "react";
import Filters from "~/components/teachers/materials/Filters";
import MaterialCard from "~/components/teachers/materials/MaterialCard";
import MaterialsPageHeader from "~/components/teachers/materials/MaterialsPageHeader";
import LanguageNewsletter from "~/components/home/LanguageNewsletter";
import { usePublicMaterials } from "~/hooks/usePublicMaterials"; // 👈 Thêm dòng này

const MaterialsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("All");
  const [subject, setSubject] = useState("All");

  // Gọi hook API
  const { materials, loading, error } = usePublicMaterials();

  // Lọc dữ liệu
  const filtered = materials.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchTopic = topic === "All" || m.typeName === topic;
    const matchSubject = subject === "All" || m.subjectName  === subject;
    return matchSearch && matchTopic && matchSubject;
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
              topic={topic}
              setTopic={setTopic}
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
