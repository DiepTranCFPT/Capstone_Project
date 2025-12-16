import React from "react";
import { Link } from "react-router-dom";
import { FaEye, FaLayerGroup } from "react-icons/fa";
import type { FlashcardSetListItem } from "~/types/flashcardSet";

interface FlashcardSetCardProps {
    flashcardSet: FlashcardSetListItem;
}

const FlashcardSetCard: React.FC<FlashcardSetCardProps> = ({ flashcardSet }) => {
    const { id, title, description, cardCount, viewCount, author, createdAt } = flashcardSet;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <Link
            to={`/flashcards/${id}`}
            className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-teal-300 transition-all duration-300 group"
        >
            {/* Icon and Title */}
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                    <FaLayerGroup className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-lg truncate group-hover:text-teal-600 transition-colors">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                    <FaLayerGroup className="w-3.5 h-3.5" />
                    {cardCount} cards
                </span>
                <span className="flex items-center gap-1">
                    <FaEye className="w-3.5 h-3.5" />
                    {viewCount} views
                </span>
            </div>

            {/* Author and Date */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <img
                        src={author.imgUrl || `https://ui-avatars.com/api/?name=${author.firstName}+${author.lastName}&background=3CBCB2&color=fff`}
                        alt={`${author.firstName} ${author.lastName}`}
                        className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-600">
                        {author.firstName} {author.lastName}
                    </span>
                </div>
                <span className="text-xs text-gray-400">
                    {formatDate(createdAt)}
                </span>
            </div>
        </Link>
    );
};

export default FlashcardSetCard;
