import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '~/components/common/Toast';

import type {
    ProctoringConfig,
    ProctoringViolation,
    ViolationCounts,
    ViolationType,
    ProctoringMetadata
} from '~/types/proctoring';

interface UseExamProctoringReturn {
    violations: ProctoringViolation[];
    violationCounts: ViolationCounts;
    totalViolations: number;
    isFullscreen: boolean;
    isProctoringActive: boolean;
    startProctoring: () => void;
    stopProctoring: () => void;
    requestFullscreen: () => Promise<void>;
    exitFullscreen: () => Promise<void>;
    resetViolations: () => void;
    getProctoringMetadata: () => ProctoringMetadata;
}

export const useExamProctoring = (
    config: ProctoringConfig,
    onAutoSubmit?: () => void
): UseExamProctoringReturn => {
    const [violations, setViolations] = useState<ProctoringViolation[]>([]);
    const [violationCounts, setViolationCounts] = useState<ViolationCounts>({
        tab_switch: 0,
        fullscreen_exit: 0,
        copy_attempt: 0,
        context_menu_attempt: 0,
    });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isProctoringActive, setIsProctoringActive] = useState(false);
    const [proctoringStartTime, setProctoringStartTime] = useState<number>(0);

    // Refs for tracking
    const tabSwitchStartTime = useRef<number | null>(null);
    const autoSubmitTriggered = useRef(false);

    // Add violation with deduplication
    const addViolation = useCallback((type: ViolationType, duration?: number) => {
        const now = Date.now();
        const newViolation: ProctoringViolation = {
            type,
            timestamp: now,
            duration,
        };

        setViolations(prev => [...prev, newViolation]);
        setViolationCounts(prev => ({
            ...prev,
            [type]: prev[type] + 1,
        }));

        // Calculate total violations
        const newTotal = Object.values(violationCounts).reduce((sum, count) => sum + count, 0) + 1;

        // Show warning message
        const remainingViolations = config.maxViolations - newTotal;
        if (remainingViolations > 0) {
            toast.warning(
                 `Warning! You have ${remainingViolations} more violations before the exam will be automatically submitted.`,
                 {
                    autoClose: 8000,
                 }
            );
        }

        // Auto-submit if max violations reached
        if (config.strictFullscreen && newTotal >= config.maxViolations && !autoSubmitTriggered.current) {
            autoSubmitTriggered.current = true;
            toast.error(
                 'Error! You have exceeded the maximum number of violations. The exam will be automatically submitted.'
            );
            setTimeout(() => {
                onAutoSubmit?.();
            }, 3000); // Give user 3 seconds to see the toast
        }
    }, [config, violationCounts, onAutoSubmit]);

    // Tab/Window visibility detection
    useEffect(() => {
        if (!isProctoringActive || !config.enableTabDetection) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                // User left the tab
                tabSwitchStartTime.current = Date.now();
            } else {
                // User returned to the tab
                if (tabSwitchStartTime.current) {
                    const duration = Date.now() - tabSwitchStartTime.current;
                    // Only count if they were away for more than 1 second (avoid false positives)
                    if (duration > 1000) {
                        addViolation('tab_switch', duration);
                    }
                    tabSwitchStartTime.current = null;
                }
            }
        };

        const handleBlur = () => {
            // Window lost focus
            if (!tabSwitchStartTime.current) {
                tabSwitchStartTime.current = Date.now();
            }
        };

        const handleFocus = () => {
            // Window gained focus
            if (tabSwitchStartTime.current) {
                const duration = Date.now() - tabSwitchStartTime.current;
                if (duration > 1000) {
                    addViolation('tab_switch', duration);
                }
                tabSwitchStartTime.current = null;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [isProctoringActive, config.enableTabDetection, addViolation]);

    // Copy/Paste blocking
    useEffect(() => {
        if (!isProctoringActive || !config.enableCopyBlock) return;

        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            addViolation('copy_attempt');
            toast.warning('Error! You are not allowed to copy content from the exam!',
                {
                    autoClose: 5000,
                }
            );
        };

        const handleCut = (e: ClipboardEvent) => {
            e.preventDefault();
            addViolation('copy_attempt');
            toast.warning('Error! You are not allowed to cut content from the exam!',
                {
                    autoClose: 5000,
                }
            );
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            addViolation('context_menu_attempt');
            toast.warning('Error! You are not allowed to use the right mouse button!',
                {
                    autoClose: 5000,
                }
            );
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Block Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+A
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'c' || e.key === 'x') {
                    // Check if target is a textarea (for FRQ answers)
                    const target = e.target as HTMLElement;
                    if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') {
                        e.preventDefault();
                        addViolation('copy_attempt');
                        toast.warning('Error! You are not allowed to copy content from the exam!',
                            {
                                autoClose: 5000,
                            }
                        );
                    }
                }
            }
        };

        document.addEventListener('copy', handleCopy);
        document.addEventListener('cut', handleCut);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('cut', handleCut);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isProctoringActive, config.enableCopyBlock, addViolation]);

    // Fullscreen detection
    useEffect(() => {
        if (!isProctoringActive || !config.enableFullscreenMode) return;

        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!document.fullscreenElement;
            setIsFullscreen(isCurrentlyFullscreen);

            // If user exits fullscreen (and we're in strict mode)
            if (!isCurrentlyFullscreen && isProctoringActive && config.strictFullscreen) {
                addViolation('fullscreen_exit');
                toast.error('Error! You have exited fullscreen mode!');

                // Try to re-enter fullscreen after a short delay
                setTimeout(() => {
                    if (isProctoringActive && !autoSubmitTriggered.current) {
                        requestFullscreen();
                    }
                }, 500);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [isProctoringActive, config.enableFullscreenMode, config.strictFullscreen, addViolation]);

    // Request fullscreen
    const requestFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            }
        } catch (err) {
            console.error('Failed to enter fullscreen:', err);
            toast.error('Error! Failed to enter fullscreen mode. Please try again.');
        }
    }, []);

    // Exit fullscreen
    const exitFullscreen = useCallback(async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error('Failed to exit fullscreen:', err);
        }
    }, []);

    // Start proctoring
    const startProctoring = useCallback(() => {
        setIsProctoringActive(true);
        setProctoringStartTime(Date.now());

        // Auto-enter fullscreen if enabled
        if (config.enableFullscreenMode) {
            requestFullscreen();
        }

        toast.success('Proctoring mode has been activated. Good luck!');
    }, [config.enableFullscreenMode, requestFullscreen]);

    // Stop proctoring
    const stopProctoring = useCallback(() => {
        setIsProctoringActive(false);

        // Exit fullscreen when stopping
        if (isFullscreen) {
            exitFullscreen();
        }
    }, [isFullscreen, exitFullscreen]);

    // Reset violations
    const resetViolations = useCallback(() => {
        setViolations([]);
        setViolationCounts({
            tab_switch: 0,
            fullscreen_exit: 0,
            copy_attempt: 0,
            context_menu_attempt: 0,
        });
        autoSubmitTriggered.current = false;
    }, []);

    // Get proctoring metadata
    const getProctoringMetadata = useCallback((): ProctoringMetadata => {
        return {
            violations,
            violationCounts,
            totalViolations: Object.values(violationCounts).reduce((sum, count) => sum + count, 0),
            proctoringStartTime,
            proctoringEndTime: Date.now(),
            autoSubmitTriggered: autoSubmitTriggered.current,
        };
    }, [violations, violationCounts, proctoringStartTime]);

    return {
        violations,
        violationCounts,
        totalViolations: Object.values(violationCounts).reduce((sum, count) => sum + count, 0),
        isFullscreen,
        isProctoringActive,
        startProctoring,
        stopProctoring,
        requestFullscreen,
        exitFullscreen,
        resetViolations,
        getProctoringMetadata,
    };
};
