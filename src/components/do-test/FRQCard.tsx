import React, { useState, useEffect, useRef } from 'react';
import type { FRQ } from '~/types/question';
import { useAuth } from '~/hooks/useAuth';
import { Button } from 'antd';
import { FaRobot } from 'react-icons/fa';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface FRQCardProps {
    question: FRQ;
    questionNumber: number;
    savedAnswer?: string;
    onAnswerChange?: (questionIndex: number, hasAnswer: boolean, answerData?: { selectedAnswerId?: string; frqAnswerText?: string }) => void;
}

const FRQCard: React.FC<FRQCardProps> = ({ question, questionNumber, savedAnswer, onAnswerChange }) => {
    const { spendTokens } = useAuth();
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    const [answerText, setAnswerText] = useState(savedAnswer || '');
    const isInitialMountRef = useRef(true);
    const prevSavedAnswerRef = useRef<string | undefined>(savedAnswer);
    const isSyncingRef = useRef(false);

    // Determine the card mode based on subject
    const getCardMode = () => {
        const subjectName = question.subject;
        //update subject names as needed
        const mathScienceSubjects = ["Mathematics", "Physics", "Chemistry"];
        const historyEnglishSubjects = ["History", "English Language"];

        if (mathScienceSubjects.includes(subjectName)) {
            return "latex";
        } else if (historyEnglishSubjects.includes(subjectName)) {
            return "splitscreen";
        } else {
            return "normal";
        }
    };

    const cardMode = getCardMode();

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

    const handleAnalyze = () => {
        spendTokens(1);
        setIsAnalyzed(true);
        // Here you would typically make an API call to your AI service
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAnswerText(e.target.value);
    };

    // LaTeX preview renderer
    const renderLatexPreview = (text: string) => {
        if (!text.trim()) {
            return <span className="text-gray-400">Công thức sẽ hiển thị ở đây...</span>;
        }

        try {
            // For now, render the whole text as LaTeX. In a production app, you'd parse $ delimiters
            // Replace newlines with LaTeX newline command for BlockMath
            const latexFormattedText = text.replace(/\n/g, '\\\\');
            return <BlockMath>{latexFormattedText}</BlockMath>;
        } catch (error) {
            console.error('Error rendering LaTeX:', error);
            return <span className="text-gray-500">Lỗi hiển thị công thức. Kiểm tra cú pháp LaTeX.</span>;
        }
    };

    if (cardMode === "latex") {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">{questionNumber}. {question.text}</h3>

                {/* LaTeX Instructions */}
                <div className="mb-4 bg-blue-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                        📝 Hướng dẫn viết công thức toán:
                    </h4>
                    <div className="text-xs text-blue-700 space-y-1">
                        <div>• Nhấn <kbd className="bg-blue-100 px-1 rounded">Enter</kbd> để xuống dòng</div>
                        <div>• Sử dụng ký hiệu: <code className="bg-blue-100 px-1 rounded">^</code> cho lũy thừa, <code className="bg-blue-100 px-1 rounded">_</code> cho chỉ số dưới</div>
                        <div>• Ví dụ: <code className="bg-blue-100 px-1 rounded">x^2 + 2x + 1 = 0</code> hoặc <code className="bg-blue-100 px-1 rounded">H_2O</code></div>
                    </div>
                </div>

                {/* LaTeX Math Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nhập công thức toán (LaTeX/Math):
                    </label>
                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={() => setAnswerText(prev => prev + "\n")}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded text-gray-700"
                            type="button"
                            title="Xuống dòng"
                        >
                            ⏎ Dòng mới
                        </button>
                        <button
                            onClick={() => setAnswerText(prev => prev + "^")}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded text-gray-700"
                            type="button"
                            title="Lũy thừa"
                        >
                            x² Mũ
                        </button>
                        <button
                            onClick={() => setAnswerText(prev => prev + "_")}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded text-gray-700"
                            type="button"
                            title="Chỉ số dưới"
                        >
                            x₁ Chỉ số
                        </button>
                        <button
                            onClick={() => setAnswerText(prev => prev + "\\frac{}{}")}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded text-gray-700"
                            type="button"
                            title="Phân số"
                        >
                            ½ Phân số
                        </button>
                    </div>
                    <textarea
                        rows={6}
                        value={answerText}
                        onChange={(e) => {
                            // Allow line breaks by treating Enter key normally
                            handleTextChange(e);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 font-mono text-sm resize-vertical"
                        placeholder={`Ví dụ hoàn chỉnh:\nx = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}

Hoặc đơn giản:
x^2 + 2x + 1 = 0`}
                        style={{ minHeight: '120px' }}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Xem trước công thức:</label>
                    <div className="bg-gray-50 p-4 rounded-md border min-h-32 whitespace-pre-wrap">
                        <div className="text-gray-600 text-sm mb-2">Công thức của bạn:</div>
                        <div className="bg-white p-3 rounded min-h-16">
                            {renderLatexPreview(answerText) || answerText}
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <Button
                        icon={<FaRobot />}
                        onClick={handleAnalyze}
                        disabled={isAnalyzed}
                        className="flex items-center"
                    >
                        {isAnalyzed ? 'Analyzed' : 'Phân tích với AI (1 Token)'}
                    </Button>
                </div>
            </div>
        );
    }

    if (cardMode === "splitscreen") {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-2 h-96">
                    {/* Left panel - Question and sources */}
                    <div className="bg-teal-50/50 p-6 border-r border-gray-200 overflow-y-auto">
                        <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                            {questionNumber}. Câu hỏi
                        </h3>
                        <div className="text-sm text-gray-700 whitespace-pre-line">
                            {question.text}
                        </div>
                    </div>

                    {/* Right panel - Answer input */}
                    <div className="p-6 overflow-y-auto">
                        <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                            Đáp án của bạn
                        </h3>
                        <textarea
                            rows={12}
                            value={answerText}
                            onChange={handleTextChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 resize-none h-64"
                            placeholder="Nhập đáp án của bạn ở đây..."
                        />
                        <div className="mt-4">
                            <Button
                                icon={<FaRobot />}
                                onClick={handleAnalyze}
                                disabled={isAnalyzed}
                                className="flex items-center"
                            >
                                {isAnalyzed ? 'Analyzed' : 'Phân tích với AI (1 Token)'}
                            </Button>
                        </div>
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
                rows={6}
                value={answerText}
                onChange={handleTextChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                placeholder="Type your answer here..."
            ></textarea>
            <div className="mt-4">
                <Button
                    icon={<FaRobot />}
                    onClick={handleAnalyze}
                    disabled={isAnalyzed}
                    className="flex items-center"
                >
                    {isAnalyzed ? 'Analyzed' : 'Phân tích với AI (1 Token)'}
                </Button>
            </div>
        </div>
    );
};

export default FRQCard;
