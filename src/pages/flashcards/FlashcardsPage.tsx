import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaMagnifyingGlass, FaLayerGroup, FaPenToSquare, FaTrash } from "react-icons/fa6";
import { Pagination, Empty, Modal } from "antd";
import FlashcardSetCard from "~/components/flashcards/FlashcardSetCard";
import { useFlashcardSets } from "~/hooks/useFlashcardSets";
import { useAuth } from "~/hooks/useAuth";
import { toast } from "~/components/common/Toast";
import Loading from "~/components/common/Loading";

type TabType = "all" | "my";

const FlashcardsPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const {
        flashcardSets,
        pageInfo,
        loading,
        error,
        fetchFlashcardSets,
        fetchMyFlashcardSets,
        deleteFlashcardSet,
    } = useFlashcardSets();

    const [activeTab, setActiveTab] = useState<TabType>("all");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteTitle, setDeleteTitle] = useState("");
    const pageSize = 12;
    const hasFetchedRef = useRef(false);

    // Fetch data based on active tab
    useEffect(() => {
        if (activeTab === "all") {
            fetchFlashcardSets({
                keyword: searchKeyword || undefined,
                page: currentPage,
                size: pageSize,
            });
        } else {
            if (!hasFetchedRef.current || currentPage >= 0) {
                hasFetchedRef.current = true;
                fetchMyFlashcardSets({ page: currentPage, size: pageSize });
            }
        }
    }, [activeTab, currentPage, fetchFlashcardSets, fetchMyFlashcardSets]);

    const handleTabChange = (tab: TabType) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        setCurrentPage(0);
        setSearchKeyword("");
        hasFetchedRef.current = false;
    };

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

    const openDeleteModal = (id: string, title: string) => {
        setDeleteId(id);
        setDeleteTitle(title);
        setDeleteModalVisible(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const success = await deleteFlashcardSet(deleteId);
        if (success) {
            toast.success("Flashcard set deleted successfully");
            fetchMyFlashcardSets({ page: currentPage, size: pageSize });
        } else {
            toast.error("Failed to delete flashcard set");
        }
        setDeleteModalVisible(false);
        setDeleteId(null);
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
                                <p className="text-gray-500 text-sm">Learn and practice with flashcards</p>
                            </div>
                        </div>

                        {/* Create Button */}
                        {isAuthenticated && (
                            <Link
                                to="/flashcards/create"
                                className="inline-flex items-center gap-2 bg-teal-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-sm"
                            >
                                <FaPlus className="w-4 h-4" />
                                Create
                            </Link>
                        )}
                    </div>

                    {/* Tabs */}
                    {isAuthenticated && (
                        <div className="mt-6 flex gap-2">
                            <button
                                onClick={() => handleTabChange("all")}
                                className={`px-3 py-2 rounded-lg font-medium transition-all ${activeTab === "all"
                                    ? "bg-teal-600 text-white shadow-sm"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                All Flashcards
                            </button>
                            <button
                                onClick={() => handleTabChange("my")}
                                className={`px-3 py-2 rounded-lg font-medium transition-all ${activeTab === "my"
                                    ? "bg-teal-600 text-white shadow-sm"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                My Flashcards
                            </button>
                        </div>
                    )}

                    {/* Search Bar - only for "All" tab */}
                    {activeTab === "all" && (
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
                                <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <button
                                    onClick={handleSearch}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loading />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-500">{error}</p>
                        <button
                            onClick={() => {
                                if (activeTab === "all") {
                                    fetchFlashcardSets({ page: 0, size: pageSize });
                                } else {
                                    fetchMyFlashcardSets({ page: 0, size: pageSize });
                                }
                            }}
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
                                {activeTab === "my"
                                    ? "You haven't created any flashcard sets yet"
                                    : searchKeyword
                                        ? `No results found for "${searchKeyword}"`
                                        : "No flashcard sets found"}
                            </span>
                        }
                    >
                        {isAuthenticated && (
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
                                <div key={set.id} className="relative group">
                                    <FlashcardSetCard flashcardSet={set} />

                                    {/* Action buttons for My Flashcards tab */}
                                    {activeTab === "my" && (
                                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                to={`/flashcards/${set.id}/edit`}
                                                className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                                                title="Edit"
                                            >
                                                <FaPenToSquare className="w-3.5 h-3.5" />
                                            </Link>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    openDeleteModal(set.id, set.title);
                                                }}
                                                className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrash className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
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

            {/* Delete Modal */}
            <Modal
                title="Confirm Delete"
                open={deleteModalVisible}
                onOk={handleDelete}
                onCancel={() => {
                    setDeleteModalVisible(false);
                    setDeleteId(null);
                }}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete "{deleteTitle}"?</p>
                <p className="text-gray-500 text-sm mt-2">This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default FlashcardsPage;
