import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaLayerGroup, FaEye, FaPenToSquare, FaTrash } from "react-icons/fa6";
import { Empty, Pagination, Modal } from "antd";
import { useFlashcardSets } from "~/hooks/useFlashcardSets";
import { toast } from "~/components/common/Toast";
import Loading from "~/components/common/Loading";

const MyFlashcardSetsPage: React.FC = () => {
    const {
        flashcardSets,
        pageInfo,
        loading,
        error,
        fetchMyFlashcardSets,
        deleteFlashcardSet,
    } = useFlashcardSets();

    const [currentPage, setCurrentPage] = React.useState(1);
    const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);
    const [deleteTitle, setDeleteTitle] = React.useState("");
    const pageSize = 12;
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchMyFlashcardSets({ page: 0, size: pageSize });
        }
    }, [fetchMyFlashcardSets]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchMyFlashcardSets({ page: page - 1, size: pageSize });
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
            fetchMyFlashcardSets({ page: currentPage - 1, size: pageSize });
        } else {
            toast.error("Failed to delete flashcard set");
        }
        setDeleteModalVisible(false);
        setDeleteId(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">My Flashcard Sets</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage your flashcard collections
                        </p>
                    </div>
                    <Link
                        to="/flashcards/create"
                        className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-sm"
                    >
                        <FaPlus className="w-4 h-4" />
                        Create New Set
                    </Link>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loading />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={() => fetchMyFlashcardSets({ page: 0, size: pageSize })}
                            className="text-teal-600 hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : flashcardSets.length === 0 ? (
                    <Empty
                        description={
                            <span className="text-gray-500">
                                You haven't created any flashcard sets yet
                            </span>
                        }
                    >
                        <Link
                            to="/flashcards/create"
                            className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                        >
                            <FaPlus className="w-4 h-4" />
                            Create your first flashcard set
                        </Link>
                    </Empty>
                ) : (
                    <>
                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {flashcardSets.map((set) => (
                                <div
                                    key={set.id}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-teal-300 transition-all group"
                                >
                                    {/* Card Content */}
                                    <Link to={`/flashcards/${set.id}`} className="block p-5">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-teal-600 transition-colors">
                                            {set.title}
                                        </h3>
                                        {set.description && (
                                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                                {set.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <FaLayerGroup className="w-3.5 h-3.5" />
                                                {set.cardCount} cards
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaEye className="w-3.5 h-3.5" />
                                                {set.viewCount} views
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                            <span className={`text-xs px-2 py-1 rounded-full ${set.public
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-600"
                                                }`}>
                                                {set.public ? "Public" : "Private"}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(set.createdAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    </Link>

                                    {/* Actions */}
                                    <div className="flex border-t border-gray-100">
                                        <Link
                                            to={`/flashcards/${set.id}/edit`}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-50 hover:text-teal-600 transition-colors text-sm"
                                        >
                                            <FaPenToSquare className="w-3.5 h-3.5" />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => openDeleteModal(set.id, set.title)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors text-sm border-l border-gray-100"
                                        >
                                            <FaTrash className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pageInfo && pageInfo.totalPage > 1 && (
                            <div className="flex justify-center mt-8">
                                <Pagination
                                    current={currentPage}
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

export default MyFlashcardSetsPage;
