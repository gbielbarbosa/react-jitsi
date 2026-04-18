import React, { useCallback, useState } from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';
import { ChatIcon } from '../icons';

export interface ToggleChatProps {
  className?: string;
  style?: React.CSSProperties;
  asChild?: boolean;
  children?: React.ReactElement | ((isOpen: boolean, toggle: () => void, unread: number) => React.ReactNode);
}

/**
 * Toggle button for chat panel visibility. Manages open/close state internally.
 */
export function ToggleChat({ className, style, asChild, children }: ToggleChatProps) {
  const { unreadCount } = useJitsiContext();
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const dataState = isOpen ? 'open' : 'closed';
  const label = isOpen ? 'Close chat' : 'Open chat';

  if (typeof children === 'function') return <>{children(isOpen, toggle, unreadCount)}</>;
  if (asChild && React.isValidElement(children)) {
    return <Slot onClick={toggle} data-state={dataState} aria-label={label} title={label} className={className} style={style}>{children}</Slot>;
  }

  return (
    <button className={`rj-btn ${isOpen ? 'rj-btn--accent' : 'rj-btn--active'} ${className || ''}`}
      style={{ position: 'relative', ...style }} onClick={toggle} data-state={dataState} title={label} aria-label={label} type="button">
      <ChatIcon />
      {unreadCount > 0 && !isOpen && <span className="rj-badge rj-badge--danger">{unreadCount > 99 ? '99+' : unreadCount}</span>}
    </button>
  );
}
