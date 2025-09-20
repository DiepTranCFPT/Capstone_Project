import { useState } from "react";
import { materials } from "~/data/materials";
import Filters from "~/components/materials/Filters";
import MaterialCard from "~/components/materials/MaterialCard";
import MaterialsPageHeader from "~/components/materials/MaterialsPageHeader";
import LanguageNewsletter from "~/components/home/LanguageNewsletter";

const MaterialsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("All");
  const [subject, setSubject] = useState("All");

  const filtered = materials.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchTopic = topic === "All" || m.topic === topic;
    const matchSubject = subject === "All" || m.subject === subject;
    return matchSearch && matchTopic && matchSubject;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <MaterialsPageHeader />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 grid grid-cols-12 gap-8">
        {/* Sidebar */}
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

        {/* Materials */}
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

      {/* Newsletter */}
      <div className="mt-16">
        <LanguageNewsletter />
      </div>
    </div>
  );
};

export default MaterialsPage;
