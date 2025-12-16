export interface UserInfo {
    name: string;
    avatar: string;
}
export interface Comment {
    id: number;
    user: { name: string; avatar: string };
    text: string;
    replies: Comment[];
};
export interface Thread {
    id: number;
    user: { name: string; avatar: string };
    content: string;
    tags: string[];
    likes: number;
    comments: number;
    image?: string | null;
    commentsData: Comment[];
    groupId?: number;
    groupName?: string;
};

export interface StudyGroup {
    id: number;
    name: string;
    description: string;
    avatar: string;
    bannerImage: string;
    memberCount: number;
    tags: string[];
    privacy: 'public' | 'private';
    members: UserInfo[];
};

export interface LeaderboardUser {
    id: number;
    name: string;
    avatar: string;
    points: number;
    rankChange?: number; // Positive for up, negative for down, 0 for no change
    subject?: string; // Optional for subject filter
    groupId?: number; // Optional for study group filter
};

// ===== API types cho backend community-controller =====

// Community (nhóm học tập) lấy từ BE
export interface Community {
  id: string | number;
  name: string;
  description?: string;
  avatar?: string;
  bannerImage?: string;
  memberCount?: number;
  privacy?: "PUBLIC" | "PRIVATE" | string;
  // Cho phép BE trả thêm field mà FE chưa khai báo
  [key: string]: unknown;
}

// Payload update community: dùng Partial để linh hoạt
export interface CommunityUpdatePayload {
  name?: string;
  description?: string;
  avatar?: string;
  bannerImage?: string;
  privacy?: "PUBLIC" | "PRIVATE" | string;
  [key: string]: unknown;
}

// Post (bài viết) trong community
export interface CommunityPost {
  id: string | number;
  communityId: string | number;
  title?: string;
  content: string;
  authorId?: string | number;
  authorName?: string;
  authorAvatar?: string;
  likeCount?: number;
  commentCount?: number;
  createdAt?: string;
  updatedAt?: string;
  // Cho phép đính kèm extra fields (attachments, tags, ...)
  [key: string]: unknown;
}

// Payload tạo post mới
export interface CreateCommunityPostPayload {
  title?: string;
  content: string;
  attachments?: string[]; // tuỳ BE, có thể không dùng
  [key: string]: unknown;
}

// Query khi gọi GET /communities
export interface CommunityQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "ASC" | "DESC" | string;
  [key: string]: unknown;
}

// Query khi search community
export interface CommunitySearchParams extends CommunityQueryParams {
  keyword?: string;
}