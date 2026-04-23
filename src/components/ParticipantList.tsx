import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import { MicMutedSmallIcon, VideoMutedSmallIcon } from '../icons';
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
  const { participants } = useJitsiContext();

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
    <div className={`jr-participant-list ${className || ''}`} style={style}>
      {participantsList.map((participant) => {
        if (renderParticipant) {
          return <React.Fragment key={participant.id}>{renderParticipant(participant)}</React.Fragment>;
        }

        return (
          <div key={participant.id} className="jr-participant-item">
            <div
              className="jr-avatar jr-avatar--sm"
              style={{ backgroundColor: getAvatarColor(participant.id) }}
            >
              {participant.displayName.charAt(0).toUpperCase()}
            </div>

            <span className="jr-participant-item__name">
              {participant.displayName}
              {participant.isLocal && <span className="jr-participant-item__you">(You)</span>}
            </span>

            <div className="jr-participant-item__icons">
              {participant.audioMuted && (
                <div className="jr-status-icon jr-status-icon--muted">
                  <MicMutedSmallIcon />
                </div>
              )}
              {participant.videoMuted && (
                <div className="jr-status-icon jr-status-icon--muted">
                  <VideoMutedSmallIcon />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
