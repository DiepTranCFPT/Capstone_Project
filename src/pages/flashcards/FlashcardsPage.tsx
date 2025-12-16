import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaSearch, FaLayerGroup } from "react-icons/fa";
import { Pagination, Empty, Spin } from "antd";
import FlashcardSetCard from "~/components/flashcards/FlashcardSetCard";
import { useFlashcardSets } from "~/hooks/useFlashcardSets";
import { useAuth } from "~/hooks/useAuth";

const FlashcardsPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const {
        flashcardSets,
        pageInfo,
        loading,
        error,
        fetchFlashcardSets,
    } = useFlashcardSets();

    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 12;

    useEffect(() => {
        fetchFlashcardSets({
            keyword: searchKeyword || undefined,
            page: currentPage,
            size: pageSize,
        });
    }, [currentPage, fetchFlashcardSets]);

    const handleSearch = () => {
        setCurrentPage(0);
        fetchFlashcardSets({
            keyword: searchKeyword || undefined,
            page: 0,
            size: pageSize,
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Title */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                                <FaLayerGroup className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Flashcard Sets</h1>
                                <p className="text-gray-500 text-sm">Learn and practice with flashcard</p>
                            </div>
                        </div>

                        {/* Create Button */}
                        {isAuthenticated && (
                            <Link
                                to="/flashcards/create"
                                className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-sm"
                            >
                                <FaPlus className="w-4 h-4" />
                                Create Flashcard Set
                            </Link>
                        )}
                    </div>

                    {/* Search Bar */}
                    <div className="mt-6 max-w-xl">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search flashcard sets..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
                            />
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <button
                                onClick={handleSearch}
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Spin size="large" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-500">{error}</p>
                        <button
                            onClick={() => fetchFlashcardSets({ page: 0, size: pageSize })}
                            className="mt-4 text-teal-600 hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : flashcardSets.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <span className="text-gray-500">
                                {searchKeyword
                                    ? `No results found for "${searchKeyword}"`
                                    : "No flashcard sets found"}
                            </span>
                        }
                    >
                        {isAuthenticated && !searchKeyword && (
                            <Link
                                to="/flashcards/create"
                                className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                            >
                                <FaPlus className="w-4 h-4" />
                                Create your first flashcard set
                            </Link>
                        )}
                    </Empty>
                ) : (
                    <>
                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {flashcardSets.map((set) => (
                                <FlashcardSetCard key={set.id} flashcardSet={set} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pageInfo && pageInfo.totalPage > 1 && (
                            <div className="flex justify-center mt-10">
                                <Pagination
                                    current={currentPage + 1}
                                    total={pageInfo.totalElement}
                                    pageSize={pageSize}
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                    showTotal={(total) => `Total ${total} sets`}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FlashcardsPage;
