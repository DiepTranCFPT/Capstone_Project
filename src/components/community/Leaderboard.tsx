import React from "react";
import { Tabs } from 'antd';
import { leaderboardUsers } from "~/data/communityData";

const { TabPane } = Tabs;

const LeaderboardList = ({ users }: { users: typeof leaderboardUsers }) => (
    <ul className="space-y-4">
        {users.map((user, index) => (
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
);

const LeaderBoard: React.FC = () => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg mx-auto shadow-sm p-5">
            <h3 className="font-bold text-lg mb-4">🏆 Leaderboard</h3>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Weekly" key="1">
                    <LeaderboardList users={leaderboardUsers} />
                </TabPane>
                <TabPane tab="Monthly" key="2">
                    <LeaderboardList users={[...leaderboardUsers].reverse()} />
                </TabPane>
                <TabPane tab="All Time" key="3">
                    <LeaderboardList users={leaderboardUsers} />
                </TabPane>
            </Tabs>
        </div>
    )
};
export default LeaderBoard;
