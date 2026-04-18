import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';
import { CaptionsIcon } from '../icons';

export interface ToggleCaptionsProps {
  className?: string;
  style?: React.CSSProperties;
  asChild?: boolean;
  children?: React.ReactElement | ((enabled: boolean, toggle: () => void) => React.ReactNode);
}

export function ToggleCaptions({ className, style, asChild, children }: ToggleCaptionsProps) {
  const { captionsEnabled, toggleCaptions } = useJitsiContext();
  const dataState = captionsEnabled ? 'active' : 'off';
  const label = captionsEnabled ? 'Disable captions' : 'Enable captions';

  if (typeof children === 'function') return <>{children(captionsEnabled, toggleCaptions)}</>;
  if (asChild && React.isValidElement(children)) {
    return <Slot onClick={toggleCaptions} data-state={dataState} aria-label={label} title={label} className={className} style={style}>{children}</Slot>;
  }

  return (
    <button className={`rj-btn ${captionsEnabled ? 'rj-btn--accent' : 'rj-btn--active'} ${className || ''}`}
      style={style} onClick={toggleCaptions} data-state={dataState} title={label} aria-label={label} type="button">
      <CaptionsIcon />
    </button>
  );
}
