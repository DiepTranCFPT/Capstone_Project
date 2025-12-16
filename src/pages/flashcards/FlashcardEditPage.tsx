import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    FaArrowLeft,
    FaPlus,
    FaTrash,
    FaGripVertical,
    FaImage,
    FaGlobe,
    FaLock,
    FaMagnifyingGlass,
    FaXmark,
    FaCheck,
} from "react-icons/fa6";
import { Switch, Spin, Modal } from "antd";
import { useFlashcardSets } from "~/hooks/useFlashcardSets";
import type { CreateFlashcardRequest } from "~/types/flashcardSet";
import { toast } from "~/components/common/Toast";
import Loading from "~/components/common/Loading";

interface CardFormData extends CreateFlashcardRequest {
    tempId: string;
}

interface PixabayImage {
    id: number;
    previewURL: string;
    webformatURL: string;
    largeImageURL: string;
    tags: string;
}

const PIXABAY_API_KEY = "53747553-5aed3de4cd27301cd0327780d";

const FlashcardEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        currentFlashcardSet,
        loading,
        error,
        fetchFlashcardSetById,
        updateFlashcardSet,
    } = useFlashcardSets();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [cards, setCards] = useState<CardFormData[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const hasFetchedRef = useRef(false);

    // Image picker state
    const [imagePickerOpen, setImagePickerOpen] = useState(false);
    const [activeCardId, setActiveCardId] = useState<string | null>(null);
    const [searchImages, setSearchImages] = useState<PixabayImage[]>([]);
    const [imageLoading, setImageLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const fetchingRef = useRef(false);

    // Fetch existing flashcard set
    useEffect(() => {
        if (id && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchFlashcardSetById(id);
        }
    }, [id, fetchFlashcardSetById]);

    // Initialize form with existing data
    useEffect(() => {
        if (currentFlashcardSet && !isInitialized) {
            setTitle(currentFlashcardSet.title);
            setDescription(currentFlashcardSet.description || "");
            setIsPublic(currentFlashcardSet.public);

            // Convert flashcards to form data
            const existingCards: CardFormData[] = currentFlashcardSet.flashcards
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((card) => ({
                    tempId: card.id,
                    term: card.term,
                    definition: card.definition,
                    imageUrl: card.imageUrl || "",
                }));

            setCards(existingCards.length >= 2 ? existingCards : [
                ...existingCards,
                ...Array(2 - existingCards.length).fill(null).map(() => ({
                    tempId: crypto.randomUUID(),
                    term: "",
                    definition: "",
                    imageUrl: "",
                })),
            ]);
            setIsInitialized(true);
        }
    }, [currentFlashcardSet, isInitialized]);

    const addCard = () => {
        setCards([
            ...cards,
            { tempId: crypto.randomUUID(), term: "", definition: "", imageUrl: "" },
        ]);
    };

    const removeCard = (tempId: string) => {
        if (cards.length <= 2) {
            toast.warning("At least 2 cards are required");
            return;
        }
        setCards(cards.filter((card) => card.tempId !== tempId));
    };

    const updateCard = (tempId: string, field: keyof CreateFlashcardRequest, value: string) => {
        setCards(
            cards.map((card) =>
                card.tempId === tempId ? { ...card, [field]: value } : card
            )
        );
    };

    // Fetch images from Pixabay
    const fetchImages = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchImages([]);
            return;
        }

        if (fetchingRef.current) {
            return;
        }
        fetchingRef.current = true;

        setImageLoading(true);
        try {
            const encodedQuery = encodeURIComponent(query.trim());
            const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodedQuery}&image_type=photo&per_page=8&safesearch=true`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.hits) {
                setSearchImages(data.hits.slice(0, 4));
            } else {
                setSearchImages([]);
            }
        } catch (err) {
            console.error("Error fetching images:", err);
            toast.error("Failed to load images");
            setSearchImages([]);
        } finally {
            setImageLoading(false);
            fetchingRef.current = false;
        }
    }, []);

    const openImagePicker = (cardId: string) => {
        const card = cards.find(c => c.tempId === cardId);
        setActiveCardId(cardId);
        setSearchQuery(card?.term || "");
        setSearchImages([]);
        setImagePickerOpen(true);

        if (card?.term) {
            fetchImages(card.term);
        }
    };

    const selectImage = (imageUrl: string) => {
        if (activeCardId) {
            updateCard(activeCardId, "imageUrl", imageUrl);
            setImagePickerOpen(false);
            setActiveCardId(null);
            setSearchImages([]);
        }
    };

    const removeImage = (cardId: string) => {
        updateCard(cardId, "imageUrl", "");
    };

    const handleSubmit = async () => {
        if (!id) return;

        if (!title.trim()) {
            toast.error("Please enter a title");
            return;
        }

        const validCards = cards.filter(
            (card) => card.term.trim() && card.definition.trim()
        );

        if (validCards.length < 2) {
            toast.error("At least 2 cards are required");
            return;
        }

        setIsSaving(true);
        const payload = {
            title: title.trim(),
            description: description.trim(),
            isPublic,
            cards: validCards.map(({ term, definition, imageUrl }) => ({
                term: term.trim(),
                definition: definition.trim(),
                imageUrl: imageUrl?.trim() || undefined,
            })),
        };

        const result = await updateFlashcardSet(id, payload);
        setIsSaving(false);

        if (result) {
            toast.success("Flashcard set updated successfully!");
            navigate(`/flashcards/${id}`);
        } else {
            toast.error("Failed to update flashcard set");
        }
    };

    // Loading state
    if (loading || !isInitialized) {
        if (!error) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <Loading />
                </div>
            );
        }
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link to="/flashcards" className="text-teal-600 hover:underline">
                    Back to flashcards
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky pt-4 top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                to={`/flashcards/${id}`}
                                className="text-gray-600 hover:text-teal-600 transition-colors"
                            >
                                <FaArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-xl font-bold text-gray-800">
                                Edit Flashcard Set
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Public Toggle */}
                            <div className="flex items-center gap-2">
                                {isPublic ? (
                                    <FaGlobe className="w-4 h-4 text-teal-600" />
                                ) : (
                                    <FaLock className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-sm text-gray-600">
                                    {isPublic ? "Public" : "Private"}
                                </span>
                                <Switch
                                    checked={isPublic}
                                    onChange={setIsPublic}
                                    size="small"
                                />
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSaving ? <Spin size="small" /> : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Title & Description */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <input
                        type="text"
                        placeholder="Enter title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-xl font-semibold border-0 border-b-2 border-gray-100 focus:border-teal-400 focus:outline-none pb-2 transition-colors"
                    />
                    <textarea
                        placeholder="Add description (optional)..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="w-full mt-4 text-gray-600 border-0 focus:outline-none resize-none"
                    />
                </div>

                {/* Cards */}
                <div className="space-y-4">
                    {cards.map((card, index) => (
                        <div
                            key={card.tempId}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                        >
                            {/* Card Header */}
                            <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <FaGripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                                    <span className="font-medium text-gray-700">{index + 1}</span>
                                </div>
                                <button
                                    onClick={() => removeCard(card.tempId)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <FaTrash className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Card Content */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Term */}
                                    <div>
                                        <p className="text-xs text-gray-400 mt-2">TERM</p>
                                        <input
                                            type="text"
                                            placeholder="Enter term..."
                                            value={card.term}
                                            onChange={(e) => updateCard(card.tempId, "term", e.target.value)}
                                            className="w-full border-0 border-b-2 border-gray-100 focus:border-teal-400 focus:outline-none pb-2 text-lg transition-colors"
                                        />
                                    </div>

                                    {/* Definition */}
                                    <div>
                                        <p className="text-xs text-gray-400 mt-2">DEFINITION</p>
                                        <textarea 
                                            placeholder="Enter definition..."
                                            rows={2}
                                            value={card.definition}
                                            onChange={(e) =>
                                                updateCard(card.tempId, "definition", e.target.value)
                                            }
                                            className="w-full border-0 border-b-2 border-gray-100 focus:border-teal-400 focus:outline-none pb-2 text-lg transition-colors"
                                        />                                        
                                    </div>
                                </div>

                                {/* Image Section */}
                                <div className="mt-4">
                                    {card.imageUrl ? (
                                        <div className="relative inline-block">
                                            <img
                                                src={card.imageUrl}
                                                alt="Selected"
                                                className="h-24 w-auto rounded-lg object-cover border border-gray-200"
                                            />
                                            <button
                                                onClick={() => removeImage(card.tempId)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                            >
                                                <FaXmark className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => openImagePicker(card.tempId)}
                                            disabled={!card.term.trim()}
                                            className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-teal-400 hover:text-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <FaImage className="w-4 h-4" />
                                            <span className="text-sm">
                                                {card.term.trim() ? "Select image" : "Enter term to select image"}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Card Button */}
                <button
                    onClick={addCard}
                    className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors flex items-center justify-center gap-2"
                >
                    <FaPlus className="w-4 h-4" />
                    Add card
                </button>

                {/* Card Count */}
                <p className="text-center text-gray-400 text-sm mt-4">
                    {cards.length} cards • Need at least 2 cards
                </p>
            </div>

            {/* Image Picker Modal */}
            <Modal
                title="Select image"
                open={imagePickerOpen}
                onCancel={() => {
                    setImagePickerOpen(false);
                    setActiveCardId(null);
                    setSearchImages([]);
                }}
                footer={null}
                width={600}
            >
                {/* Search Input */}
                <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search image..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    fetchImages(searchQuery);
                                }
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-400"
                        />
                        <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <button
                        onClick={() => fetchImages(searchQuery)}
                        disabled={imageLoading}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                    >
                        {imageLoading ? <Spin size="small" /> : "Search"}
                    </button>
                </div>

                {/* Images Grid */}
                {imageLoading ? (
                    <div className="flex justify-center py-12">
                        <Spin size="large" />
                    </div>
                ) : searchImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {searchImages.map((img) => (
                            <button
                                key={img.id}
                                onClick={() => selectImage(img.largeImageURL)}
                                className="relative group overflow-hidden rounded-lg border-2 border-transparent hover:border-teal-400 transition-all"
                            >
                                <img
                                    src={img.previewURL}
                                    alt={img.tags}
                                    className="w-full h-32 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                                        <FaCheck className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <FaImage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Enter keyword to search image</p>
                        <p className="text-sm text-gray-400 mt-1">Powered by Pixabay</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default FlashcardEditPage;
