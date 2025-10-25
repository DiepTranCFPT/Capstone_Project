import React from "react";
import { Tabs } from 'antd';
import { leaderboardUsers, dailyLeaderboardUsers, monthlyLeaderboardUsers, allTimeLeaderboardUsers } from "~/data/communityData";
import { Link } from 'react-router-dom';

const { TabPane } = Tabs;

const getRankIcon = (index: number) => {
    switch (index) {
        case 0: return '🥇';
        case 1: return '🥈';
        case 2: return '🥉';
        default: return index + 1;
    }
};

const getRankChangeIcon = (change: number) => {
    if (change > 0) return <span className="text-green-500">⬆{change}</span>;
    if (change < 0) return <span className="text-red-500">⬇{Math.abs(change)}</span>;
    return <span className="text-gray-400">—</span>;
};

const LeaderboardList = ({ users, showTop5 = false }: { users: typeof leaderboardUsers; showTop5?: boolean }) => {
    const displayUsers = showTop5 ? users.slice(0, 5) : users;
    return (
        <ul className="space-y-4">
            {displayUsers.map((user, index) => (
                <li key={user.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center gap-3">
                        <span className={`font-semibold ${index < 3 ? 'text-yellow-500 animate-pulse' : 'text-gray-500'}`}>
                            {getRankIcon(index)}
                        </span>
                        <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full transition-transform duration-300 hover:scale-110" />
                        <span className="font-semibold text-gray-800">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {getRankChangeIcon(user.rankChange || 0)}
                        <span className="font-bold text-teal-600 transition-colors duration-300 hover:text-teal-800">{user.points} pts</span>
                    </div>
                </li>
            ))}
        </ul>
    );
};

const LeaderBoard: React.FC = () => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg mx-auto shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">🏆 Leaderboard</h3>
                <Link to="/ranking" className="text-teal-600 hover:text-teal-800 text-sm font-semibold">
                    View All
                </Link>
            </div>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Daily" key="1">
                    <LeaderboardList users={dailyLeaderboardUsers} showTop5={true} />
                </TabPane>
                <TabPane tab="Weekly" key="2">
                    <LeaderboardList users={leaderboardUsers} showTop5={true} />
                </TabPane>
                <TabPane tab="Monthly" key="3">
                    <LeaderboardList users={monthlyLeaderboardUsers} showTop5={true} />
                </TabPane>
                <TabPane tab="All Time" key="4">
                    <LeaderboardList users={allTimeLeaderboardUsers} showTop5={true} />
                </TabPane>
            </Tabs>
        </div>
    );
};
export default LeaderBoard;
