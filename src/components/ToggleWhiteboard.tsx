import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';
import { WhiteboardIcon } from '../icons';

export interface ToggleWhiteboardProps {
  className?: string;
  style?: React.CSSProperties;
  asChild?: boolean;
  children?: React.ReactElement | ((isActive: boolean, toggle: () => void) => React.ReactNode);
}

export function ToggleWhiteboard({ className, style, asChild, children }: ToggleWhiteboardProps) {
  const { whiteboardActive, toggleWhiteboard } = useJitsiContext();
  const dataState = whiteboardActive ? 'active' : 'off';
  const label = whiteboardActive ? 'Close whiteboard' : 'Open whiteboard';

  if (typeof children === 'function') return <>{children(whiteboardActive, toggleWhiteboard)}</>;
  if (asChild && React.isValidElement(children)) {
    return <Slot onClick={toggleWhiteboard} data-state={dataState} aria-label={label} title={label} className={className} style={style}>{children}</Slot>;
  }
  return (
    <button className={`jr-btn ${whiteboardActive ? 'jr-btn--accent' : 'jr-btn--active'} ${className || ''}`}
      style={style}
      onClick={toggleWhiteboard} data-state={dataState} title={label} aria-label={label} type="button">
      <WhiteboardIcon />
    </button>
  );
}
