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
