import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    FaArrowLeft,
    FaPenToSquare,
    FaTrash,
    FaShuffle,
    FaGamepad,
    FaEye,
    FaLayerGroup,
} from "react-icons/fa6";
import { Modal } from "antd";
import FlashcardViewer from "~/components/flashcards/FlashcardViewer";
import { useFlashcardSets } from "~/hooks/useFlashcardSets";
import { useFlashcardBasePath } from "~/hooks/useFlashcardBasePath";
import { useAuth } from "~/hooks/useAuth";
import type { Flashcard } from "~/types/flashcardSet";
import Loading from "~/components/common/Loading";
import { toast } from "~/components/common/Toast";

const FlashcardDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        currentFlashcardSet,
        loading,
        error,
        fetchFlashcardSetById,
        deleteFlashcardSet,
    } = useFlashcardSets();

    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [isShuffled, setIsShuffled] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const hasFetchedRef = useRef(false);
    const basePath = useFlashcardBasePath();

    useEffect(() => {
        if (id && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchFlashcardSetById(id);
        }
    }, [id, fetchFlashcardSetById]);

    useEffect(() => {
        if (currentFlashcardSet?.flashcards) {
            const sortedCards = [...currentFlashcardSet.flashcards].sort(
                (a, b) => a.displayOrder - b.displayOrder
            );
            setCards(sortedCards);
            setCurrentCardIndex(0);
        }
    }, [currentFlashcardSet]);

    const isOwner = user?.id === currentFlashcardSet?.author.id;

    const handleShuffle = () => {
        if (isShuffled) {
            // Reset to original order
            const sortedCards = [...(currentFlashcardSet?.flashcards || [])].sort(
                (a, b) => a.displayOrder - b.displayOrder
            );
            setCards(sortedCards);
            setIsShuffled(false);
        } else {
            // Shuffle
            const shuffled = [...cards].sort(() => Math.random() - 0.5);
            setCards(shuffled);
            setIsShuffled(true);
        }
        setCurrentCardIndex(0);
    };

    const handleDelete = async () => {
        if (!id) return;
        const success = await deleteFlashcardSet(id);
        if (success) {
            toast.success("Flashcard set deleted successfully");
            navigate(basePath);
        } else {
            toast.error("Failed to delete flashcard set");
        }
        setDeleteModalVisible(false);
    };

    if (loading || !currentFlashcardSet) {
        // Show loading if still loading OR if data not yet loaded (initial state)
        if (!error) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <Loading />
                </div>
            );
        }
        // Show error only if there's an actual error
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link to={basePath} className="text-teal-600 hover:underline">
                    Back to flashcards
                </Link>
            </div>
        );
    }

    const { title, description, cardCount, viewCount, author, createdAt } = currentFlashcardSet;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Back button */}
                    <Link
                        to={basePath}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-4 transition-colors"
                    >
                        <FaArrowLeft className="w-4 h-4" />
                        Back to flashcards
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                            {description && (
                                <p className="text-gray-500 mt-2">{description}</p>
                            )}

                            {/* Stats */}
                            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <FaLayerGroup className="w-4 h-4" />
                                    {cardCount} cards
                                </span>
                                <span className="flex items-center gap-1">
                                    <FaEye className="w-4 h-4" />
                                    {viewCount} views
                                </span>
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-2 mt-4">
                                <img
                                    src={
                                        author.imgUrl ||
                                        `https://ui-avatars.com/api/?name=${author.firstName}+${author.lastName}&background=3CBCB2&color=fff`
                                    }
                                    alt={`${author.firstName} ${author.lastName}`}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        {author.firstName} {author.lastName}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(createdAt).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {isOwner && (
                                <>
                                    <Link
                                        to={`${basePath}/${id}/edit`}
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <FaPenToSquare className="w-4 h-4" />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => setDeleteModalVisible(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {cards.length > 0 ? (
                    <>
                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <button
                                onClick={handleShuffle}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isShuffled
                                    ? "bg-teal-600 text-white"
                                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <FaShuffle className="w-4 h-4" />
                                {isShuffled ? "Shuffled" : "Shuffle"}
                            </button>
                            <Link
                                to={`${basePath}/${id}/quiz`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                            >
                                <FaGamepad className="w-4 h-4" />
                                Quiz
                            </Link>
                        </div>

                        {/* Flashcard Viewer */}
                        <FlashcardViewer
                            card={cards[currentCardIndex]}
                            currentIndex={currentCardIndex}
                            totalCards={cards.length}
                            onPrevious={() => setCurrentCardIndex((prev) => Math.max(0, prev - 1))}
                            onNext={() =>
                                setCurrentCardIndex((prev) => Math.min(cards.length - 1, prev + 1))
                            }
                        />

                        {/* All Cards List */}
                        <div className="mt-12">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                All Cards ({cards.length})
                            </h2>
                            <div className="space-y-3">
                                {cards.map((card, index) => (
                                    <button
                                        key={card.id}
                                        onClick={() => setCurrentCardIndex(index)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${index === currentCardIndex
                                            ? "border-teal-400 bg-teal-50"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Term</p>
                                                    <p className="text-gray-800 font-medium">{card.term}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Definition</p>
                                                    <p className="text-gray-600">{card.definition}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500">This flashcard set has no cards</p>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <Modal
                title="Confirm Delete"
                open={deleteModalVisible}
                onOk={handleDelete}
                onCancel={() => setDeleteModalVisible(false)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete flashcard set "{title}"?</p>
                <p className="text-gray-500 text-sm mt-2">This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default FlashcardDetailPage;
