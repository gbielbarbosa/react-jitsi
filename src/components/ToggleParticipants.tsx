import React, { useCallback, useState } from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';
import { ParticipantsIcon } from '../icons';

export interface ToggleParticipantsProps {
    className?: string;
    style?: React.CSSProperties;
    asChild?: boolean;
    children?: React.ReactElement | ((isOpen: boolean, toggle: () => void, participantsCount: number) => React.ReactNode);
}

export function ToggleParticipants({ className, style, asChild, children }: ToggleParticipantsProps) {
    const { participants } = useJitsiContext();
    const [isOpen, setIsOpen] = useState(false);
    const toggle = useCallback(() => setIsOpen((v) => !v), []);
    const participantsCount = participants.size;
    const dataState = isOpen ? 'open' : 'closed';
    const label = isOpen ? 'Close participants' : 'Open participants';

    if (typeof children === 'function') return <>{children(isOpen, toggle, participantsCount)}</>;
    if (asChild && React.isValidElement(children)) {
        return <Slot onClick={toggle} data-state={dataState} aria-label={label} title={label} className={className} style={style}>{children}</Slot>;
    }
    return (
        <button className={`rj-btn ${isOpen ? 'rj-btn--accent' : 'rj-btn--active'} ${className || ''}`}
            style={{ position: 'relative', ...style }}
            onClick={toggle} data-state={dataState} title={label} aria-label={label} type="button">
            <ParticipantsIcon />
            {participantsCount > 0 && <span className="rj-badge rj-badge--accent">{participantsCount}</span>}
        </button>
    );
}
