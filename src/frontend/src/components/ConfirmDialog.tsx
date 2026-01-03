import type { ReactNode } from 'react';

import { Button } from './Button';
import { Modal } from './Modal';

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onClose: () => void;
    isPending?: boolean;
    children?: ReactNode;
};

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onClose,
    isPending = false,
    children,
}: ConfirmDialogProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            ariaLabelledBy="confirm-dialog-title"
            contentClassName="min-w-[380px]"
        >
            <div className="rounded-3xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-6 text-[color:var(--color-text)] shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
                <div className="space-y-2">
                    <h4 id="confirm-dialog-title" className="font-display text-lg font-semibold">
                        {title}
                    </h4>
                    {description ? <p className="text-sm text-muted">{description}</p> : null}
                </div>
                {children ? <div className="mt-4">{children}</div> : null}
                <div className="mt-6 flex items-center justify-end gap-3">
                    {confirmLabel && cancelLabel ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isPending}
                            >
                                {cancelLabel}
                            </Button>
                            <Button
                                type="button"
                                onClick={onConfirm}
                                disabled={isPending}
                                className="border-transparent bg-slate-900 text-white shadow-none hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                            >
                                {confirmLabel}
                            </Button>
                        </>
                    ) : confirmLabel ? (
                        <Button
                            type="button"
                            onClick={onConfirm ?? onClose}
                            disabled={isPending}
                            className="border-transparent bg-slate-900 text-white shadow-none hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                        >
                            {confirmLabel}
                        </Button>
                    ) : cancelLabel ? (
                        <Button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="border-transparent bg-slate-900 text-white shadow-none hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                        >
                            {cancelLabel}
                        </Button>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
}
