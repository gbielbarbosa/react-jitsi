import React, { useCallback } from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';
import { ScreenShareIcon, StopShareIcon } from '../icons';
import type { ScreenShareOptions } from '../types';

export interface ScreenShareButtonProps {
  className?: string;
  style?: React.CSSProperties;
  /** Max frame rate for screen share */
  frameRate?: number;
  asChild?: boolean;
  children?: React.ReactElement | ((isSharing: boolean, toggle: () => Promise<void>) => React.ReactNode);
}

export function ScreenShareButton({ className, style, frameRate, asChild, children }: ScreenShareButtonProps) {
  const { isScreenSharing, startScreenShare, stopScreenShare } = useJitsiContext();

  const toggle = useCallback(async () => {
    if (isScreenSharing) { await stopScreenShare(); }
    else {
      const opts: ScreenShareOptions = {};
      if (frameRate) opts.frameRate = frameRate;
      await startScreenShare(opts);
    }
  }, [isScreenSharing, startScreenShare, stopScreenShare, frameRate]);

  const dataState = isScreenSharing ? 'sharing' : 'idle';
  const label = isScreenSharing ? 'Stop sharing' : 'Share screen';

  if (typeof children === 'function') return <>{children(isScreenSharing, toggle)}</>;

  if (asChild && React.isValidElement(children)) {
    return <Slot onClick={toggle} data-state={dataState} aria-label={label} title={label} className={className} style={style}>{children}</Slot>;
  }

  return (
    <button className={`jr-btn ${isScreenSharing ? 'jr-btn--accent' : 'jr-btn--active'} ${className || ''}`}
      style={style} onClick={toggle} data-state={dataState} title={label} aria-label={label} type="button">
      {isScreenSharing ? <StopShareIcon /> : <ScreenShareIcon />}
    </button>
  );
}
