import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
    content: string;
    className?: string;
}

// Common LaTeX commands to detect (without $ wrapper)
const LATEX_COMMAND_PATTERN = /\\(?:begin|end|frac|sqrt|sum|int|prod|lim|infty|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|sigma|omega|cdot|times|div|pm|leq|geq|neq|approx|equiv|subset|supset|in|notin|cup|cap|forall|exists|nabla|partial|left|right|text|mathrm|mathbf|mathit|vec|hat|bar|dot|ddot|overline|underline|overbrace|underbrace|pmatrix|bmatrix|matrix|cases|placeholder)/;

// Pattern to detect if content has LaTeX that needs rendering
const hasLatexContent = (text: string): boolean => {
    if (!text) return false;
    // Check for $...$ patterns
    if (/\$[^$]+\$/.test(text)) return true;
    // Check for $$...$$ patterns
    if (/\$\$[^$]+\$\$/.test(text)) return true;
    // Check for \(...\) or \[...\] patterns
    if (/\\\(.*?\\\)|\\\[.*?\\\]/.test(text)) return true;
    // Check for common LaTeX commands without dollar signs
    if (LATEX_COMMAND_PATTERN.test(text)) return true;
    // Check for ^ or _ with braces (common math notation)
    if (/[\^_]\{[^}]+\}/.test(text)) return true;
    return false;
};

/**
 * Component to render text containing LaTeX formulas
 * Supports:
 * - Inline math: $...$
 * - Block math: $$...$$
 * - Raw LaTeX commands without dollar signs
 * - Mixed text and LaTeX content
 */
const LatexRenderer: React.FC<LatexRendererProps> = ({ content, className = '' }) => {
    if (!content) return null;

    // Check if content contains any LaTeX patterns
    if (!hasLatexContent(content)) {
        return <span className={className}>{content}</span>;
    }

    try {
        const parts: React.ReactNode[] = [];
        let remainingContent = content;
        let key = 0;

        // Process content
        while (remainingContent.length > 0) {
            // Check for block math $$...$$
            const blockMatch = remainingContent.match(/^\$\$([^$]+)\$\$/);
            if (blockMatch) {
                parts.push(
                    <BlockMath key={key++} math={blockMatch[1].trim()} />
                );
                remainingContent = remainingContent.slice(blockMatch[0].length);
                continue;
            }

            // Check for inline math $...$
            const inlineMatch = remainingContent.match(/^\$([^$]+)\$/);
            if (inlineMatch) {
                parts.push(
                    <InlineMath key={key++} math={inlineMatch[1].trim()} />
                );
                remainingContent = remainingContent.slice(inlineMatch[0].length);
                continue;
            }

            // Check for \(...\) inline math
            const parenMatch = remainingContent.match(/^\\\((.*?)\\\)/);
            if (parenMatch) {
                parts.push(
                    <InlineMath key={key++} math={parenMatch[1].trim()} />
                );
                remainingContent = remainingContent.slice(parenMatch[0].length);
                continue;
            }

            // Check for \[...\] block math
            const bracketMatch = remainingContent.match(/^\\\[(.*?)\\\]/s);
            if (bracketMatch) {
                parts.push(
                    <BlockMath key={key++} math={bracketMatch[1].trim()} />
                );
                remainingContent = remainingContent.slice(bracketMatch[0].length);
                continue;
            }

            // Check if entire remaining content is raw LaTeX (like \begin{...}...\end{...})
            const rawLatexMatch = remainingContent.match(/^(\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\})/);
            if (rawLatexMatch) {
                parts.push(
                    <BlockMath key={key++} math={rawLatexMatch[1]} />
                );
                remainingContent = remainingContent.slice(rawLatexMatch[0].length);
                continue;
            }

            // Check if content starts with LaTeX commands (without $ wrapper)
            // This handles cases like "V = a^3" or "\frac{1}{2}"
            if (LATEX_COMMAND_PATTERN.test(remainingContent)) {
                // If the entire content looks like LaTeX, render it as inline math
                try {
                    parts.push(
                        <InlineMath key={key++} math={remainingContent} />
                    );
                    break;
                } catch {
                    // If it fails, treat as plain text
                    parts.push(<span key={key++}>{remainingContent}</span>);
                    break;
                }
            }

            // Find next LaTeX delimiter
            const nextDollar = remainingContent.indexOf('$');
            const nextParen = remainingContent.indexOf('\\(');
            const nextBracket = remainingContent.indexOf('\\[');
            const nextBegin = remainingContent.indexOf('\\begin');

            // Find the closest delimiter
            const delimiters = [nextDollar, nextParen, nextBracket, nextBegin]
                .filter(pos => pos !== -1);

            if (delimiters.length === 0) {
                // No more LaTeX, check if remaining content has math notation
                if (/[\^_]\{[^}]+\}/.test(remainingContent) || /\\[a-zA-Z]+/.test(remainingContent)) {
                    // Try to render as LaTeX
                    try {
                        parts.push(
                            <InlineMath key={key++} math={remainingContent} />
                        );
                    } catch {
                        parts.push(<span key={key++}>{remainingContent}</span>);
                    }
                } else {
                    parts.push(<span key={key++}>{remainingContent}</span>);
                }
                break;
            } else {
                const nextPos = Math.min(...delimiters);
                // Add text before the next LaTeX
                if (nextPos > 0) {
                    parts.push(<span key={key++}>{remainingContent.slice(0, nextPos)}</span>);
                }
                remainingContent = remainingContent.slice(nextPos);
            }
        }

        return <span className={className}>{parts}</span>;
    } catch (error) {
        console.error('Error rendering LaTeX:', error);
        // Fallback to plain text if LaTeX parsing fails
        return <span className={className}>{content}</span>;
    }
};

export default LatexRenderer;
