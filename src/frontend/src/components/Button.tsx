import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'outline';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant?: ButtonVariant;
    fullWidth?: boolean;
};

export function Button({
    children,
    variant = 'primary',
    fullWidth = false,
    className,
    ...props
}: ButtonProps) {
    const variantClass = variant === 'outline' ? 'btn-outline' : 'btn-primary';
    const widthClass = fullWidth ? 'w-full' : '';
    return (
        <button
            {...props}
            className={`btn-base ${variantClass} ${widthClass} ${className ?? ''}`.trim()}
        >
            {children}
        </button>
    );
}
