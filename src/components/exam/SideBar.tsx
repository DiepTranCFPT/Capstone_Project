import { IoStatsChart } from "react-icons/io5";
import { FaUnlockAlt } from "react-icons/fa"; // Icon mới
import { useAuth } from "~/hooks/useAuth";

interface SidebarProps {
    isUnlockable?: boolean; // Prop để xác định trạng thái có thể mở khóa
    onUnlock?: () => void;   // Prop để truyền hàm xử lý mở khóa
}

const Sidebar: React.FC<SidebarProps> = ({ isUnlockable = true, onUnlock }) => {
    const { user } = useAuth();

    return (
        <aside className="space-y-6 w-full md:w-1/3 lg:w-1/4">
            <div className="bg-white border border-gray-200 rounded-lg shadow p-5 text-center sticky top-28">
                <img src={user?.avatar} alt="avatar" className="w-20 h-20 rounded-full mx-auto mb-3" />
                <h4 className="font-bold text-gray-800">{user?.name}</h4>
                <p className="text-sm text-gray-400">{user?.email}</p>
                <div className="mt-4 space-y-2">
                    <div
                        onClick={isUnlockable ? onUnlock : undefined}
                        className={`flex items-center justify-center text-textTealColor py-2.5 px-1 gap-2 rounded-lg border border-backgroundColor transform transition-all duration-200
                                  ${isUnlockable ? 'cursor-pointer hover:scale-105 bg-teal-50 hover:shadow-lg' : 'cursor-not-allowed bg-gray-100 text-gray-400 border-gray-300'}`}
                    >
                        {isUnlockable ? <FaUnlockAlt /> : <IoStatsChart />}
                        <button
                            className={`text-sm text-center font-semibold ${isUnlockable ? 'cursor-pointer ' : 'cursor-not-allowed bg-gray-100 text-gray-400 border-gray-300'}`}
                            disabled={!isUnlockable}
                        >
                            {isUnlockable ? "Unlock Advanced Report" : "Result Statistics"}
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    )
};

export default Sidebar;