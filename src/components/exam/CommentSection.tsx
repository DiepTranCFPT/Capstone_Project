import React from 'react';

// Dữ liệu giả lập cho bình luận
const comments = Array(6).fill({
    avatar: "https://i.pravatar.cc/40",
    username: "phamalphats",
    date: "Friday, 11, 2025",
    text: "Last monday because of the School, I joined a practice test date at an English center, but I don't know anything, please share tips."
});

const CommentSection: React.FC = () => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Comment</h3>
            <div className="space-y-4">
                {comments.map((comment, index) => (
                    <div key={index} className="flex items-start space-x-3">
                        <img src={`${comment.avatar}?u=${index}`} alt="avatar" className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-800">{comment.username} <span className="text-xs text-gray-500 font-normal ml-2">{comment.date}</span></p>
                            <p className="text-sm text-gray-600 mt-1">{comment.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-center mt-6">
                <button className="text-teal-600 font-semibold border border-teal-500 rounded-lg px-6 py-2 hover:bg-teal-50 transition">
                    More
                </button>
            </div>
        </div>
    );
};

export default CommentSection;