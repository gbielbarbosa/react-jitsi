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

const btnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
  height: '36px', padding: '0 14px', borderRadius: '8px', border: 'none',
  cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none',
  backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444',
  fontSize: '13px', fontWeight: 600,
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};

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
    <button className={className} style={{ ...btnStyle, ...style }}
      onClick={handleMuteAll} title={label} aria-label={label} type="button">
      {mediaType === 'audio' ? 'Mute All' : 'Disable All Cameras'}
    </button>
  );
}
