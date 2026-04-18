import React, { useEffect, useRef } from 'react';
import { useJitsiContext } from '../JitsiContext';

export interface LocalVideoProps {
  className?: string;
  style?: React.CSSProperties;
  /** Override the mirrored state from context (default: uses context isMirrored) */
  mirror?: boolean;
  muted?: boolean;
  showPlaceholder?: boolean;
}

const defaultStyle: React.CSSProperties = {
  width: '100%', height: '100%', objectFit: 'cover',
  borderRadius: '12px', backgroundColor: '#1a1a2e',
};
const placeholderStyle: React.CSSProperties = {
  position: 'absolute', inset: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: '12px',
  backgroundColor: '#1a1a2e', color: '#e0e0e0', fontSize: '14px',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const avatarStyle: React.CSSProperties = {
  width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#6366f1',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '24px', fontWeight: 600, color: '#fff',
};

/**
 * Renders the local video track.
 * Mirror state is controlled by context (via ToggleMirror) unless overridden with `mirror` prop.
 *
 * The `<video>` element is always rendered (never unmounted) to keep the track attached.
 * When the video is muted, it's hidden and a placeholder avatar is shown on top.
 */
export function LocalVideo({ className, style, mirror, muted = true, showPlaceholder = true }: LocalVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { localTracks, videoMuted, participants, localParticipantId, isMirrored } = useJitsiContext();

  // Use prop if explicitly provided, otherwise use context
  const shouldMirror = mirror !== undefined ? mirror : isMirrored;

  const videoTrack = localTracks.find(
    (t) => t.getType() === 'video' && t.getVideoType?.() !== 'desktop'
  );

  // Attach track to video element — the <video> is never unmounted so this runs once
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoTrack) return;
    videoTrack.attach(el);
    return () => { videoTrack.detach(el); };
  }, [videoTrack]);

  const isHidden = videoMuted || !videoTrack;

  const videoStyle: React.CSSProperties = {
    ...defaultStyle,
    transform: shouldMirror ? 'scaleX(-1)' : undefined,
    // Hide but keep mounted when muted
    display: isHidden ? 'none' : undefined,
    ...style,
  };

  const localName = localParticipantId ? participants.get(localParticipantId)?.displayName || 'Me' : 'Me';

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Always-mounted video element — track stays attached across mute/unmute */}
      <video ref={videoRef} autoPlay playsInline muted={muted} style={videoStyle} />

      {/* Placeholder shown on top when video is muted */}
      {isHidden && showPlaceholder && (
        <div style={{ ...placeholderStyle, ...style }}>
          <div style={avatarStyle}>{localName.charAt(0).toUpperCase()}</div>
        </div>
      )}
    </div>
  );
}
