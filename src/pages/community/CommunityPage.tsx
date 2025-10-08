import { message } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import type React from "react";
import { useState } from "react";
import { FiMessageCircle, FiPlus, FiUser, FiUsers } from "react-icons/fi";
import CreateGroupModal from "~/components/community/CreateGroupModal";
import CreateThreadModal from "~/components/community/CreateThreadModal";
import StudyGroupCard from "~/components/community/StudyGroupCard";
import ThreadCard from "~/components/community/ThreadCard";
import { threads as initialThreads } from '~/data/communityData';
import { useAuth } from "~/hooks/useAuth";
import type { StudyGroup, Thread } from "~/types/community";

const mockGroups: StudyGroup[] = [
    { id: 1, name: 'IELTS 7.0 Aimers', description: 'Cùng nhau chia sẻ tài liệu và kinh nghiệm để đạt mục tiêu IELTS 7.0+', avatar: 'https://placehold.co/100x100/3CBCB2/FFFFFF?text=IELTS', bannerImage: '', memberCount: 120, tags: ['ielts', 'english'], privacy: 'public', members: [] },
    { id: 2, name: 'ReactJS Developers VN', description: 'Nơi thảo luận về React, Next.js và hệ sinh thái Javascript.', avatar: 'https://placehold.co/100x100/F5A623/FFFFFF?text=React', bannerImage: '', memberCount: 450, tags: ['react', 'frontend'], privacy: 'public', members: [] },
];

const CommunityPage: React.FC = () => {

    const { user } = useAuth();
    const [threads, setThreads] = useState<Thread[]>(initialThreads);
    const [isThreadModalVisible, setIsThreadModalVisible] = useState(false);
    const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
    const [view, setView] = useState<'threads' | 'groups' | 'my-threads'>('threads'); // State để quản lý view

    const displayedThreads = view === 'my-threads'
        ? threads.filter(thread => thread.user.name === user?.firstName + ' ' + user?.lastName)
        : threads;


    const handleCreateThread = (values: { content: string, tags: string, image?: UploadFile }) => {
        if (user) {
            const newThread = {
                id: threads.length + 1,
                user: { name: user.firstName + ' ' + user.lastName, avatar: user.imgUrl || 'https://i.pravatar.cc/150' },
                content: values.content,
                tags: values.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                likes: 0,
                comments: 0,
                image: values.image?.originFileObj ? URL.createObjectURL(values.image.originFileObj) : null,
                commentsData: [],
                groupId: undefined,
                groupName: undefined
            };
            // Thêm bài viết mới lên đầu danh sách
            setThreads(prev => [newThread, ...prev]);
            message.success("Your thread has been posted!");
            setIsThreadModalVisible(false);
        }
    };

    const handleCreateGroup = (values: { name: string, description: string, tags: string, privacy: 'public' | 'private', avatar?: UploadFile }) => {
        if (user) {
            const newGroup: StudyGroup = {
                id: mockGroups.length + 1,
                name: values.name,
                description: values.description,
                avatar: values.avatar?.originFileObj ? URL.createObjectURL(values.avatar.originFileObj) : '',
                bannerImage: '',
                memberCount: 0,
                tags: values.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                privacy: values.privacy,
                members: [],
            };
            mockGroups.push(newGroup);
            message.success("Your group has been created!");
            setIsGroupModalVisible(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <main className="max-w-7xl mx-auto py-10 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* col 1 navigation */}
                    <aside className="hidden lg:block lg:col-span-1 self-start sticky top-10">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <nav className="space-y-2">
                                <button onClick={() => setView('threads')} className={`w-full flex items-center gap-3 px-3 py-2 hover:cursor-pointer rounded-md font-bold ${view === 'threads' ? 'text-teal-600 bg-teal-50' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <FiMessageCircle /> Threads
                                </button>
                                <button onClick={() => setView('groups')} className={`w-full flex items-center gap-3 px-3 py-2 hover:cursor-pointer rounded-md font-bold ${view === 'groups' ? 'text-teal-600 bg-teal-50' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <FiUsers /> Study Groups
                                </button>
                                <button onClick={() => setView('my-threads')} className={`w-full flex items-center gap-3 px-3 py-2 hover:cursor-pointer rounded-md font-bold ${view === 'my-threads' ? 'text-teal-600 bg-teal-50' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <FiUser /> My Thread
                                </button>
                            </nav>
                        </div>
                    </aside>
                    {/* col 2 main feed */}
                    <div className="col-span-1 lg:col-span-2 space-y-6">
                        {/* Create Post */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
                            <img src={user?.imgUrl} alt="user" className="w-10 h-10 rounded-full" />
                            {view === 'threads' ? (
                                <>
                                    <div className="w-full bg-gray-100 rounded-full px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-200" onClick={() => setIsThreadModalVisible(true)}>
                                        Add new thread...
                                    </div>
                                    <button onClick={() => setIsThreadModalVisible(true)} className="bg-teal-500 text-white p-2.5 rounded-full hover:bg-teal-600 hover:cursor-pointer"><FiPlus size={20} /></button>
                                </>
                            ) : (
                                <>
                                    <div className="w-full bg-gray-100 rounded-full px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-200" onClick={() => setIsGroupModalVisible(true)}>
                                        Create a new study group...
                                    </div>
                                    <button onClick={() => setIsGroupModalVisible(true)} className="bg-teal-500 text-white p-2.5 rounded-full hover:bg-teal-600 hover:cursor-pointer"><FiPlus size={20} /></button>
                                </>
                            )}
                        </div>

                        {/* Thread List */}
                        {view === 'threads' ? (
                            threads.map(thread => <ThreadCard key={thread.id} thread={thread} />)
                        ) : view === 'my-threads' ? (
                            displayedThreads.map(thread => <ThreadCard key={thread.id} thread={thread} />)

                        ) : (
                            mockGroups.map(group => <StudyGroupCard key={group.id} group={group} />)
                        )}
                        {displayedThreads.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-gray-500">No threads to display.</p>
                            </div>
                        )}
                    </div>
                    {/* Col 3: Sidebar */}
                    <aside className="col-span-1 space-y-6 self-start sticky top-10">
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 text-center">
                            <img src={user?.imgUrl} alt="user avatar" className="w-20 h-20 rounded-full mx-auto mb-3" />
                            <h4 className="font-bold text-gray-800">{user?.firstName}</h4>
                            <div className="flex justify-around text-center my-4">
                                <div><p className="font-bold text-lg">5,432</p><p className="text-xs text-gray-500">Posts</p></div>
                                <div><p className="font-bold text-lg">39</p><p className="text-xs text-gray-500">Followers</p></div>
                                <div><p className="font-bold text-lg">4</p><p className="text-xs text-gray-500">Following</p></div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
            <CreateThreadModal
                visible={isThreadModalVisible}
                onClose={() => setIsThreadModalVisible(false)}
                onSubmit={handleCreateThread}
            />
            <CreateGroupModal
                visible={isGroupModalVisible}
                onClose={() => setIsGroupModalVisible(false)}
                onSubmit={handleCreateGroup}
            />
        </div>
    )
};
export default CommunityPage;
