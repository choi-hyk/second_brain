import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    id: string;
    hint?: string;
};

export function Input({ label, id, hint, className, ...props }: InputProps) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={id}
                className="text-xs font-semibold uppercase tracking-[0.25em] text-muted"
            >
                {label}
            </label>
            <input id={id} className={`input-field ${className ?? ''}`.trim()} {...props} />
            {hint ? <p className="text-xs text-muted">{hint}</p> : null}
        </div>
    );
}
