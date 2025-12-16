import type React from "react";
import { FiChevronRight, FiGlobe } from "react-icons/fi";
import type { Community } from "~/types/community";

interface CommunitySidebarProps {
  communities: Community[];
  selectedCommunityId: string | number | null;
  onSelectCommunity: (id: string | number) => void;
}

const CommunitySidebar: React.FC<CommunitySidebarProps> = ({
  communities,
  selectedCommunityId,
  onSelectCommunity,
}) => {
  const renderCommunityItem = (community: Community) => {
    const isActive = String(community.id) === String(selectedCommunityId);
    return (
      <button
        key={community.id}
        onClick={() => onSelectCommunity(community.id)}
        className={`w-full text-left px-3 py-2 rounded-xl border transition-all flex flex-col gap-1 ${
          isActive
            ? "bg-white border-teal-200 shadow-sm"
            : "bg-gray-50 border-transparent hover:bg-white hover:border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-teal-600 bg-teal-50">
              <FiGlobe />
            </div>
            <div className="font-semibold text-gray-800">{community.name}</div>
          </div>
          <FiChevronRight className="text-gray-400" />
        </div>
        <span className="text-xs text-gray-500">
          {community.memberCount ?? 0} members
        </span>
      </button>
    );
  };

  return (
    <aside className="col-span-12 md:col-span-3 space-y-4">
      <div className="px-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Communities
        </p>
        <div className="space-y-2">
          {communities.length === 0 && (
            <div className="text-sm text-gray-500">Chưa có cộng đồng.</div>
          )}
          {communities.map(renderCommunityItem)}
        </div>
      </div>
    </aside>
  );
};

export default CommunitySidebar;


