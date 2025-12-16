import { message } from "antd";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiGlobe } from "react-icons/fi";
import CreateThreadModal from "~/components/community/CreateThreadModal";
import { useAuth } from "~/hooks/useAuth";
import useCommunity from "~/hooks/useCommunity";
import type { Thread } from "~/types/community";
import CommunitySidebar from "~/components/community/CommunitySidebar";
import PostComposer from "~/components/community/PostComposer";
import PostList from "~/components/community/PostList";
import CommunityInfoSidebar from "~/components/community/CommunityInfoSidebar";

const CommunityPage: React.FC = () => {

    const { user } = useAuth();
    const {
        fetchCommunities,
        fetchCommunityPosts,
        createCommunityPost,
        communities,
        communityPosts,
        loading,
        error,
    } = useCommunity();
    const [selectedCommunityId, setSelectedCommunityId] = useState<string | number | null>(null);
    const [isThreadModalVisible, setIsThreadModalVisible] = useState(false);
    const userAvatar = useMemo(() => {
        const url = user?.imgUrl || (user as { avatar?: string } | undefined)?.avatar;
        if (!url) return "https://i.pravatar.cc/150?u=community-default";
        // Nếu backend trả về path tương đối thì prefix bằng API_URL, còn lại giữ nguyên
        return url.startsWith("http") ? url : `${import.meta.env.VITE_API_URL}${url}`;
    }, [user]);
    const userDisplayName = useMemo(
        () => (user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "User" : "User"),
        [user]
    );

    // Lấy danh sách communities
    useEffect(() => {
        fetchCommunities({ page: 0, size: 10 });
    }, [fetchCommunities]);

    // Set community mặc định
    useEffect(() => {
        if (communities.length > 0 && !selectedCommunityId) {
            setSelectedCommunityId(communities[0].id);
        }
    }, [communities, selectedCommunityId]);

    // Lấy posts theo community đã chọn
    useEffect(() => {
        if (selectedCommunityId) {
            fetchCommunityPosts(selectedCommunityId, { page: 0, size: 20 });
        }
    }, [selectedCommunityId, fetchCommunityPosts]);

    // Thông báo lỗi nếu có
    useEffect(() => {
        if (error) {
            message.error(error);
        }
    }, [error]);

    // Chuẩn hoá posts từ API cho ThreadCard
    const normalizedThreads = useMemo<Thread[]>(() => {
        const apiBase = import.meta.env.VITE_API_URL || "";

        const resolveImageUrl = (url?: string | null): string | null => {
            if (!url) return null;
            return url.startsWith("http") ? url : `${apiBase}${url}`;
        };

        return communityPosts.map((post) => {
            const asAny = post as unknown as {
                tags?: unknown;
                image?: unknown;
                imageUrl?: unknown;
                imgUrl?: unknown;
                author?: {
                    firstName?: string;
                    lastName?: string;
                    username?: string;
                    imgUrl?: string;
                    avatar?: string;
                };
            };

            const rawTags = asAny.tags;

            const author = asAny.author;
            const authorFullName = author
                ? `${author.firstName ?? ""} ${author.lastName ?? ""}`.trim()
                : "";

            const displayName =
                post.authorName ||
                authorFullName ||
                author?.username ||
                "User";

            const avatarUrl =
                (post.authorAvatar as string | undefined) ||
                author?.imgUrl ||
                author?.avatar ||
                "https://i.pravatar.cc/150";

            const rawImage =
                (asAny.image as string | undefined) ||
                (asAny.imageUrl as string | undefined) ||
                (asAny.imgUrl as string | undefined);

            return {
                id: Number(post.id) || 0, // Fallback nếu không convert được
                postId: post.id, // Giữ nguyên ID gốc từ BE (UUID string) để dùng cho API
                user: {
                    name: displayName,
                    avatar: resolveImageUrl(avatarUrl) ?? "https://i.pravatar.cc/150",
                },
                content: post.content,
                tags: Array.isArray(rawTags) ? (rawTags as string[]) : [],
                likes: Number(post.likeCount ?? 0),
                comments: Number(post.commentCount ?? 0),
                image: resolveImageUrl(rawImage) as string | null,
                commentsData: [],
                groupId: post.communityId ? Number(post.communityId) : undefined,
                groupName: communities.find((c) => String(c.id) === String(post.communityId))?.name,
            };
        });
    }, [communityPosts, communities]);

    const displayedThreads = normalizedThreads;


    const handleCreateThread = async (values: { title: string; content: string; imageFile?: File }) => {
        if (!user || !selectedCommunityId) return;
        await createCommunityPost(selectedCommunityId, {
            title: values.title,
            content: values.content,
            image: values.imageFile,
        });
        message.success("Your thread has been posted!");
        setIsThreadModalVisible(false);
    };

    const currentCommunity = useMemo(
        () => communities.find((c) => String(c.id) === String(selectedCommunityId)),
        [communities, selectedCommunityId]
    );

    const onlineEstimate = useMemo(() => {
        const members = Number(currentCommunity?.memberCount ?? 0);
        return members > 0 ? Math.max(1, Math.round(members * 0.08)) : 0;
    }, [currentCommunity]);

    return (
        <div className="bg-[#f5f7fb] min-h-screen">
            <main className="max-w-7xl mx-auto py-6 px-4">
                <div className="flex flex-col gap-6">
                    {/* top search */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-gray-200 focus:outline-none focus:border-teal-400"
                                placeholder="Search in community..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-6">
                        {/* Left sidebar communities */}
                        <CommunitySidebar
                            communities={communities}
                            selectedCommunityId={selectedCommunityId}
                            onSelectCommunity={setSelectedCommunityId}
                        />

                        {/* Center content */}
                        <section className="col-span-12 md:col-span-6 space-y-4">
                            {/* hero */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 text-2xl">
                                    <FiGlobe />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900">{currentCommunity?.name || "General Chat"}</h2>
                                    <p className="text-sm text-gray-600">
                                        {currentCommunity?.description || "Talk about anything and everything."}
                                    </p>
                                </div>
                            </div>

                            {/* post box */}
                            <PostComposer
                                userAvatar={userAvatar}
                                userDisplayName={userDisplayName}
                                communityName={currentCommunity?.name}
                                onOpenComposer={() => setIsThreadModalVisible(true)}
                            />

                            {/* posts */}
                            <PostList loading={loading} threads={displayedThreads} />
                        </section>

                        {/* Right sidebar */}
                        <CommunityInfoSidebar
                            description={currentCommunity?.description}
                            memberCount={currentCommunity?.memberCount}
                            onlineEstimate={onlineEstimate}
                        />
                    </div>
                </div>
            </main>
            <CreateThreadModal
                visible={isThreadModalVisible}
                onClose={() => setIsThreadModalVisible(false)}
                onSubmit={handleCreateThread}
            />
        </div>
    );
};
export default CommunityPage;
