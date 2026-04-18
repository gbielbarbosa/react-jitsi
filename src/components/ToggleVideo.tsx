import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';
import { VideoOnIcon, VideoOffIcon } from '../icons';

export interface ToggleVideoProps {
  className?: string;
  style?: React.CSSProperties;
  asChild?: boolean;
  children?: React.ReactElement | ((muted: boolean, toggle: () => Promise<void>) => React.ReactNode);
}

export function ToggleVideo({ className, style, asChild, children }: ToggleVideoProps) {
  const { videoMuted, toggleVideo } = useJitsiContext();
  const dataState = videoMuted ? 'muted' : 'active';
  const label = videoMuted ? 'Turn on camera' : 'Turn off camera';

  if (typeof children === 'function') return <>{children(videoMuted, toggleVideo)}</>;

  if (asChild && React.isValidElement(children)) {
    return <Slot onClick={toggleVideo} data-state={dataState} aria-label={label} title={label} className={className} style={style}>{children}</Slot>;
  }

  return (
    <button className={`jr-btn ${videoMuted ? 'jr-btn--muted' : 'jr-btn--active'} ${className || ''}`}
      style={style} onClick={toggleVideo} data-state={dataState} title={label} aria-label={label} type="button">
      {videoMuted ? <VideoOffIcon /> : <VideoOnIcon />}
    </button>
  );
}
