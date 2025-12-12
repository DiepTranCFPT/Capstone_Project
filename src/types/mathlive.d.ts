/* eslint-disable @typescript-eslint/no-namespace */
import type { MathfieldElement } from 'mathlive';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement> & {
                'virtual-keyboard-mode'?: 'onfocus' | 'manual' | 'off';
                'read-only'?: boolean;
                'smart-mode'?: boolean;
                ref?: React.Ref<MathfieldElement>;
                className?: string;
                style?: React.CSSProperties;
            };
        }
    }
}

export { };
