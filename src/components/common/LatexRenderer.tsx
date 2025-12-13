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
            // Find all possible delimiters and their positions
            const blockDollarPos = remainingContent.indexOf('$$');
            const inlineDollarPos = remainingContent.search(/\$(?!\$)/); // $ not followed by $
            const parenPos = remainingContent.indexOf('\\(');
            const bracketPos = remainingContent.indexOf('\\[');
            const beginPos = remainingContent.indexOf('\\begin');

            // Find the closest delimiter
            const positions = [
                { type: 'block-dollar', pos: blockDollarPos },
                { type: 'inline-dollar', pos: inlineDollarPos },
                { type: 'paren', pos: parenPos },
                { type: 'bracket', pos: bracketPos },
                { type: 'begin', pos: beginPos },
            ].filter(p => p.pos !== -1).sort((a, b) => a.pos - b.pos);

            if (positions.length === 0) {
                // No more LaTeX delimiters, check if remaining content has raw LaTeX
                if (LATEX_COMMAND_PATTERN.test(remainingContent) || /[\^_]\{[^}]+\}/.test(remainingContent)) {
                    try {
                        parts.push(<InlineMath key={key++} math={remainingContent} />);
                    } catch {
                        parts.push(<span key={key++}>{remainingContent}</span>);
                    }
                } else {
                    parts.push(<span key={key++}>{remainingContent}</span>);
                }
                break;
            }

            const closest = positions[0];

            // Add text before the delimiter as plain text
            if (closest.pos > 0) {
                parts.push(<span key={key++}>{remainingContent.slice(0, closest.pos)}</span>);
                remainingContent = remainingContent.slice(closest.pos);
            }

            // Process based on delimiter type
            if (closest.type === 'block-dollar') {
                const match = remainingContent.match(/^\$\$([^$]+)\$\$/);
                if (match) {
                    parts.push(<BlockMath key={key++} math={match[1].trim()} />);
                    remainingContent = remainingContent.slice(match[0].length);
                } else {
                    // Invalid block math, treat $$ as text
                    parts.push(<span key={key++}>$$</span>);
                    remainingContent = remainingContent.slice(2);
                }
            } else if (closest.type === 'inline-dollar') {
                const match = remainingContent.match(/^\$([^$]+)\$/);
                if (match) {
                    parts.push(<InlineMath key={key++} math={match[1].trim()} />);
                    remainingContent = remainingContent.slice(match[0].length);
                } else {
                    // Unclosed $, treat as text
                    parts.push(<span key={key++}>$</span>);
                    remainingContent = remainingContent.slice(1);
                }
            } else if (closest.type === 'paren') {
                const match = remainingContent.match(/^\\\((.*?)\\\)/);
                if (match) {
                    parts.push(<InlineMath key={key++} math={match[1].trim()} />);
                    remainingContent = remainingContent.slice(match[0].length);
                } else {
                    parts.push(<span key={key++}>{'\\('}</span>);
                    remainingContent = remainingContent.slice(2);
                }
            } else if (closest.type === 'bracket') {
                const match = remainingContent.match(/^\\\[(.*?)\\\]/s);
                if (match) {
                    parts.push(<BlockMath key={key++} math={match[1].trim()} />);
                    remainingContent = remainingContent.slice(match[0].length);
                } else {
                    parts.push(<span key={key++}>{'\\['}</span>);
                    remainingContent = remainingContent.slice(2);
                }
            } else if (closest.type === 'begin') {
                const match = remainingContent.match(/^(\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\})/);
                if (match) {
                    parts.push(<BlockMath key={key++} math={match[1]} />);
                    remainingContent = remainingContent.slice(match[0].length);
                } else {
                    parts.push(<span key={key++}>{'\\begin'}</span>);
                    remainingContent = remainingContent.slice(6);
                }
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
