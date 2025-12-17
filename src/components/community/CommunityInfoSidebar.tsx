import type React from "react";

interface CommunityInfoSidebarProps {
  description?: string;
  memberCount?: number;
  onlineEstimate: number;
}

const CommunityInfoSidebar: React.FC<CommunityInfoSidebarProps> = ({
  description,
  memberCount,
  onlineEstimate,
}) => {
  return (
    <aside className="col-span-12 md:col-span-3 space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            About
          </p>
          <p className="text-sm text-gray-700">
            {description || "Talk about anything and everything."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
            <p className="text-xs text-gray-500">Members</p>
            <p className="text-xl font-bold text-gray-900">{memberCount ?? 0}</p>
          </div>
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
            <p className="text-xs text-gray-500">Online</p>
            <p className="text-xl font-bold text-gray-900">{onlineEstimate}</p>
          </div>
        </div>
      </div>

    </aside>
  );
};

export default CommunityInfoSidebar;


