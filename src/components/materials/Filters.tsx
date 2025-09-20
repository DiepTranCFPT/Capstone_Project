import { Search } from "lucide-react";

interface FiltersProps {
  search: string;
  setSearch: (value: string) => void;
  topic: string;
  setTopic: (value: string) => void;
  subject: string;
  setSubject: (value: string) => void;
}

const Filters: React.FC<FiltersProps> = ({
  search,
  setSearch,
  topic,
  setTopic,
  subject,
  setSubject,
}) => {
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

      {/* Topic */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Topic</h3>
        <div className="space-y-2">
          {[
            "All",
            "Math",
            "Arts",
            "English",
            "History",
            "Computer Science",
          ].map((t) => (
            <label
              key={t}
              className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
            >
              <input
                type="radio"
                name="topic"
                checked={topic === t}
                onChange={() => setTopic(t)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Subject</h3>
        <div className="space-y-2">
          {["All", "Design", "Language", "Programming"].map((s) => (
            <label
              key={s}
              className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
            >
              <input
                type="radio"
                name="subject"
                checked={subject === s}
                onChange={() => setSubject(s)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              {s}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Filters;
