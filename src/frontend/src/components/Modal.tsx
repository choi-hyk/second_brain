import { useEffect, type ReactNode } from 'react';

type ModalProps = {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    overlayClassName?: string;
    contentClassName?: string;
    ariaLabelledBy?: string;
};

export function Modal({
    open,
    onClose,
    children,
    overlayClassName,
    contentClassName,
    ariaLabelledBy,
}: ModalProps) {
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-6 ${
                overlayClassName ?? 'bg-black/20 backdrop-blur-sm'
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            onClick={onClose}
        >
            <div
                className={`min-h-[140px] min-w-[380px] w-fit max-w-[calc(100vw-3rem)] ${contentClassName ?? ''}`.trim()}
                onClick={(event) => event.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
