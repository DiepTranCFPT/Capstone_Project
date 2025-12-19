import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FRQ, QuestionContext } from '~/types/question';
import { getSubjectRenderModeByCodeAndName } from '~/configs/subjectRenderMode';
import MathEditor from '~/components/common/MathEditor';
import LatexRenderer from '~/components/common/LatexRenderer';
import ContextDisplay from './ContextDisplay';
import { Image } from 'antd';
import { AudioOutlined } from '@ant-design/icons';

interface FRQCardProps {
    question: FRQ;
    questionNumber: number;
    savedAnswer?: string;
    onAnswerChange?: (questionIndex: number, hasAnswer: boolean, answerData?: { selectedAnswerId?: string; frqAnswerText?: string }) => void;
    questionContext?: QuestionContext;
}

const FRQCard: React.FC<FRQCardProps> = ({ question, questionNumber, savedAnswer, onAnswerChange, questionContext }) => {
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
                {/* Context Display */}
                {questionContext && (
                    <ContextDisplay context={questionContext} defaultExpanded={true} />
                )}

                {/* Question-level media */}
                {(question.imageUrl || question.audioUrl) && (
                    <div className="mb-4 space-y-3">
                        {question.imageUrl && (
                            <Image
                                src={question.imageUrl}
                                alt="Question image"
                                className="rounded-lg max-h-48 object-contain"
                                style={{ maxWidth: "100%" }}
                            />
                        )}
                        {question.audioUrl && (
                            <div className="audio-container bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <AudioOutlined />
                                    <span>Listen to audio</span>
                                </div>
                                <audio src={question.audioUrl} controls className="w-full" />
                            </div>
                        )}
                    </div>
                )}

                <h3 className="font-semibold text-gray-800 mb-4">
                    {questionNumber}. <LatexRenderer content={question.text} />
                </h3>

                {/* MathLive WYSIWYG Editor */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your answer:
                    </label>
                    <MathEditor
                        value={answerText}
                        onChange={setAnswerText}
                        placeholder="Enter your answer here..."
                    />
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
                {/* Context Display for splitscreen */}
                {questionContext && (
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <ContextDisplay context={questionContext} defaultExpanded={true} compact={true} />
                    </div>
                )}

                <div className="flex min-h-[24rem]">
                    {/* Left panel - Question and sources */}
                    <div
                        style={{ width: `${leftPanelWidth}%` }}
                        className="bg-teal-50/50 p-6 border-r border-gray-200 overflow-hidden"
                    >
                        <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                            {questionNumber}. Question
                        </h3>

                        {/* Question-level media */}
                        {(question.imageUrl || question.audioUrl) && (
                            <div className="mb-4 space-y-3">
                                {question.imageUrl && (
                                    <Image
                                        src={question.imageUrl}
                                        alt="Question image"
                                        className="rounded-lg max-h-32 object-contain"
                                        style={{ maxWidth: "100%" }}
                                    />
                                )}
                                {question.audioUrl && (
                                    <audio src={question.audioUrl} controls className="w-full" />
                                )}
                            </div>
                        )}

                        <div className="text-sm text-gray-700 whitespace-pre-line">
                            <LatexRenderer content={question.text} />
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
            {/* Context Display */}
            {questionContext && (
                <ContextDisplay context={questionContext} defaultExpanded={true} />
            )}

            {/* Question-level media */}
            {(question.imageUrl || question.audioUrl) && (
                <div className="mb-4 space-y-3">
                    {question.imageUrl && (
                        <Image
                            src={question.imageUrl}
                            alt="Question image"
                            className="rounded-lg max-h-48 object-contain"
                            style={{ maxWidth: "100%" }}
                        />
                    )}
                    {question.audioUrl && (
                        <div className="audio-container bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <AudioOutlined />
                                <span>Listen to audio</span>
                            </div>
                            <audio src={question.audioUrl} controls className="w-full" />
                        </div>
                    )}
                </div>
            )}

            <h3 className="font-semibold text-gray-800 mb-4">
                {questionNumber}. <LatexRenderer content={question.text} />
            </h3>
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
