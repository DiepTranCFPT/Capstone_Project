import React from 'react';
import { Tabs, Button, Avatar } from 'antd';
import { leaderboardUsers, dailyLeaderboardUsers, monthlyLeaderboardUsers, allTimeLeaderboardUsers } from '../../data/communityData';
import { FaTrophy, FaUserFriends, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

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
    if (change > 0) return <span className="text-green-500 text-sm">⬆{change}</span>;
    if (change < 0) return <span className="text-red-500 text-sm">⬇{Math.abs(change)}</span>;
    return <span className="text-gray-400 text-sm">—</span>;
};

// Reusable component to display the list with enhanced features
const LeaderboardListWithChallenge = ({ users, currentUserId }: { users: typeof leaderboardUsers; currentUserId?: string | number }) => {
    const navigate = useNavigate();

    const handleChallenge = (userId: number, userName: string) => {
        navigate('/student/quiz-battle', { state: { challengedUserId: userId, challengedUserName: userName } });
    };

    const handleViewProfile = () => {
        // Placeholder: Navigate to profile page
        navigate('/student/profile');
    };

    return (
        <ul className="space-y-4">
            {users.map((user, index) => {
                const isCurrentUser = currentUserId !== undefined && String(user.id) === String(currentUserId);
                return (
                    <li key={user.id} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 hover:scale-105 ${isCurrentUser ? 'bg-teal-50 border-2 border-teal-200 animate-pulse' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        <div className="flex items-center gap-4">
                            <span className={`font-bold text-lg w-8 text-center ${index < 3 ? 'text-yellow-500 animate-bounce' : 'text-gray-500'}`}>
                                {getRankIcon(index)}
                            </span>
                            <Avatar src={user.avatar} size="large" className="transition-transform duration-300 hover:scale-110" />
                            <div>
                                <span className={`font-semibold text-base ${isCurrentUser ? 'text-teal-600' : 'text-gray-800'}`}>
                                    {user.name} {isCurrentUser && '(You)'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-gray-500">{user.points} points</p>
                                    {getRankChangeIcon(user.rankChange || 0)}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="default"
                                icon={<FaEye />}
                                size="small"
                                onClick={handleViewProfile}
                                className="border-gray-300 transition-colors duration-300 hover:bg-gray-100"
                            >
                                Profile
                            </Button>
                            <Button
                                type="primary"
                                icon={<FaUserFriends />}
                                size="small"
                                onClick={() => handleChallenge(user.id, user.name)}
                                className="bg-teal-500 hover:bg-teal-600 border-teal-500 transition-all duration-300 hover:scale-105"
                            >
                                Challenge
                            </Button>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

const RankingPage: React.FC = () => {
    const { user } = useAuth();
    const currentUserId = user?.id || 1; // Assuming user.id is available, default to 1 for demo

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <main className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <FaTrophy className="text-5xl text-yellow-500 mx-auto mb-2" />
                    <h1 className="text-4xl font-bold text-gray-800">Leaderboard</h1>
                    <p className="text-gray-600 mt-1">See who's leading the pack!</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <Tabs defaultActiveKey="1" centered>
                        <TabPane tab="Daily" key="1">
                            <LeaderboardListWithChallenge users={dailyLeaderboardUsers} currentUserId={currentUserId} />
                        </TabPane>
                        <TabPane tab="Weekly" key="2">
                            <LeaderboardListWithChallenge users={leaderboardUsers} currentUserId={currentUserId} />
                        </TabPane>
                        <TabPane tab="Monthly" key="3">
                            <LeaderboardListWithChallenge users={monthlyLeaderboardUsers} currentUserId={currentUserId} />
                        </TabPane>
                        <TabPane tab="All Time" key="4">
                            <LeaderboardListWithChallenge users={allTimeLeaderboardUsers} currentUserId={currentUserId} />
                        </TabPane>
                    </Tabs>
                </div>
            </main>
        </div>
    );
};

export default RankingPage;
