export type ViolationType =
    | 'tab_switch'
    | 'fullscreen_exit'
    | 'copy_attempt'
    | 'context_menu_attempt';

export interface ProctoringViolation {
    type: ViolationType;
    timestamp: number;
    duration?: number; // For tab_switch - how long they were away
    metadata?: Record<string, any>;
}

export interface ViolationCounts {
    tab_switch: number;
    fullscreen_exit: number;
    copy_attempt: number;
    context_menu_attempt: number;
}

export interface ProctoringConfig {
    enableTabDetection: boolean;
    enableCopyBlock: boolean;
    enableFullscreenMode: boolean;
    strictFullscreen: boolean; // Auto-submit on max violations
    maxViolations: number;
}

export interface ProctoringMetadata {
    violations: ProctoringViolation[];
    violationCounts: ViolationCounts;
    totalViolations: number;
    proctoringStartTime: number;
    proctoringEndTime?: number;
    autoSubmitTriggered?: boolean;
}
