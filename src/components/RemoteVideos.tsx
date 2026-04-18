import React, { useEffect, useRef } from 'react';
import { useJitsiContext } from '../JitsiContext';
import type { JitsiRemoteTrack, Participant } from '../types';

export interface RemoteVideosProps {
  /** CSS class name for the container */
  className?: string;
  /** Inline styles for the container */
  style?: React.CSSProperties;
  /**
   * Custom render function for each participant.
   * If not provided, a default tile is rendered.
   */
  renderParticipant?: (
    participant: Participant,
    videoRef: React.RefObject<HTMLVideoElement | null>,
    audioRef: React.RefObject<HTMLAudioElement | null>,
    tracks: JitsiRemoteTrack[]
  ) => React.ReactNode;
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '12px',
  width: '100%',
};

/**
 * Renders all remote participants' video and audio tracks.
 *
 * @example
 * ```tsx
 * // Default rendering
 * <RemoteVideos />
 *
 * // Custom rendering
 * <RemoteVideos
 *   renderParticipant={(participant, videoRef, audioRef) => (
 *     <div className="my-tile">
 *       <video ref={videoRef} autoPlay playsInline />
 *       <audio ref={audioRef} autoPlay />
 *       <span>{participant.displayName}</span>
 *     </div>
 *   )}
 * />
 * ```
 */
export function RemoteVideos({
  className,
  style,
  renderParticipant,
}: RemoteVideosProps) {
  const { remoteTracks, participants } = useJitsiContext();

  const remoteParticipants = Array.from(participants.values()).filter((p) => !p.isLocal);

  if (remoteParticipants.length === 0) {
    return null;
  }

  return (
    <div className={className} style={{ ...gridStyle, ...style }}>
      {remoteParticipants.map((participant) => {
        const tracks = remoteTracks.get(participant.id) || [];

        return (
          <RemoteParticipantTile
            key={participant.id}
            participant={participant}
            tracks={tracks}
            renderParticipant={renderParticipant}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal: single participant tile
// ---------------------------------------------------------------------------

interface RemoteParticipantTileProps {
  participant: Participant;
  tracks: JitsiRemoteTrack[];
  renderParticipant?: RemoteVideosProps['renderParticipant'];
}

const tileStyle: React.CSSProperties = {
  position: 'relative',
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: '#1a1a2e',
  aspectRatio: '16 / 9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const videoStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const nameTagStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '8px',
  left: '8px',
  padding: '4px 10px',
  borderRadius: '6px',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(4px)',
  color: '#ffffff',
  fontSize: '12px',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  fontWeight: 500,
  maxWidth: 'calc(100% - 16px)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const muteIconStyle: React.CSSProperties = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  padding: '4px',
  borderRadius: '50%',
  backgroundColor: 'rgba(239, 68, 68, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
};

const remoteAvatarStyle: React.CSSProperties = {
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  backgroundColor: '#8b5cf6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px',
  fontWeight: 600,
  color: '#ffffff',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};

function RemoteParticipantTile({
  participant,
  tracks,
  renderParticipant,
}: RemoteParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const screenRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Separate camera from screen share tracks
  const cameraTrack = tracks.find((t) => t.getType() === 'video' && t.getVideoType?.() !== 'desktop');
  const screenTrack = tracks.find((t) => t.getType() === 'video' && t.getVideoType?.() === 'desktop');
  const audioTrack = tracks.find((t) => t.getType() === 'audio');

  // Attach camera track
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !cameraTrack) return;
    cameraTrack.attach(el);
    return () => { cameraTrack.detach(el); };
  }, [cameraTrack]);

  // Attach screen share track
  useEffect(() => {
    const el = screenRef.current;
    if (!el || !screenTrack) return;
    screenTrack.attach(el);
    return () => { screenTrack.detach(el); };
  }, [screenTrack]);

  // Attach audio track
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioTrack) return;
    audioTrack.attach(el);
    return () => { audioTrack.detach(el); };
  }, [audioTrack]);

  // Custom render
  if (renderParticipant) {
    return <>{renderParticipant(participant, videoRef, audioRef, tracks)}</>;
  }

  const hasVideo = cameraTrack && !participant.videoMuted;

  return (
    <>
      {/* Screen share tile (shown above camera tile when participant shares) */}
      {screenTrack && (
        <div style={{ ...tileStyle, aspectRatio: '16 / 9' }}>
          <video ref={screenRef} autoPlay playsInline style={videoStyle} />
          <div style={nameTagStyle}>📺 {participant.displayName}'s screen</div>
        </div>
      )}

      {/* Camera tile */}
      <div style={tileStyle}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ ...videoStyle, display: hasVideo ? undefined : 'none' }}
        />
        {!hasVideo && (
          <div style={remoteAvatarStyle}>
            {participant.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <audio ref={audioRef} autoPlay />
        <div style={nameTagStyle}>{participant.displayName}</div>
        {participant.audioMuted && (
          <div style={muteIconStyle}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.12 1.5-.34 2.18" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
        )}
      </div>
    </>
  );
}

