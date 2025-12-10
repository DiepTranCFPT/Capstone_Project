import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FRQ } from '~/types/question';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { getSubjectRenderModeByCodeAndName } from '~/configs/subjectRenderMode';

interface FRQCardProps {
    question: FRQ;
    questionNumber: number;
    savedAnswer?: string;
    onAnswerChange?: (questionIndex: number, hasAnswer: boolean, answerData?: { selectedAnswerId?: string; frqAnswerText?: string }) => void;
}

const FRQCard: React.FC<FRQCardProps> = ({ question, questionNumber, savedAnswer, onAnswerChange }) => {
    const [answerText, setAnswerText] = useState(savedAnswer || '');
    const isInitialMountRef = useRef(true);
    const prevSavedAnswerRef = useRef<string | undefined>(savedAnswer);
    const isSyncingRef = useRef(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Determine the card mode based on subject using centralized config
    // Checks subjectCode first (if available), then falls back to subject name
    const getCardMode = () => {
        const subjectCode = (question as unknown as { subjectCode?: string }).subjectCode;
        return getSubjectRenderModeByCodeAndName(subjectCode, question.subject);
    };

    const cardMode = getCardMode();

    // Function to insert text at cursor position
    const insertTextAtCursor = useCallback((textToInsert: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const beforeText = answerText.substring(0, startPos);
        const afterText = answerText.substring(endPos);

        const newText = beforeText + textToInsert + afterText;
        setAnswerText(newText);

        // Set cursor position after inserted text
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = startPos + textToInsert.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    }, [answerText]);

    // Keyboard shortcuts handler
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Căn bậc 2: Ctrl + R
        if (e.ctrlKey && !e.shiftKey && e.key === 'r') {
            e.preventDefault();
            insertTextAtCursor('\\sqrt{}');
        }
        // Tập số thực: Ctrl + Shift + R
        else if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            insertTextAtCursor('\\mathbb{R}');
        }
        // Tập số nguyên: Ctrl + Shift + N
        else if (e.ctrlKey && e.shiftKey && e.key === 'N') {
            e.preventDefault();
            insertTextAtCursor('\\mathbb{N}');
        }
        // Tích phân: Ctrl + I
        else if (e.ctrlKey && !e.shiftKey && e.key === 'i') {
            e.preventDefault();
            insertTextAtCursor('\\int f(x) \\, dx');
        }
    }, [insertTextAtCursor]);

    // Sync answerText when savedAnswer prop changes (e.g., when loaded from localStorage)
    useEffect(() => {
        // Only sync if savedAnswer actually changed from parent
        if (savedAnswer !== prevSavedAnswerRef.current) {
            const newValue = savedAnswer || '';
            prevSavedAnswerRef.current = savedAnswer;

            // Always update if prop changed, using functional update to avoid dependency
            setAnswerText(prevText => {
                if (newValue !== prevText) {
                    isSyncingRef.current = true;
                    // Reset flag after state update completes
                    requestAnimationFrame(() => {
                        isSyncingRef.current = false;
                    });
                    return newValue;
                }
                return prevText;
            });
        }
    }, [savedAnswer]); // Only depend on savedAnswer

    // Notify parent about saved answer on initial mount
    useEffect(() => {
        if (savedAnswer && savedAnswer.trim() !== '' && onAnswerChange && isInitialMountRef.current) {
            onAnswerChange(questionNumber - 1, true, {
                selectedAnswerId: undefined,
                frqAnswerText: savedAnswer.trim() || undefined
            });
        }
    }, []); // Empty dependency array - only run once on mount

    // Notify parent when answerText changes (skip on initial mount and when syncing)
    useEffect(() => {
        // Skip if we're currently syncing from prop
        if (isSyncingRef.current) {
            return;
        }

        // Always notify on initial mount if there's a saved answer
        const shouldNotify = !isInitialMountRef.current || (savedAnswer && savedAnswer.trim() !== '');

        if (shouldNotify && onAnswerChange) {
            const trimmedText = answerText.trim();
            onAnswerChange(questionNumber - 1, trimmedText !== '', {
                selectedAnswerId: undefined,
                frqAnswerText: trimmedText || undefined
            });
        }

        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
        }
    }, [answerText, questionNumber, onAnswerChange]); // Remove savedAnswer from deps to avoid array size changes

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAnswerText(e.target.value);
    };

    // LaTeX preview renderer
    const renderLatexPreview = (text: string) => {
        if (!text.trim()) {
            return <span className="text-gray-400">The formula will be displayed here....</span>;
        }

        try {
            // For now, render the whole text as LaTeX. In a production app, you'd parse $ delimiters
            // Replace newlines with LaTeX newline command for BlockMath
            const latexFormattedText = text.replace(/\n/g, '\\\\');
            return <BlockMath>{latexFormattedText}</BlockMath>;
        } catch (error) {
            console.error('Error rendering LaTeX:', error);
            return <span className="text-gray-500">Error rendering LaTeX. Check LaTeX syntax.</span>;
        }
    };

    // State for split screen width (percentage of left panel)
    const [leftPanelWidth, setLeftPanelWidth] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isResizingRef = useRef(false);

    // Handle mouse events for resizing
    const startResizing = useCallback(() => {
        isResizingRef.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const stopResizing = useCallback(() => {
        isResizingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    const resize = useCallback((e: MouseEvent) => {
        if (isResizingRef.current && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            // Limit width between 20% and 80%
            if (newLeftWidth >= 20 && newLeftWidth <= 80) {
                setLeftPanelWidth(newLeftWidth);
            }
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    if (cardMode === "latex") {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">{questionNumber}. {question.text}</h3>

                {/* LaTeX Instructions */}
                <div className="mb-4 bg-blue-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                        📝 How to write math formula:
                    </h4>
                    <div className="text-xs text-blue-700 space-y-1">
                        <div>• Press <kbd className="bg-blue-100 px-1 rounded">Enter</kbd> to go to the next line</div>
                        <div>• Use symbols: <code className="bg-blue-100 px-1 rounded">^</code> for power, <code className="bg-blue-100 px-1 rounded">_</code> for subscript</div>
                        <div>• Shortcuts: <kbd className="bg-blue-100 px-1 rounded">Ctrl+R</kbd> square root, <kbd className="bg-blue-100 px-1 rounded">Ctrl+Shift+R</kbd> set ℝ, <kbd className="bg-blue-100 px-1 rounded">Ctrl+Shift+N</kbd> set ℕ, <kbd className="bg-blue-100 px-1 rounded">Ctrl+I</kbd> integration</div>
                        <div>• Example: <code className="bg-blue-100 px-1 rounded">x^2 + 2x + 1 = 0</code> or <code className="bg-blue-100 px-1 rounded">H_2O</code></div>
                    </div>
                </div>

                {/* LaTeX Math Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter math formula (LaTeX/Math):
                    </label>
                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={() => setAnswerText(prev => prev + "\n")}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded text-gray-700"
                            type="button"
                            title="New line"
                        >
                            ⏎ New line
                        </button>
                        <button
                            onClick={() => setAnswerText(prev => prev + "^")}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded text-gray-700"
                            type="button"
                            title="Power"
                        >
                            x² Power
                        </button>
                        <button
                            onClick={() => setAnswerText(prev => prev + "_")}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded text-gray-700"
                            type="button"
                            title="Subscript"
                        >
                            x₁ Subscript
                        </button>
                        <button
                            onClick={() => setAnswerText(prev => prev + "\\frac{}{}")}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded text-gray-700"
                            type="button"
                            title="Fraction"
                        >
                            ½ Fraction
                        </button>
                    </div>
                    <textarea
                        ref={textareaRef}
                        rows={6}
                        value={answerText}
                        onChange={(e) => {
                            // Allow line breaks by treating Enter key normally
                            handleTextChange(e);
                        }}
                        onKeyDown={handleKeyDown}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 font-mono text-sm resize-vertical"
                        placeholder={`Example:\nx = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}

Or simple:
x^2 + 2x + 1 = 0`}
                        style={{ minHeight: '120px' }}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preview mathematical formulas:</label>
                    <div className="bg-gray-50 p-4 rounded-md border min-h-32 whitespace-pre-wrap">
                        <div className="text-gray-600 text-sm mb-2">Your formula:</div>
                        <div className="bg-white p-3 rounded min-h-16">
                            {renderLatexPreview(answerText) || answerText}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (cardMode === "splitscreen") {
        return (
            <div
                ref={containerRef}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
                <div className="flex min-h-[24rem]">
                    {/* Left panel - Question and sources */}
                    <div
                        style={{ width: `${leftPanelWidth}%` }}
                        className="bg-teal-50/50 p-6 border-r border-gray-200 overflow-hidden"
                    >
                        <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                            {questionNumber}. Question
                        </h3>
                        <div className="text-sm text-gray-700 whitespace-pre-line">
                            {question.text}
                        </div>
                    </div>

                    {/* Resize Handle */}
                    <div
                        className="w-1 bg-gray-200 hover:bg-teal-400 cursor-col-resize flex items-center justify-center transition-colors"
                        onMouseDown={startResizing}
                    >
                        <div className="w-0.5 h-8 bg-gray-400 rounded-full" />
                    </div>

                    {/* Right panel - Answer input */}
                    <div
                        style={{ width: `${100 - leftPanelWidth}%` }}
                        className="p-6 overflow-hidden"
                    >
                        <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                            Your answer
                        </h3>
                        <textarea
                            ref={textareaRef}
                            rows={12}
                            value={answerText}
                            onChange={handleTextChange}
                            onKeyDown={handleKeyDown}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 resize-vertical min-h-[16rem]"
                            placeholder="Enter your answer here..."
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Default normal mode
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">{questionNumber}. {question.text}</h3>
            <textarea
                ref={textareaRef}
                rows={6}
                value={answerText}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 resize"
                placeholder="Type your answer here..."
            ></textarea>

        </div>
    );
};

export default FRQCard;
