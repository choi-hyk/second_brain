import type { ReactNode } from 'react';

type ContainerProps = {
    children: ReactNode;
    className?: string;
};

export function Container({ children, className }: ContainerProps) {
    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,_rgba(245,158,11,0.24),_transparent_70%)] blur-3xl" />
                <div className="absolute -bottom-32 -left-20 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_30%_30%,_rgba(59,130,246,0.18),_transparent_70%)] blur-3xl" />
                <div className="absolute top-20 -right-10 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle_at_30%_30%,_rgba(16,185,129,0.16),_transparent_70%)] blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,_rgba(148,163,184,0.12)_1px,_transparent_1px),linear-gradient(to_bottom,_rgba(148,163,184,0.12)_1px,_transparent_1px)] bg-[size:72px_72px] opacity-40" />
            </div>
            <main className={`container-page relative z-10 ${className ?? ''}`.trim()}>
                {children}
            </main>
        </div>
    );
}
