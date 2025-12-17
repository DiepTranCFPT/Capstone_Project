import React from 'react';
import type { Exam } from '~/types/test';

interface TokenConfirmationModalProps {
    isOpen: boolean;
    exam: Exam | null;
    combinedExam: { exams: Exam[]; totalCost: number } | null;
    onConfirm: () => void;
    onCancel: () => void;
}

const TokenConfirmationModal: React.FC<TokenConfirmationModalProps> = ({
    isOpen,
    exam,
    combinedExam,
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg backdrop-blur-sm shadow-xl max-w-sm mx-auto border border-teal-200/50">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Test Start</h3>
                {exam && (
                    <p className="text-red-500 mb-6">
                        This test, "{exam.title}", costs {exam.tokenCost} tokens. Do you want to continue?
                    </p>
                )}
                {combinedExam && (
                    <p className="text-red-500 mb-6">
                        This combined test costs {combinedExam.totalCost} tokens. Do you want to continue?
                    </p>
                )}
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TokenConfirmationModal;
