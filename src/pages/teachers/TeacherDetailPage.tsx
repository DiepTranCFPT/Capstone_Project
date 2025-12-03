import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaCheckCircle, FaArrowLeft, FaUser } from "react-icons/fa";
import UserService from "~/services/userService";
import { useTeacherRatings } from "~/hooks/useTeacherRatings";
import type { User } from "~/types/user";

const TeacherDetailPage: React.FC = () => {
    const { teacherId } = useParams<{ teacherId: string }>();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState<User | null>(null);
    const [loadingTeacher, setLoadingTeacher] = useState(true);

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

        const fetchTeacherData = async () => {
            try {
                setLoadingTeacher(true);
                const response = await UserService.getUserProfile(teacherId);
                if (response.code === 1000 && response.data) {
                    setTeacher(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch teacher data:", err);
            } finally {
                setLoadingTeacher(false);
            }
        };

        fetchTeacherData();
        fetchRatingsByTeacher(teacherId);
        fetchStatisticsByTeacher(teacherId);
    }, [teacherId, fetchRatingsByTeacher, fetchStatisticsByTeacher]);

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        className={star <= rating ? "text-yellow-400" : "text-gray-300"}
                        size={16}
                    />
                ))}
            </div>
        );
    };

    if (loadingTeacher) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading teacher information...</p>
                </div>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Teacher Not Found</h2>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 transition"
                >
                    <FaArrowLeft />
                    <span className="font-medium">Back to Home</span>
                </button>

                {/* Teacher Profile Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-teal-600 to-emerald-600 h-32"></div>
                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row gap-6 -mt-16">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center overflow-hidden">
                                    {teacher.imgUrl ? (
                                        <img
                                            src={teacher.imgUrl}
                                            alt={`${teacher.firstName} ${teacher.lastName}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FaUser className="text-teal-600 text-5xl" />
                                    )}
                                </div>
                            </div>

                            {/* Teacher Info */}
                            <div className="flex-grow mt-16 md:mt-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-800">
                                        {teacher.firstName} {teacher.lastName}
                                    </h1>
                                    {teacher.teacherProfile?.isVerified && (
                                        <FaCheckCircle className="text-blue-500 text-2xl" title="Verified Teacher" />
                                    )}
                                </div>
                                <p className="text-gray-600 mb-4">{teacher.email}</p>

                                {/* Rating Statistics */}
                                {statistics && (
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            {renderStars(Math.round(statistics.averageRating))}
                                            <span className="text-lg font-semibold text-gray-700">
                                                {statistics.averageRating.toFixed(1)}
                                            </span>
                                        </div>
                                        <span className="text-gray-500">
                                            ({statistics.totalRatings} {statistics.totalRatings === 1 ? 'review' : 'reviews'})
                                        </span>
                                    </div>
                                )}

                                {/* Teacher Profile Details */}
                                {teacher.teacherProfile && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        {teacher.teacherProfile.specialization && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Specialization</h3>
                                                <p className="text-gray-800">{teacher.teacherProfile.specialization}</p>
                                            </div>
                                        )}
                                        {teacher.teacherProfile.qualification && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Qualification</h3>
                                                <p className="text-gray-800">{teacher.teacherProfile.qualification}</p>
                                            </div>
                                        )}
                                        {teacher.teacherProfile.experience && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Experience</h3>
                                                <p className="text-gray-800">{teacher.teacherProfile.experience}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Biography */}
                                {teacher.teacherProfile?.biography && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">About</h3>
                                        <p className="text-gray-700 leading-relaxed">{teacher.teacherProfile.biography}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ratings Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Reviews</h2>

                    {loadingRatings ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading reviews...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-500">{error}</p>
                        </div>
                    ) : ratings.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gray-100 rounded-full p-8 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                                <FaStar className="text-gray-400 text-4xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
                            <p className="text-gray-500">This teacher hasn't received any reviews yet.</p>
                        </div>
                    ) : (
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
                                                    {String(rating.studentName || "Anonymous Student")}
                                                </h4>
                                                {rating.isVerified && (
                                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                                        Verified Purchase
                                                    </span>
                                                )}
                                            </div>
                                            {renderStars(rating.rating)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(rating.createdAt || "").toLocaleDateString("vi-VN", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </div>
                                    </div>

                                    {rating.comment && (
                                        <p className="text-gray-700 mb-3 leading-relaxed">{String(rating.comment)}</p>
                                    )}

                                    {rating.learningMaterialTitle && (
                                        <div className="text-sm text-gray-500">
                                            <span className="font-medium">Course:</span> {String(rating.learningMaterialTitle)}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Pagination Info */}
                            {totalPages > 1 && (
                                <div className="mt-6 text-center text-gray-600">
                                    <p>
                                        Showing {ratings.length} of {totalElements} reviews (Page {currentPage + 1} of {totalPages})
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDetailPage;
