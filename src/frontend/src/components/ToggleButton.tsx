import type { ButtonHTMLAttributes } from 'react';

type ToggleButtonSize = 'sm' | 'md';

type ToggleButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
    checked: boolean;
    onChange: (checked: boolean) => void;
    size?: ToggleButtonSize;
    stopPropagation?: boolean;
};

const sizeStyles = {
    sm: {
        track: 'h-5 w-9',
        knob: 'h-4 w-4',
        translate: 'translate-x-4',
    },
    md: {
        track: 'h-6 w-11',
        knob: 'h-5 w-5',
        translate: 'translate-x-5',
    },
};

export function ToggleButton({
    checked,
    onChange,
    size = 'md',
    className,
    stopPropagation = false,
    ...props
}: ToggleButtonProps) {
    const styles = sizeStyles[size];
    const isDisabled = Boolean(props.disabled);
    const trackClass = checked ? 'bg-[color:var(--color-text)]' : 'bg-[color:var(--color-surface)]';
    const disabledTrackClass =
        'bg-slate-200 border-slate-300/70 dark:bg-slate-700 dark:border-slate-600/70';
    const knobClass = isDisabled
        ? checked
            ? 'bg-slate-300 dark:bg-slate-200'
            : 'bg-slate-400 dark:bg-slate-200'
        : checked
          ? 'bg-[color:var(--color-primary-contrast)]'
          : 'bg-[color:var(--color-text)]';

    return (
        <button
            type="button"
            aria-pressed={checked}
            className={`relative inline-flex items-center rounded-full border border-[color:var(--color-border-strong)] transition focus:outline-none ${styles.track} ${
                isDisabled ? disabledTrackClass : trackClass
            } ${className ?? ''} disabled:cursor-not-allowed`.trim()}
            onClick={(event) => {
                if (isDisabled) {
                    return;
                }
                if (stopPropagation) {
                    event.stopPropagation();
                }
                onChange(!checked);
            }}
            {...props}
        >
            <span
                className={`inline-block rounded-full shadow-sm transition ${styles.knob} ${knobClass} ${
                    checked ? styles.translate : 'translate-x-1'
                }`}
            />
        </button>
    );
}
