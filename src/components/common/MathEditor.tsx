import React, { useRef, useEffect, useCallback } from 'react';
import type { MathfieldElement } from 'mathlive';
import 'mathlive';
import './math-editor.css';

interface MathEditorProps {
    value: string;
    onChange: (latex: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    className?: string;
}

const MathEditor: React.FC<MathEditorProps> = ({
    value,
    onChange,
    placeholder = 'Type text here. Use $ for math (e.g., $x^2$)...',
    readOnly = false,
    className = ''
}) => {
    const mathFieldRef = useRef<MathfieldElement | null>(null);
    const isInternalChangeRef = useRef(false);

    // Update MathField when value prop changes externally
    useEffect(() => {
        const mf = mathFieldRef.current;
        if (mf && !isInternalChangeRef.current) {
            if (mf.value !== value) {
                mf.value = value;
            }
        }
        isInternalChangeRef.current = false;
    }, [value]);

    // Handle input changes from MathField
    const handleInput = useCallback((evt: Event) => {
        const mf = evt.target as MathfieldElement;
        if (mf) {
            isInternalChangeRef.current = true;
            onChange(mf.value);
        }
    }, [onChange]);

    // Setup event listeners and configuration
    useEffect(() => {
        const mf = mathFieldRef.current;
        if (mf) {
            mf.addEventListener('input', handleInput);

            // Configure MathLive for text+math mode
            mf.mathVirtualKeyboardPolicy = 'manual';

            // Enable smart mode for automatic text/math switching
            mf.smartMode = true;

            // Start in text mode by default
            mf.defaultMode = 'text';

            mf.addEventListener('focusin', () => {
                window.mathVirtualKeyboard?.show();
            });
            mf.addEventListener('focusout', () => {
                window.mathVirtualKeyboard?.hide();
            });

            return () => {
                mf.removeEventListener('input', handleInput);
            };
        }
    }, [handleInput]);

    return (
        <div className={`math-editor-container ${className}`}>
            <math-field
                ref={mathFieldRef as React.RefObject<MathfieldElement>}
                virtual-keyboard-mode="onfocus"
                className="math-field-input"
                style={{
                    width: '100%',
                    minHeight: '150px',
                    padding: '12px',
                    fontSize: '16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: readOnly ? '#f9fafb' : '#ffffff',
                    display: 'block',
                    lineHeight: '2',
                }}
            />
            {placeholder && !value && (
                <div className="math-editor-placeholder">
                    {placeholder}
                </div>
            )}
            <div className="mt-2 text-xs text-gray-500 space-y-1">
                <div>⌨️ Click to open math keyboard</div>
                <div>Ctr + Enter to add new line</div>
            </div>
        </div>
    );
};

export default MathEditor;
