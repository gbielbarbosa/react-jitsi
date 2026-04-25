import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';

export interface MuteAllButtonProps {
  className?: string;
  style?: React.CSSProperties;
  /** Media type to mute (default: 'audio') */
  mediaType?: 'audio' | 'video';
  asChild?: boolean;
  children?: React.ReactElement | ((muteAll: () => void) => React.ReactNode);
}

/**
 * Button to mute all participants. Only available for moderators.
 */
export function MuteAllButton({ className, style, mediaType = 'audio', asChild, children }: MuteAllButtonProps) {
  const { localRole, muteAll } = useJitsiContext();

  if (localRole !== 'moderator') return null;

  const handleMuteAll = () => muteAll(mediaType);
  const label = mediaType === 'audio' ? 'Mute all microphones' : 'Turn off all cameras';

  if (typeof children === 'function') return <>{children(handleMuteAll)}</>;
  if (asChild && React.isValidElement(children)) {
    return <Slot onClick={handleMuteAll} aria-label={label} title={label} className={className} style={style}>{children}</Slot>;
  }

  return (
    <button className={`rj-mute-all-btn ${className || ''}`} style={style}
      onClick={handleMuteAll} title={label} aria-label={label} type="button">
      {mediaType === 'audio' ? 'Mute All' : 'Disable All Cameras'}
    </button>
  );
}
