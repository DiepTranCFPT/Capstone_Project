import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
    content: string;
    className?: string;
}

/**
 * Component to render text containing LaTeX formulas
 * Supports both inline ($...$) and block ($$...$$) LaTeX
 */
const LatexRenderer: React.FC<LatexRendererProps> = ({ content, className = '' }) => {
    if (!content) return null;

    // Check if content contains LaTeX patterns
    const hasLatex = /\$[^$]+\$|\\\(.*?\\\)|\\\[.*?\\\]/.test(content);

    if (!hasLatex) {
        return <span className={className}>{content}</span>;
    }

    try {
        // Split content by LaTeX patterns
        // Match: $$...$$ (block), $...$ (inline), or plain text
        const parts: React.ReactNode[] = [];
        let remainingContent = content;
        let key = 0;

        // Process block math first ($$...$$)
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

            // Find next LaTeX delimiter
            const nextDollar = remainingContent.indexOf('$');
            if (nextDollar === -1) {
                // No more LaTeX, add remaining as plain text
                parts.push(<span key={key++}>{remainingContent}</span>);
                break;
            } else {
                // Add text before the next LaTeX
                if (nextDollar > 0) {
                    parts.push(<span key={key++}>{remainingContent.slice(0, nextDollar)}</span>);
                }
                remainingContent = remainingContent.slice(nextDollar);
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
