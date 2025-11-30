import React from 'react';
import type { ViolationCounts } from '~/types/proctoring';

interface ProctoringStatusProps {
    isActive: boolean;
    isFullscreen: boolean;
    violationCounts: ViolationCounts;
    totalViolations: number;
    maxViolations: number;
}

const ProctoringStatus: React.FC<ProctoringStatusProps> = ({
    isActive,
    isFullscreen,
    violationCounts,
    totalViolations,
    maxViolations,
}) => {
    if (!isActive) return null;

    const remainingViolations = maxViolations - totalViolations;

    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 mb-6 border-2 border-purple-200/50 shadow-md">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-lg">🔒</span>
                    <span>Proctoring Active</span>
                </h3>
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            </div>

            {/* Fullscreen Status */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-purple-200/50">
                <span className="text-sm text-gray-600">📺 Fullscreen:</span>
                <div className="flex items-center gap-2">
                    {isFullscreen ? (
                        <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Active
                        </span>
                    ) : (
                        <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            Inactive
                        </span>
                    )}
                </div>
            </div>

            {/* Violation Counter */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">⚠️ Violations:</span>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${totalViolations === 0 ? 'text-green-600' :
                            remainingViolations > 1 ? 'text-orange-600' :
                                'text-red-600'
                        }`}>
                        {totalViolations} / {maxViolations}
                    </span>
                </div>
            </div>

            {/* Remaining Violations Badge */}
            {totalViolations > 0 && (
                <div className={`p-2 rounded-lg text-center ${remainingViolations > 1
                        ? 'bg-orange-100 border border-orange-300'
                        : 'bg-red-100 border border-red-300'
                    }`}>
                    <p className={`text-xs font-semibold ${remainingViolations > 1 ? 'text-orange-700' : 'text-red-700'
                        }`}>
                        {remainingViolations > 0
                            ? `Remaining ${remainingViolations} violations`
                            : 'Exceeded maximum violations!'
                        }
                    </p>
                </div>
            )}

            {/* Violation Details (collapsed) */}
            {totalViolations > 0 && (
                <details className="mt-3">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                        Violation Details
                    </summary>
                    <div className="mt-2 space-y-1 text-xs text-gray-600 pl-2">
                        {violationCounts.tab_switch > 0 && (
                            <div>• Tab Switch: {violationCounts.tab_switch}</div>
                        )}
                        {violationCounts.fullscreen_exit > 0 && (
                            <div>• Exit Fullscreen: {violationCounts.fullscreen_exit}</div>
                        )}
                        {violationCounts.copy_attempt > 0 && (
                            <div>• Copy Attempt: {violationCounts.copy_attempt}</div>
                        )}
                        {violationCounts.context_menu_attempt > 0 && (
                            <div>• Right Click Attempt: {violationCounts.context_menu_attempt}</div>
                        )}
                    </div>
                </details>
            )}
        </div>
    );
};

export default ProctoringStatus;
