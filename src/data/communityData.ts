import type { LeaderboardUser } from '~/types/community';

export const threads = [
    {
        id: 1,
        user: { name: 'Sontung MTP', avatar: 'https://i.pravatar.cc/150?img=3' },
        content: "I just started practicing IELTS, because of the 6.0 test, I joined a practice test class at an English center, but I don't know anything, please share tips.",
        tags: ['english', 'Pneumonoultra', 'loremipsum'],
        likes: 125,
        comments: 2,
        image: 'https://placehold.co/600x300/E2E8F0/A0AEC0?text=Post+Image',
        commentsData: [
            {
                id: 1,
                user: { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
                text: 'I recommend you to focus on the writing section first. It is the most difficult part for many people.',
                replies: [
                    {
                        id: 3,
                        user: { name: 'Sontung MTP', avatar: 'https://i.pravatar.cc/150?img=3' },
                        text: 'Thank you for your advice! I will try my best.',
                        replies: []
                    },
                ],
            },
            {
                id: 2,
                user: { name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
                text: 'You can find many useful resources on the British Council website.',
                replies: [],
            },
        ],
        groupId: 1,
        groupName: 'IELTS 7.0 Aimers'
    },
    {
        id: 2,
        user: { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=4' },
        content: "Anyone have good resources for learning React Hooks? I'm struggling with useEffect dependencies. Any help would be appreciated!",
        tags: ['react', 'javascript', 'frontend'],
        likes: 98,
        comments: 0,
        image: null,
        commentsData: []
    },
    {
        id: 3,
        user: { name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
        content: "Just finished a course on UI/UX design. It was amazing! I learned so much about creating user-centered designs. Highly recommend it to anyone interested in the field.",
        tags: ['ui', 'ux', 'design'],
        likes: 150,
        comments: 0,
        image: 'https://placehold.co/600x300/D4E2F0/A0AEC0?text=Design+Course',
        commentsData: []
    }
];

export const leaderboardUsers: LeaderboardUser[] = [
    { id: 1, name: 'Sontang MTP', avatar: 'https://i.pravatar.cc/150?img=3', points: 5432, rankChange: 2, subject: 'IELTS' },
    { id: 2, name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1', points: 4870, rankChange: -1, subject: 'React' },
    { id: 3, name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2', points: 4560, rankChange: 0, subject: 'UI/UX' },
    { id: 4, name: 'phamalphats', avatar: 'https://i.pravatar.cc/150?img=4', points: 4210, rankChange: 1, subject: 'General' },
];

// Additional data for different time periods (mock)
export const dailyLeaderboardUsers: LeaderboardUser[] = [
    { id: 1, name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1', points: 1200, rankChange: 3 },
    { id: 2, name: 'Sontang MTP', avatar: 'https://i.pravatar.cc/150?img=3', points: 1100, rankChange: -2 },
    { id: 3, name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2', points: 1000, rankChange: 1 },
    { id: 4, name: 'phamalphats', avatar: 'https://i.pravatar.cc/150?img=4', points: 900, rankChange: 0 },
];

export const monthlyLeaderboardUsers: LeaderboardUser[] = [
    { id: 1, name: 'Sontang MTP', avatar: 'https://i.pravatar.cc/150?img=3', points: 15432, rankChange: 1 },
    { id: 2, name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2', points: 14870, rankChange: 2 },
    { id: 3, name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1', points: 14560, rankChange: -1 },
    { id: 4, name: 'phamalphats', avatar: 'https://i.pravatar.cc/150?img=4', points: 14210, rankChange: 0 },
];

export const allTimeLeaderboardUsers: LeaderboardUser[] = [
    { id: 1, name: 'Sontang MTP', avatar: 'https://i.pravatar.cc/150?img=3', points: 54320, rankChange: 0 },
    { id: 2, name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1', points: 48700, rankChange: 1 },
    { id: 3, name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2', points: 45600, rankChange: -1 },
    { id: 4, name: 'phamalphats', avatar: 'https://i.pravatar.cc/150?img=4', points: 42100, rankChange: 2 },
];
