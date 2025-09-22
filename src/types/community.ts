
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
};