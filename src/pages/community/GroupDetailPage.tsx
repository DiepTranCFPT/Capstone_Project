import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, Button } from 'antd';
import { FiUsers, FiFileText, FiMessageSquare, FiSettings } from 'react-icons/fi';
import { threads as allThreads } from '../../data/communityData';
import ThreadCard from '../../components/community/ThreadCard';
import type { StudyGroup, UserInfo } from '../../types/community';
import { useAuth } from '../../hooks/useAuth';

// Dữ liệu giả lập, sẽ được thay bằng API trong ứng dụng thực tế
const mockGroups: StudyGroup[] = [
    {
        id: 1, name: 'IELTS 7.0 Aimers', description: 'Cùng nhau chia sẻ tài liệu và kinh nghiệm để đạt mục tiêu IELTS 7.0+', avatar: 'https://placehold.co/100x100/3CBCB2/FFFFFF?text=IELTS', bannerImage: 'https://placehold.co/1200x300/E2E8F0/A0AEC0?text=Study+Banner', memberCount: 123, tags: ['ielts', 'english'], privacy: 'public', members: [
            { name: 'Sontung MTP', avatar: 'https://i.pravatar.cc/150?img=3' },
            { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
            { name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
            { name: 'Emily White', avatar: 'https://i.pravatar.cc/150?img=5' },
            { name: 'Chris Green', avatar: 'https://i.pravatar.cc/150?img=6' },
        ]
    },
    { id: 2, name: 'ReactJS Developers VN', description: 'Nơi thảo luận về React, Next.js và hệ sinh thái Javascript.', avatar: 'https://placehold.co/100x100/F5A623/FFFFFF?text=React', bannerImage: 'https://placehold.co/1200x300/D4E2F0/A0AEC0?text=Code+Banner', memberCount: 450, tags: ['react', 'frontend'], privacy: 'public', members: [] },
];


const GroupDetailPage: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const { user } = useAuth();
    const [group, setGroup] = useState<StudyGroup | null>(null);

    React.useEffect(() => {
        const foundGroup = mockGroups.find(g => g.id.toString() === groupId);
        setGroup(foundGroup || null);
    }, [groupId]);

    // Lọc các bài viết thuộc về nhóm này
    const groupThreads = allThreads.filter(thread => thread.groupId?.toString() === groupId);

    if (!group) {
        return <div className="text-center p-10">Không tìm thấy nhóm.</div>;
    }

    const MemberList = ({ members }: { members: UserInfo[] }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                    <span className="font-semibold text-gray-800">{member.name}</span>
                </div>
            ))}
        </div>
    );

    const tabItems = [
        {
            key: '1',
            label: (
                <span className="flex items-center gap-2"><FiMessageSquare /> Thảo luận</span>
            ),
            children: (
                <div className="space-y-6">
                    {/* Box tạo bài viết trong nhóm */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
                        <img src={user?.imgUrl} alt="user" className="w-10 h-10 rounded-full" />
                        <div className="w-full bg-gray-100 rounded-full px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-200">
                            Bắt đầu một cuộc thảo luận trong {group.name}...
                        </div>
                    </div>
                    {groupThreads.length > 0 ? (
                        groupThreads.map(thread => <ThreadCard key={thread.id} thread={thread} />)
                    ) : (
                        <div className="text-center py-10 text-gray-500">Chưa có bài thảo luận nào. Hãy là người đầu tiên!</div>
                    )}
                </div>
            ),
        },
        {
            key: '2',
            label: (
                <span className="flex items-center gap-2"><FiUsers /> Thành viên ({group.memberCount})</span>
            ),
            children: <MemberList members={group.members} />,
        },
        {
            key: '3',
            label: (
                <span className="flex items-center gap-2"><FiFileText /> Tài liệu</span>
            ),
            children: <div className="text-center py-10 text-gray-500">Chưa có tài liệu nào được chia sẻ.</div>,
        },
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Ảnh bìa và thông tin nhóm */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="h-48 md:h-64 bg-center bg-cover rounded-b-lg" style={{ backgroundImage: `url(${group.bannerImage})` }}></div>
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-12">
                            <img src={group.avatar} alt={group.name} className="w-32 h-32 rounded-full border-4 border-white object-cover" />
                            <div className="flex-1 py-4 text-center sm:text-left">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{group.name}</h1>
                                <p className="text-gray-600 mt-1">{group.description}</p>
                            </div>
                            <div className="pb-4 flex items-center gap-2">
                                <Button type="primary" className="bg-teal-500 hover:bg-teal-600">Tham gia Nhóm</Button>
                                <Button icon={<FiSettings />} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nội dung chính với các Tab */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Tabs defaultActiveKey="1" items={tabItems} />
            </main>
        </div>
    );
};

export default GroupDetailPage;

