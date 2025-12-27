import type { ReactNode } from 'react';

type CardProps = {
    children: ReactNode;
    className?: string;
    variant?: 'soft' | 'strong';
};

export function Card({ children, className, variant = 'soft' }: CardProps) {
    const variantClass = variant === 'strong' ? 'card-surface card-strong' : 'card-surface';
    return <section className={`${variantClass} ${className ?? ''}`.trim()}>{children}</section>;
}
