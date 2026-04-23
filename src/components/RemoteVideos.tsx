import React, { useEffect, useRef } from 'react';
import { useJitsiContext } from '../JitsiContext';
import { MicMutedOverlayIcon } from '../icons';
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
    <div className={`jr-remote-grid ${className || ''}`} style={style}>
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
        <div className="jr-remote-tile">
          <video className="jr-remote-tile__video" ref={screenRef} autoPlay playsInline />
          <div className="jr-remote-tile__name">📺 {participant.displayName}'s screen</div>
        </div>
      )}

      {/* Camera tile */}
      <div className="jr-remote-tile">
        <video
          className="jr-remote-tile__video"
          ref={videoRef}
          autoPlay
          playsInline
          style={{ display: hasVideo ? undefined : 'none' }}
        />
        {!hasVideo && (
          <div className="jr-remote-tile__avatar">
            {participant.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <audio ref={audioRef} autoPlay />
        <div className="jr-remote-tile__name">{participant.displayName}</div>
        {participant.audioMuted && (
          <div className="jr-remote-tile__mute-icon">
            <MicMutedOverlayIcon />
          </div>
        )}
      </div>
    </>
  );
}
