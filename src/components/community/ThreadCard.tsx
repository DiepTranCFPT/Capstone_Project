import React, { useState } from "react";
import { FiMessageSquare, FiMoreHorizontal, FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import { useAuth } from "~/hooks/useAuth";
import type { Comment, Thread } from "~/types/community";

interface ThreadCardProps {
    thread: Thread
};

const ThreadCard: React.FC<ThreadCardProps> = ({ thread }) => {

    const { user } = useAuth();
    const [showComments, setShowComments] = useState<boolean>(false);
    const [newComment, setNewComment] = useState<string>("");

    const handleAddComment = () => {
        if (newComment.trim() && user) {
            console.log({
                user: user.firstName + " " + user.lastName,
                text: newComment,
            });
            setNewComment("");
        }
    };

    const CommentSection = ({ comments }: { comments: Comment[] }) => (
        <div className="mt-4 space-y-4">
            {comments.map(comment => (
                <div key={comment.id} className="flex items-start justify-center space-x-3">
                    <img src={comment.user.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                        <div className="bg-gray-200 p-2 rounded-xl">
                            <p className="font-semibold text-sm text-gray-800">{comment.user.name}</p>
                            <p className="text-sm text-gray-600 mt-1">{comment.text}</p>
                        </div>
                        <button className="text-xs text-gray-500 mt-1">Reply</button>
                        {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-6 mt-2">
                                <CommentSection comments={comment.replies} />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <img src={thread.user.avatar} alt={thread.user.name} className="w-11 h-11 rounded-full" />
                    <div>
                        <p className="font-bold text-gray-800">{thread.user.name}</p>
                        <p className="text-xs text-gray-500">Posted 2 hours ago</p>
                    </div>
                </div>
                <button className="text-gray-500 hover:text-gray-800"><FiMoreHorizontal /></button>
            </div>
            <p className="my-4 text-gray-700">{thread.content}</p>
            {thread.image && <img src={thread.image} alt="Post content" className="w-full rounded-lg border" />}
            <div className="flex flex-wrap gap-2 my-4">
                {thread.tags.map(tag => (
                    <span key={tag} className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-full">#{tag}</span>
                ))}
            </div>
            <div className="mt-2 flex items-center gap-4 text-gray-500 text-sm border-t pt-3">
                <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-gray-200 bg-white text-gray-600 text-sm hover:bg-gray-50"
                >
                    <FiThumbsUp className="text-base" />
                    <span>Like</span>
                </button>

                <span className="text-xs font-semibold text-teal-600">
                    {thread.likes}
                </span>

                <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-gray-200 bg-white text-gray-600 text-sm hover:bg-gray-50"
                >
                    <FiThumbsDown className="text-base" />
                    <span>Dislike</span>
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className="ml-2 flex items-center gap-2 hover:text-teal-600 hover:cursor-pointer"
                >
                    <FiMessageSquare className="text-lg" />
                    <span className="text-xs">{thread.comments}</span>
                </button>
            </div>
            {showComments && (
                <div className="mt-4">
                    <div className="flex items-start space-x-3">
                        <img src={user?.imgUrl} alt="avatar" className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows={2}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                placeholder="Add a comment..."
                            ></textarea>
                            <button onClick={handleAddComment} className="mt-2 bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-teal-600 transition hover:cursor-pointer">
                                Post Comment
                            </button>
                        </div>
                    </div>
                    <CommentSection comments={thread.commentsData} />
                </div>
            )}
        </div>
    );
};

export default ThreadCard;