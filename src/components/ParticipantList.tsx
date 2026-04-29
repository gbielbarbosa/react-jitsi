import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import { MicMutedSmallIcon, VideoMutedSmallIcon } from '../icons';
import { AdminControls } from './AdminControls';
import { ConnectionIndicator } from './ConnectionIndicator';
import type { Participant } from '../types';

export interface ParticipantListProps {
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Whether to include the local participant in the list (default: true) */
  includeLocal?: boolean;
  /**
   * Custom render function for each participant.
   */
  renderParticipant?: (participant: Participant) => React.ReactNode;
  /**
   * Custom render for the entire list.
   */
  children?: (participants: Participant[]) => React.ReactNode;
}

const AVATAR_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Displays a list of all participants in the conference.
 *
 * @example
 * ```tsx
 * // Default list
 * <ParticipantList />
 *
 * // Custom participant rendering
 * <ParticipantList
 *   renderParticipant={(p) => (
 *     <div key={p.id}>{p.displayName} {p.audioMuted && '🔇'}</div>
 *   )}
 * />
 *
 * // Full custom render
 * <ParticipantList>
 *   {(participants) => (
 *     <ul>{participants.map(p => <li key={p.id}>{p.displayName}</li>)}</ul>
 *   )}
 * </ParticipantList>
 * ```
 */
export function ParticipantList({
  className,
  style,
  includeLocal = true,
  renderParticipant,
  children,
}: ParticipantListProps) {
  const { conference, participants } = useJitsiContext();

  const participantsList = Array.from(participants.values()).filter(
    (p) => includeLocal || !p.isLocal
  );

  // Sort: local user first, then alphabetical
  participantsList.sort((a, b) => {
    if (a.isLocal && !b.isLocal) return -1;
    if (!a.isLocal && b.isLocal) return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  if (children) {
    return <>{children(participantsList)}</>;
  }

  return (
    <div className={`rj-participant-list ${className || ''}`} style={style}>
      <p style={{ marginBottom: 5 }}>{conference?.getBreakoutRooms()?.isBreakoutRoom() ? conference.room?.subject : conference?.getName()} ({participants.size})</p>
      {participantsList.map((participant) => {
        if (renderParticipant) {
          return <React.Fragment key={participant.id}>{renderParticipant(participant)}</React.Fragment>;
        }

        return (
          <div key={participant.id} className="rj-participant-item" style={{ flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <div
                className="rj-avatar rj-avatar--sm"
                style={{ backgroundColor: getAvatarColor(participant.id) }}
              >
                {participant.displayName.charAt(0).toUpperCase()}
              </div>

              <span className="rj-participant-item__name">
                {participant.displayName}
                {participant.role === "moderator" && <span className="rj-participant-item__you">(Admin)</span>}
                {participant.isLocal && <span className="rj-participant-item__you">(You)</span>}
              </span>

              <div className="rj-participant-item__icons">
                {participant.audioMuted && (
                  <div className="rj-status-icon rj-status-icon--muted">
                    <MicMutedSmallIcon />
                  </div>
                )}
                {participant.videoMuted && (
                  <div className="rj-status-icon rj-status-icon--muted" style={{ marginRight: '4px' }}>
                    <VideoMutedSmallIcon />
                  </div>
                )}
                <ConnectionIndicator participant={participant} />
              </div>
            </div>

            {/* Admin controls for moderators - full width below name */}
            <AdminControls participantId={participant.id} style={{ width: '100%', marginTop: '4px' }} />
          </div>
        );
      })}
    </div>
  );
}
