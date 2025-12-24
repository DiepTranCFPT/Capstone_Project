import { message } from "antd";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiSearch, FiGlobe } from "react-icons/fi";
import CreateThreadModal from "~/components/community/CreateThreadModal";
import { useAuth } from "~/hooks/useAuth";
import useCommunity from "~/hooks/useCommunity";
import type { Thread } from "~/types/community";
import CommunitySidebar from "~/components/community/CommunitySidebar";
import PostComposer from "~/components/community/PostComposer";
import PostList from "~/components/community/PostList";
import CommunityInfoSidebar from "~/components/community/CommunityInfoSidebar";
import { getHighestPriorityRole } from "~/utils/roleUtils";

const CommunityPage: React.FC = () => {
    const location = useLocation();
    const { user } = useAuth();
    const {
        fetchCommunities,
        fetchCommunityPosts,
        createCommunityPost,
        deletePost,
        votePost,
        pinPost,
        communities,
        communityPosts,
        loading,
        error,
    } = useCommunity();
    const [selectedCommunityId, setSelectedCommunityId] = useState<string | number | null>(null);
    const [isThreadModalVisible, setIsThreadModalVisible] = useState(false);
    // Avatar mặc định thống nhất cho tất cả user chưa có ảnh
    const DEFAULT_AVATAR = "https://i.pravatar.cc/150?u=default-user";
    
    const userAvatar = useMemo(() => {
        const url = user?.imgUrl || (user as { avatar?: string } | undefined)?.avatar;
        if (!url) return DEFAULT_AVATAR;
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

    // Set community mặc định hoặc từ navigation state
    useEffect(() => {
        // Kiểm tra nếu có state từ navigation (từ admin page)
        const state = location.state as { selectedCommunityId?: string | number } | null;
        if (state?.selectedCommunityId) {
            setSelectedCommunityId(state.selectedCommunityId);
            return;
        }
        
        // Nếu không có state, chọn community đầu tiên
        if (communities.length > 0 && !selectedCommunityId) {
            setSelectedCommunityId(communities[0].id);
        }
    }, [communities, selectedCommunityId, location.state]);

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
                voteCount?: unknown;
                userVoteValue?: unknown;
                author?: {
                    firstName?: string;
                    lastName?: string;
                    username?: string;
                    imgUrl?: string;
                    avatar?: string;
                    role?: string | string[];
                    roles?: string | string[];
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
                DEFAULT_AVATAR;

            const rawImage =
                (asAny.image as string | undefined) ||
                (asAny.imageUrl as string | undefined) ||
                (asAny.imgUrl as string | undefined);

            const rawVoteCount = typeof asAny.voteCount === "number"
                ? (asAny.voteCount as number)
                : undefined;

            const rawUserVoteValue = typeof asAny.userVoteValue === "number"
                ? (asAny.userVoteValue as number)
                : 0;

            // Lấy pinned từ post (BE dùng field `pinned`, nhưng vẫn fallback từ isPinned nếu còn)
            const pinned =
              typeof (post as { pinned?: boolean }).pinned === "boolean"
                ? (post as { pinned?: boolean }).pinned
                : typeof (post as { isPinned?: boolean }).isPinned === "boolean"
                  ? (post as { isPinned?: boolean }).isPinned
                  : false;

            // Lấy role từ author (có thể là role hoặc roles)
            // Nếu post được tạo bởi user hiện tại, ưu tiên lấy role từ user hiện tại
            let userRole = author?.role ?? author?.roles ?? undefined;
            
            // Nếu post là của user hiện tại và không có role từ author, lấy từ user hiện tại
            if (!userRole && user && String(post.authorId) === String(user.id)) {
                const userWithRole = user as { role?: string | string[]; roles?: string | string[] };
                userRole = userWithRole?.role ?? userWithRole?.roles ?? undefined;
            }
            
            // Lấy role có độ ưu tiên cao nhất nếu user có nhiều roles
            if (userRole) {
                const highestRole = getHighestPriorityRole(userRole);
                if (highestRole) {
                    userRole = highestRole;
                }
            }

            return {
                id: Number(post.id) || 0, // Fallback nếu không convert được
                postId: post.id, // Giữ nguyên ID gốc từ BE (UUID string) để dùng cho API
                user: {
                    name: displayName,
                    avatar: resolveImageUrl(avatarUrl) ?? DEFAULT_AVATAR,
                },
                content: post.content,
                tags: Array.isArray(rawTags) ? (rawTags as string[]) : [],
                // Ưu tiên voteCount từ BE, fallback về likeCount cũ nếu có
                likes: Number(rawVoteCount ?? post.likeCount ?? 0),
                comments: Number(post.commentCount ?? 0),
                image: resolveImageUrl(rawImage) as string | null,
                commentsData: [],
                groupId: post.communityId ? Number(post.communityId) : undefined,
                groupName: communities.find((c) => String(c.id) === String(post.communityId))?.name,
                authorId: post.authorId ?? (author as { id?: string | number } | undefined)?.id,
                userVoteValue: rawUserVoteValue,
                userRole: userRole,
                createdAt: post.createdAt,
                pinned: pinned,
            };
        });
    }, [communityPosts, communities, user]);

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

    const handleVotePost = async (postId: string | number, value: number) => {
        // value: +1 khi like, -1 khi bỏ like
        await votePost(postId, value);
    };

    const handlePinPost = async (postId: string | number) => {
        await pinPost(postId);
        // Re-fetch posts để đảm bảo data đồng bộ với backend
        if (selectedCommunityId) {
            await fetchCommunityPosts(selectedCommunityId, { page: 0, size: 100 });
        }
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
                    {/* top search
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-gray-200 focus:outline-none focus:border-teal-400"
                                placeholder="Search in community...aaaa"
                            />
                        </div>
                    </div> */}

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
                            <PostList 
                                loading={loading} 
                                threads={displayedThreads}
                                onDeletePost={deletePost}
                                onVotePost={handleVotePost}
                                onPinPost={handlePinPost}
                            />
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
