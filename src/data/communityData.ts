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
        ]
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
export const leaderboardUsers = [
    { id: 1, name: 'Sontang MTP', avatar: 'https://i.pravatar.cc/150?img=3', points: 5432 },
    { id: 2, name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1', points: 4870 },
    { id: 3, name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2', points: 4560 },
    { id: 4, name: 'phamalphats', avatar: 'https://i.pravatar.cc/150?img=4', points: 4210 },
];
