import type React from "react";
import { leaderboardUsers } from "~/data/communityData";

const LeaderBoard: React.FC = () => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <h3 className="font-bold text-lg mb-4">🏆 Leaderboard</h3>
            <ul className="space-y-4">
                {leaderboardUsers.map((user, index) => (
                    <li key={user.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-500">{index + 1}</span>
                            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full" />
                            <span className="font-semibold text-gray-800">{user.name}</span>
                        </div>
                        <span className="font-bold text-teal-600">{user.points} pts</span>
                    </li>
                ))}
            </ul>
        </div>
    )
};
export default LeaderBoard;