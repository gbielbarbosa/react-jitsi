import React, { useCallback, useState } from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';
import { PollIcon } from '../icons';
import type { Poll } from '../types';

export interface TogglePollsProps {
  className?: string;
  style?: React.CSSProperties;
  asChild?: boolean;
  children?: React.ReactElement | ((isOpen: boolean, toggle: () => void, polls: Poll[]) => React.ReactNode);
}

export function TogglePolls({ className, style, asChild, children }: TogglePollsProps) {
  const { polls } = useJitsiContext();
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const activeCount = polls.filter((p) => p.isOpen).length;
  const dataState = isOpen ? 'open' : 'closed';
  const label = isOpen ? 'Close polls' : 'Open polls';

  if (typeof children === 'function') return <>{children(isOpen, toggle, polls)}</>;
  if (asChild && React.isValidElement(children)) {
    return <Slot onClick={toggle} data-state={dataState} aria-label={label} title={label} className={className} style={style}>{children}</Slot>;
  }
  return (
    <button className={`rj-btn ${isOpen ? 'rj-btn--accent' : 'rj-btn--active'} ${className || ''}`}
      style={{ position: 'relative', ...style }}
      onClick={toggle} data-state={dataState} title={label} aria-label={label} type="button">
      <PollIcon />
      {activeCount > 0 && <span className="rj-badge rj-badge--accent">{activeCount}</span>}
    </button>
  );
}
