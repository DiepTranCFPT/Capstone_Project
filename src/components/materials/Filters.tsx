import React, { useEffect } from "react";
import { Search } from "lucide-react";
import { useSubjects } from "~/hooks/useSubjects";

interface FiltersProps {
  search: string;
  setSearch: (value: string) => void;
  subject: string;
  setSubject: (value: string) => void;
}

const Filters: React.FC<FiltersProps> = ({
  search,
  setSearch,
  subject,
  setSubject,
}) => {
  const { subjects, fetchSubjects, loading } = useSubjects();

  useEffect(() => {
    fetchSubjects({ pageNo: 0, pageSize: 1000 });
  }, [fetchSubjects]);

  return (
    <div className="space-y-8">
      {/* Title */}
      <h2 className="text-xl font-bold text-gray-800">Filters</h2>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Subject */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Subject</h3>
        <div className="space-y-2">
          {loading ? (
            <p className="text-sm text-gray-500">Loading subjects...</p>
          ) : (
            <>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="radio"
                  name="subject"
                  checked={subject === "All"}
                  onChange={() => setSubject("All")}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                All
              </label>
              {subjects.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="subject"
                    checked={subject === s.id || subject === s.name}
                    onChange={() => setSubject(s.id)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  {s.name}
                </label>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filters;

