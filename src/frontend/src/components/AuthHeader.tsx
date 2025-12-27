export function AuthHeader() {
    return (
        <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/70 text-slate-500 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300">
                <svg
                    viewBox="0 0 48 48"
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <rect x="10" y="10" width="28" height="28" rx="8" />
                    <path d="M16 24h16" />
                    <path d="M24 16v16" />
                </svg>
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted">
                HippoBox
            </div>
        </div>
    );
}
