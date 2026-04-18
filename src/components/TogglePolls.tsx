import React, { useCallback, useState } from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';
import type { Poll } from '../types';

export interface TogglePollsProps {
  className?: string;
  style?: React.CSSProperties;
  asChild?: boolean;
  children?: React.ReactElement | ((isOpen: boolean, toggle: () => void, polls: Poll[]) => React.ReactNode);
}

const buttonBase: React.CSSProperties = {
  position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '48px', height: '48px', borderRadius: '50%', border: 'none',
  cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none',
  backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const badgeStyle: React.CSSProperties = {
  position: 'absolute', top: '-2px', right: '-2px', minWidth: '18px', height: '18px',
  borderRadius: '9px', backgroundColor: '#6366f1', color: '#fff',
  fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center',
  justifyContent: 'center', padding: '0 4px',
};

const PollIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

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
    <button className={className}
      style={{ ...buttonBase, ...(isOpen ? { backgroundColor: 'rgba(99,102,241,0.9)' } : {}), ...style }}
      onClick={toggle} data-state={dataState} title={label} aria-label={label} type="button">
      <PollIcon />
      {activeCount > 0 && <span style={badgeStyle}>{activeCount}</span>}
    </button>
  );
}
