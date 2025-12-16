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
    postId: string | number; // ID gốc từ BE (có thể là UUID string) để dùng cho API
    user: { name: string; avatar: string };
    content: string;
    tags: string[];
    likes: number;
    comments: number;
    image?: string | null;
    commentsData: Comment[];
    groupId?: number;
    groupName?: string;
    authorId?: string | number; // ID của người tạo post để check quyền xóa
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

// Payload tạo post mới (theo BE: title, content, image MultipartFile)
export interface CreateCommunityPostPayload {
  title: string;
  content: string;
  image?: File;
  [key: string]: unknown;
}

// ===== Comment APIs cho post-controller & comment-controller =====

export interface CommunityComment {
  id: string | number;
  postId: string | number;
  content: string;
  authorId?: string | number;
  authorName?: string;
  authorAvatar?: string;
  // Author object từ BE (có firstName, lastName, imgUrl, ...)
  author?: {
    id?: string | number;
    firstName?: string;
    lastName?: string;
    username?: string;
    imgUrl?: string;
    avatar?: string;
    email?: string;
    [key: string]: unknown;
  };
  createdAt?: string;
  updatedAt?: string;
  replyCount?: number;
  parentId?: string | number | null;
  [key: string]: unknown;
}

export interface CreateCommunityCommentPayload {
  content?: string;
  // nếu là reply cho comment khác
  parentCommentId?: string | number | null;
  // ảnh đính kèm (multipart/form-data)
  image?: File;
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