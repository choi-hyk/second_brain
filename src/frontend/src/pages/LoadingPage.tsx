import { Container } from '../components/Container';

type LoadingPageProps = {
    variant?: 'page' | 'content';
    className?: string;
};

export function LoadingPage({ variant = 'page', className }: LoadingPageProps) {
    const loader = (
        <div
            className={`flex flex-col items-center gap-4 ${className ?? ''}`.trim()}
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100" />
            <span className="text-sm text-muted">Loading</span>
        </div>
    );

    if (variant === 'content') {
        return <div className="fixed inset-0 z-10 flex items-center justify-center">{loader}</div>;
    }

    return <Container>{loader}</Container>;
}
