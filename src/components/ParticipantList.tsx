import React from 'react';
import { useJitsiContext } from '../JitsiContext';
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

const listContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};

const participantItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px 12px',
  borderRadius: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  transition: 'background-color 0.15s ease',
};

const avatarSmallStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '13px',
  fontWeight: 600,
  color: '#ffffff',
  flexShrink: 0,
};

const nameStyle: React.CSSProperties = {
  flex: 1,
  fontSize: '13px',
  fontWeight: 500,
  color: '#e0e0e0',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const youBadgeStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 500,
  color: '#9ca3af',
  marginLeft: '4px',
};

const iconContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  alignItems: 'center',
  flexShrink: 0,
};

const statusIconStyle: React.CSSProperties = {
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.6,
};

const mutedIconStyle: React.CSSProperties = {
  ...statusIconStyle,
  opacity: 1,
  color: '#ef4444',
};

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

const MicMutedSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
  </svg>
);

const VideoMutedSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

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
    <div className={className} style={{ ...listContainerStyle, ...style }}>
      {participantsList.map((participant) => {
        if (renderParticipant) {
          return <React.Fragment key={participant.id}>{renderParticipant(participant)}</React.Fragment>;
        }

        return (
          <div key={participant.id} style={participantItemStyle}>
            <div
              style={{
                ...avatarSmallStyle,
                backgroundColor: getAvatarColor(participant.id),
              }}
            >
              {participant.displayName.charAt(0).toUpperCase()}
            </div>

            <span style={nameStyle}>
              {participant.displayName}
              {participant.isLocal && <span style={youBadgeStyle}>(You)</span>}
            </span>

            <div style={iconContainerStyle}>
              {participant.audioMuted && (
                <div style={mutedIconStyle}>
                  <MicMutedSmall />
                </div>
              )}
              {participant.videoMuted && (
                <div style={mutedIconStyle}>
                  <VideoMutedSmall />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
