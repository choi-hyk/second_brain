import {
    cloneElement,
    isValidElement,
    useEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
    type SyntheticEvent,
} from 'react';

type DropdownSide = 'bottom' | 'right' | 'left';
type DropdownAlign = 'start' | 'end';

type DropdownRenderApi = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
};

type DropdownProps = {
    trigger: ReactNode | ((api: DropdownRenderApi) => ReactNode);
    children: ReactNode | ((api: { close: () => void }) => ReactNode);
    side?: DropdownSide;
    align?: DropdownAlign;
    className?: string;
    menuClassName?: string;
    positionClassName?: string;
    menuStyle?: CSSProperties;
    offset?: number;
    offsetX?: number;
    offsetY?: number;
    closeOnSelect?: boolean;
};

const mergeHandlers =
    <T extends SyntheticEvent>(first?: (event: T) => void, second?: (event: T) => void) =>
    (event: T) => {
        first?.(event);
        if (!event.defaultPrevented) {
            second?.(event);
        }
    };

export function Dropdown({
    trigger,
    children,
    side = 'bottom',
    align = 'end',
    className,
    menuClassName,
    positionClassName,
    menuStyle,
    offset,
    offsetX,
    offsetY,
    closeOnSelect = false,
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const api = useMemo<DropdownRenderApi>(
        () => ({
            isOpen,
            open: () => setIsOpen(true),
            close: () => setIsOpen(false),
            toggle: () => setIsOpen((prev) => !prev),
        }),
        [isOpen],
    );

    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (menuRef.current && target && !menuRef.current.contains(target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const sideClass =
        side === 'right' ? 'left-full top-0' : side === 'left' ? 'right-full top-0' : 'top-full';
    const alignClass =
        side === 'bottom'
            ? align === 'start'
                ? 'left-0'
                : 'right-0'
            : align === 'start'
              ? 'top-0'
              : 'bottom-0';

    const triggerNode =
        typeof trigger === 'function'
            ? trigger(api)
            : isValidElement(trigger)
              ? cloneElement(trigger, {
                    onClick: mergeHandlers(
                        (trigger.props as { onClick?: (event: SyntheticEvent) => void }).onClick,
                        () => api.toggle(),
                    ),
                    'aria-haspopup': 'menu',
                    'aria-expanded': isOpen,
                })
              : trigger;

    const menuContent = typeof children === 'function' ? children({ close: api.close }) : children;
    const baseMenuClassName =
        'rounded-2xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)]/85 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur';
    const baseOffset = offset ?? 12;
    const resolvedOffsetX = offsetX ?? baseOffset;
    const resolvedOffsetY = offsetY ?? baseOffset;
    const offsetStyle =
        side === 'right'
            ? { marginLeft: resolvedOffsetX }
            : side === 'left'
              ? { marginRight: resolvedOffsetX }
              : { marginTop: resolvedOffsetY };
    const mergedMenuStyle = { ...offsetStyle, ...menuStyle };

    return (
        <div className={`relative ${className ?? ''}`.trim()} ref={menuRef}>
            {triggerNode}
            {isOpen ? (
                <div
                    className={`dropdown-menu absolute z-30 ${sideClass} ${alignClass} ${positionClassName ?? ''} ${baseMenuClassName} ${menuClassName ?? ''}`.trim()}
                    role="menu"
                    onClick={closeOnSelect ? () => api.close() : undefined}
                    style={mergedMenuStyle}
                >
                    {menuContent}
                </div>
            ) : null}
        </div>
    );
}
