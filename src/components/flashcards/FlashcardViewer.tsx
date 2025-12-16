import React, { useState } from "react";
import { FaRedo, FaKeyboard } from "react-icons/fa";
import type { Flashcard } from "~/types/flashcardSet";

interface FlashcardViewerProps {
    card: Flashcard;
    currentIndex: number;
    totalCards: number;
    onPrevious: () => void;
    onNext: () => void;
    showNavigation?: boolean;
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
    card,
    currentIndex,
    totalCards,
    onPrevious,
    onNext,
    showNavigation = true,
}) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            handleFlip();
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            setIsFlipped(false);
            onPrevious();
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            setIsFlipped(false);
            onNext();
        }
    };

    // Reset flip when card changes
    React.useEffect(() => {
        setIsFlipped(false);
    }, [card.id]);

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Card Container */}
            <div
                className="relative w-full aspect-[16/10] cursor-pointer perspective-1000"
                onClick={handleFlip}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="button"
                aria-label={isFlipped ? "Showing definition, click to show term" : "Showing term, click to show definition"}
            >
                <div
                    className={`absolute inset-0 w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? "rotate-y-180" : ""
                        }`}
                >
                    {/* Front - Term */}
                    <div className="absolute inset-0 w-full h-full backface-hidden">
                        <div className="w-full h-full bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col items-center justify-center p-8 hover:shadow-xl transition-shadow">
                            <p className="text-2xl md:text-3xl font-semibold text-gray-800 text-center">
                                {card.term}
                            </p>
                            {card.imageUrl && (
                                <img
                                    src={card.imageUrl}
                                    alt="Term illustration"
                                    className="mt-4 max-h-32 object-contain rounded-lg"
                                />
                            )}
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                <span className="text-sm text-gray-400 flex items-center gap-2">
                                    <FaRedo className="w-3 h-3" />
                                    Click to flip card
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Back - Definition */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                        <div className="w-full h-full bg-teal-50 rounded-2xl shadow-lg border border-teal-200 flex flex-col items-center justify-center p-8 hover:shadow-xl transition-shadow">
                            <p className="text-xl md:text-2xl text-gray-700 text-center">
                                {card.definition}
                            </p>
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                <span className="text-sm text-teal-500 flex items-center gap-2">
                                    <FaRedo className="w-3 h-3" />
                                    Click to view term
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            {showNavigation && (
                <div className="flex items-center justify-center gap-6 mt-6">
                    <button
                        onClick={() => {
                            setIsFlipped(false);
                            onPrevious();
                        }}
                        disabled={currentIndex === 0}
                        className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <span className="text-lg font-medium text-gray-700">
                        {currentIndex + 1} / {totalCards}
                    </span>

                    <button
                        onClick={() => {
                            setIsFlipped(false);
                            onNext();
                        }}
                        disabled={currentIndex === totalCards - 1}
                        className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Keyboard hint */}
            <div className="flex justify-center mt-4">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <FaKeyboard className="w-3 h-3" />
                        Space to flip
                    </span>
                    <span>← → to navigate</span>
                </div>
            </div>
        </div>
    );
};

export default FlashcardViewer;
