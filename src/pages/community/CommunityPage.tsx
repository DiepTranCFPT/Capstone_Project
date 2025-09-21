import { message } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import type React from "react";
import { useState } from "react";
import { FiBookmark, FiHome, FiMessageCircle, FiPlus } from "react-icons/fi";
import CreateThreadModal from "~/components/community/CreateThreadModal";
import LeaderBoard from "~/components/community/Leaderboard";
import ThreadCard from "~/components/community/ThreadCard";
import { threads as initialThreads } from '~/data/communityData';
import { useAuth } from "~/hooks/useAuth";

const CommunityPage: React.FC = () => {

    const { user } = useAuth();
    const [threads, setThreads] = useState(initialThreads);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [view, setView] = useState<'all' | 'my-threads'>('all'); // State để quản lý view

    const displayedThreads = view === 'my-threads'
        ? threads.filter(thread => thread.user.name === user?.name)
        : threads;

    const handleCreateThread = (values: { content: string, tags: string, image?: UploadFile }) => {
        if (user) {
            const newThread = {
                id: threads.length + 1,
                user: { name: user.name, avatar: user.avatar || 'https://i.pravatar.cc/150' },
                content: values.content,
                tags: values.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                likes: 0,
                comments: 0,
                image: values.image?.originFileObj ? URL.createObjectURL(values.image.originFileObj) : null,
                commentsData: [],
            };
            // Thêm bài viết mới lên đầu danh sách
            setThreads(prev => [newThread, ...prev]);
            message.success("Your thread has been posted!");
            setIsModalVisible(false);
        }
    };
    return (
        <div className="bg-gray-50 min-h-screen">
            <main className="max-w-7xl mx-auto py-10 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* col 1 navigation */}
                    <aside className="hidden lg:block lg:col-span-1">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <nav className="space-y-2">
                                <button onClick={() => setView('all')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md  hover:cursor-pointer font-bold ${view === 'all' ? 'text-teal-600 bg-teal-50' : 'text-gray-600 hover:bg-gray-100'}`}><FiHome /> Home</button>
                                <button onClick={() => setView('my-threads')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md  hover:cursor-pointer font-semibold ${view === 'my-threads' ? 'text-teal-600 bg-teal-50' : 'text-gray-600 hover:bg-gray-100'}`}><FiMessageCircle /> Your Threads</button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md  hover:cursor-pointer font-semibold"><FiBookmark /> Saved</button>
                            </nav>
                        </div>
                    </aside>
                    {/* col 2 main feed */}
                    <div className="col-span-1 lg:col-span-2 space-y-6">
                        {/* Create Post */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
                            <img src={user?.avatar} alt="user" className="w-10 h-10 rounded-full" />
                            <div
                                className="w-full bg-gray-100 rounded-full px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-200"
                                onClick={() => setIsModalVisible(true)}
                            >
                                Add new thread...
                            </div>
                            <button onClick={() => setIsModalVisible(true)} className="bg-teal-500 text-white p-2.5 rounded-full hover:bg-teal-600"><FiPlus size={20} /></button>
                        </div>

                        {/* Thread List */}
                        {displayedThreads.map(thread => (
                            <ThreadCard key={thread.id} thread={thread} />
                        ))}
                        {displayedThreads.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-gray-500">No threads to display.</p>
                            </div>
                        )}
                    </div>
                    {/* Col 3: Sidebar */}
                    <aside className="col-span-1 space-y-6">
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 text-center">
                            <img src={user?.avatar} alt="user avatar" className="w-20 h-20 rounded-full mx-auto mb-3" />
                            <h4 className="font-bold text-gray-800">{user?.name}</h4>
                            <div className="flex justify-around text-center my-4">
                                <div><p className="font-bold text-lg">5,432</p><p className="text-xs text-gray-500">Posts</p></div>
                                <div><p className="font-bold text-lg">39</p><p className="text-xs text-gray-500">Followers</p></div>
                                <div><p className="font-bold text-lg">4</p><p className="text-xs text-gray-500">Following</p></div>
                            </div>
                        </div>
                        <LeaderBoard />
                    </aside>
                </div>
            </main>
            <CreateThreadModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSubmit={handleCreateThread}
            />
        </div>
    )
};
export default CommunityPage;
