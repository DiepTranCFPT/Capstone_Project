import React, { useEffect, useState } from "react";
import { FaStar, FaCheckCircle, FaSort, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { useAuth } from "~/hooks/useAuth";
import { useTeacherRatings } from "~/hooks/useTeacherRatings";

const TeacherRatingsViewPage: React.FC = () => {
    const { user } = useAuth();
    const teacherId = user?.id;

    // Filter states
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortDir, setSortDir] = useState<string>("DESC");
    const [pageSize, setPageSize] = useState<number>(10);

    const {
        ratings,
        statistics,
        loading: loadingRatings,
        error,
        totalElements,
        totalPages,
        currentPage,
        fetchRatingsByTeacher,
        fetchStatisticsByTeacher,
    } = useTeacherRatings();

    useEffect(() => {
        if (!teacherId) return;

        fetchRatingsByTeacher(teacherId, 0, pageSize, sortBy, sortDir);
        fetchStatisticsByTeacher(teacherId);
    }, [teacherId, sortBy, sortDir, pageSize, fetchRatingsByTeacher, fetchStatisticsByTeacher]);

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        className={star <= rating ? "text-yellow-400" : "text-gray-300"}
                        size={20}
                    />
                ))}
            </div>
        );
    };

    if (!teacherId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Please log in to view your ratings.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">My Ratings</h1>
                    <p className="text-gray-600">View all ratings and reviews from your students</p>
                </div>

                {/* Statistics Card */}
                {statistics && (
                    <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="flex-shrink-0">
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
                                    <div className="text-5xl font-bold mb-2">
                                        {statistics.averageRating.toFixed(1)}
                                    </div>
                                    <div className="flex justify-center mb-2">
                                        {renderStars(Math.round(statistics.averageRating))}
                                    </div>
                                    <p className="text-sm opacity-90">Average Rating</p>
                                </div>
                            </div>
                            <div className="flex-grow text-center md:text-left">
                                <h2 className="text-2xl font-semibold mb-2">
                                    Overall Performance
                                </h2>
                                <p className="text-lg opacity-90 mb-4">
                                    Based on {statistics.totalRatings} student{statistics.totalRatings !== 1 ? 's' : ''} review{statistics.totalRatings !== 1 ? 's' : ''}
                                </p>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                        <p className="text-3xl font-bold">{statistics.totalRatings}</p>
                                        <p className="text-sm opacity-90">Total Reviews</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                        <p className="text-3xl font-bold">
                                            {statistics.averageRating >= 4.5 ? "⭐" : statistics.averageRating >= 3.5 ? "👍" : "📈"}
                                        </p>
                                        <p className="text-sm opacity-90">
                                            {statistics.averageRating >= 4.5 ? "Excellent" : statistics.averageRating >= 3.5 ? "Good" : "Growing"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ratings List */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Student Reviews
                        </h2>

                        {/* Filter Controls */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Sort By */}
                            <div className="flex items-center gap-2">
                                <FaSort className="text-gray-500" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                >
                                    <option value="createdAt">Date</option>
                                    <option value="rating">Rating</option>
                                </select>
                            </div>

                            {/* Sort Direction */}
                            <button
                                onClick={() => setSortDir(sortDir === "DESC" ? "ASC" : "DESC")}
                                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                                title={sortDir === "DESC" ? "Descending" : "Ascending"}
                            >
                                {sortDir === "DESC" ? (
                                    <FaSortAmountDown className="text-gray-600" />
                                ) : (
                                    <FaSortAmountUp className="text-gray-600" />
                                )}
                                <span className="hidden sm:inline text-gray-700">
                                    {sortDir === "DESC" ? "Newest First" : "Oldest First"}
                                </span>
                            </button>

                            {/* Page Size */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Show:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {loadingRatings ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading reviews...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="bg-red-50 rounded-lg p-6 max-w-md mx-auto">
                                <p className="text-red-600">{error}</p>
                            </div>
                        </div>
                    ) : ratings.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gray-100 rounded-full p-8 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                                <FaStar className="text-gray-400 text-4xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                No Reviews Yet
                            </h3>
                            <p className="text-gray-500">
                                You haven't received any reviews from students yet.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-6">
                                {ratings.map((rating) => (
                                    <div
                                        key={rating.id}
                                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-semibold text-gray-800">
                                                        {String(rating.userFullName || "Anonymous Student")}
                                                    </h4>
                                                    {rating.isVerified && (
                                                        <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                                            <FaCheckCircle />
                                                            Verified
                                                        </span>
                                                    )}
                                                </div>
                                                {renderStars(rating.rating)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(rating.createdAt || "").toLocaleDateString(
                                                    "vi-VN",
                                                    {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    }
                                                )}
                                            </div>
                                        </div>

                                        {rating.comment ? (
                                            <p className="text-gray-700 mb-3 leading-relaxed">
                                                {String(rating.comment)}
                                            </p>
                                        ) : (
                                            <p className="text-gray-700 mb-3 leading-relaxed">
                                                No comment provided.
                                            </p>
                                        )}

                                        {rating.learningMaterialTitle && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-500">Course:</span>
                                                <span className="text-teal-600 font-medium">
                                                    {String(rating.learningMaterialTitle)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Info */}
                            {totalPages > 1 && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <p>
                                            Showing {ratings.length} of {totalElements} reviews
                                        </p>
                                        <p>
                                            Page {currentPage + 1} of {totalPages}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherRatingsViewPage;
