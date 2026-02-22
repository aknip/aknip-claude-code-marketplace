export interface ProgressBarProps {
    completed: number;
    total: number;
    width?: number;
    label?: string;
    showCount?: boolean;
}
/**
 * Progress bar component
 */
export declare function ProgressBar({ completed, total, width, label, showCount, }: ProgressBarProps): import("react/jsx-runtime").JSX.Element;
/**
 * Compact inline progress bar
 */
export declare function InlineProgressBar({ completed, total, width, }: Omit<ProgressBarProps, 'label' | 'showCount'>): import("react/jsx-runtime").JSX.Element;
export default ProgressBar;
//# sourceMappingURL=ProgressBar.d.ts.map