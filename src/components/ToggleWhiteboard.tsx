import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';

export interface ToggleWhiteboardProps {
  className?: string;
  style?: React.CSSProperties;
  asChild?: boolean;
  children?: React.ReactElement | ((isActive: boolean, toggle: () => void) => React.ReactNode);
}

const buttonBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '48px', height: '48px', borderRadius: '50%', border: 'none',
  cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};

const WbIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
  </svg>
);

export function ToggleWhiteboard({ className, style, asChild, children }: ToggleWhiteboardProps) {
  const { whiteboardActive, toggleWhiteboard } = useJitsiContext();
  const dataState = whiteboardActive ? 'active' : 'off';
  const label = whiteboardActive ? 'Close whiteboard' : 'Open whiteboard';

  if (typeof children === 'function') return <>{children(whiteboardActive, toggleWhiteboard)}</>;
  if (asChild && React.isValidElement(children)) {
    return <Slot onClick={toggleWhiteboard} data-state={dataState} aria-label={label} title={label} className={className} style={style}>{children}</Slot>;
  }
  return (
    <button className={className}
      style={{ ...buttonBase, backgroundColor: whiteboardActive ? 'rgba(99,102,241,0.9)' : 'rgba(255,255,255,0.15)', color: '#fff', ...style }}
      onClick={toggleWhiteboard} data-state={dataState} title={label} aria-label={label} type="button">
      <WbIcon />
    </button>
  );
}
