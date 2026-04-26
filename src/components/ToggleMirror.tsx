import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';
import { MirrorIcon } from '../icons';

export interface ToggleMirrorProps {
  className?: string;
  style?: React.CSSProperties;
  asChild?: boolean;
  children?: React.ReactElement | ((isMirrored: boolean, toggle: () => void) => React.ReactNode);
}

/**
 * Toggle local video mirror on/off.
 */
export function ToggleMirror({ className, style, asChild, children }: ToggleMirrorProps) {
  const { isMirrored, toggleMirror } = useJitsiContext();
  const dataState = isMirrored ? 'mirrored' : 'normal';
  const label = isMirrored ? 'Disable mirror' : 'Enable mirror';

  if (typeof children === 'function') return <>{children(isMirrored, toggleMirror)}</>;
  if (asChild && React.isValidElement(children)) {
    return <Slot onClick={toggleMirror} data-state={dataState} aria-label={label} title={label} className={className} style={style}>{children}</Slot>;
  }

  return (
    <div style={{ display: "flex", gap: "5px" }}>
      <input id='rj-toggle-mirror' type="checkbox" style={style} data-state={dataState} title={label} aria-label={label} checked={isMirrored} onChange={(toggleMirror)} />
      <label className='rj-label' htmlFor="rj-toggle-mirror">Mirror my video</label>
    </div>
  );
}
