import React from 'react';
import { CiLock } from "react-icons/ci";
import { CiWarning } from "react-icons/ci";
import { FaCheckCircle } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { FaXmark } from "react-icons/fa6";
interface ProctoringRulesModalProps {
    visible: boolean;
    onAccept: () => void;
    onReject: () => void;
}

const ProctoringRulesModal: React.FC<ProctoringRulesModalProps> = ({
    visible,
    onAccept,
    onReject,
}) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-backgroundColor text-white p-6 rounded-t-2xl">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="text-3xl"><CiLock /></span>
                        Proctoring Rules
                    </h2>
                    <p className="text-teal-100 mt-2">
                        Please read carefully and follow the rules below
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Warning Box */}
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl"><CiWarning className='text-red-500'/></span>
                            <div>
                                <h3 className="font-bold text-red-800 mb-1">Important Warning</h3>
                                <p className="text-sm text-red-700">
                                    This exam uses an automatic monitoring system. Exceeding <strong>4 violations</strong> will result in <strong>automatic submission</strong>!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Prohibited Actions */}
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-xl"><FcCancel /></span>
                            Prohibited Actions
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <span className="text-lg"><FaXmark className='text-red-500'/></span>
                                <div>
                                    <strong className="text-gray-800">Switch tab or window</strong>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Switching to another tab or window or using another application while taking the exam.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <span className="text-lg"><FaXmark className='text-red-500'/></span>
                                <div>
                                    <strong className="text-gray-800">Exit fullscreen mode</strong>
                                    <p className="text-sm text-gray-600 mt-1">
                                        The exam must be done in fullscreen mode. Do not press ESC or F11.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <span className="text-lg"><FaXmark className='text-red-500' /></span>
                                <div>
                                    <strong className="text-gray-800">Copy exam content</strong>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Copying (Ctrl+C) or using the right mouse button on the exam content.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Allowed Actions */}
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-xl"><FaCheckCircle className='text-green-500'/></span>
                            Allowed Actions
                        </h3>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                <span className="text-lg">✓</span>
                                <span className="text-sm text-gray-700">
                                    Writing and editing answers in the answer box
                                </span>
                            </li>
                            <li className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                <span className="text-lg">✓</span>
                                <span className="text-sm text-gray-700">
                                    Switching between questions
                                </span>
                            </li>
                            <li className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                <span className="text-lg">✓</span>
                                <span className="text-sm text-gray-700">
                                    Using the auto-save feature
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* System Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <span>ℹ️</span>
                            System Information
                        </h3>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>System will automatically save the exam progress every 30 seconds</li>
                            <li>Each violation will be warned and counted into total violations</li>
                            <li>After 4 violations, the exam will be automatically submitted</li>
                            <li>All violations will be recorded and teachers can view them</li>
                        </ul>
                    </div>

                    {/* Acceptance Checkbox */}
                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-700 text-center">
                            By pressing <strong>"I agree"</strong>, you confirm that you have read and understood the rules above,
                            and agree to follow them throughout the entire exam process.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 p-6 rounded-b-2xl flex gap-4 justify-end border-t border-gray-200">
                    <button
                        onClick={onReject}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all duration-200 border border-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onAccept}
                        className="px-6 py-3 bg-backgroundColor hover:bg-backgroundColor/80 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        I agree - Start Exam
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProctoringRulesModal;
