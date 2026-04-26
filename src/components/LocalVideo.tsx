import React, { useEffect, useRef } from 'react';
import { useJitsiContext } from '../JitsiContext';
import { ConnectionIndicator } from './ConnectionIndicator';

export interface LocalVideoProps {
  className?: string;
  style?: React.CSSProperties;
  /** Override the mirrored state from context (default: uses context isMirrored) */
  mirror?: boolean;
  muted?: boolean;
  showPlaceholder?: boolean;
}

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
    transform: shouldMirror ? 'scaleX(-1)' : undefined,
    // Hide but keep mounted when muted
    display: isHidden ? 'none' : undefined,
  };

  const localParticipant = localParticipantId ? participants.get(localParticipantId) : null;
  const localName = localParticipant?.displayName || 'Me';

  return (
    <div className={`rj-local-video ${className || ''}`} style={style}>
      {/* Always-mounted video element — track stays attached across mute/unmute */}
      <video className="rj-local-video__video" ref={videoRef} autoPlay playsInline muted={muted} style={videoStyle} />

      {/* Placeholder shown on top when video is muted */}
      {isHidden && showPlaceholder && (
        <div className="rj-local-video__placeholder">
          <div className="rj-avatar">{localName.charAt(0).toUpperCase()}</div>
        </div>
      )}

      {/* Connection Indicator Overlay */}
      {localParticipant && (
        <div style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 10, padding: '4px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '4px' }}>
          <ConnectionIndicator participant={localParticipant} />
        </div>
      )}
    </div>
  );
}
