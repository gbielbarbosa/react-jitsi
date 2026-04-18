import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import type { Participant } from '../types';

export interface AdminControlsProps {
  /** The participant to control */
  participantId: string;
  className?: string;
  style?: React.CSSProperties;
  children?: (
    participant: Participant | undefined,
    actions: {
      kick: () => void;
      muteAudio: () => void;
      muteVideo: () => void;
      grantModerator: () => void;
    }
  ) => React.ReactNode;
}

const containerStyle: React.CSSProperties = {
  display: 'flex', gap: '6px', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const btnStyle: React.CSSProperties = {
  padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
  fontSize: '11px', fontWeight: 500, transition: 'all 0.15s ease',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const muteBtnStyle: React.CSSProperties = { ...btnStyle, backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' };
const kickBtnStyle: React.CSSProperties = { ...btnStyle, backgroundColor: 'rgba(239,68,68,0.8)', color: '#fff' };
const promoteBtnStyle: React.CSSProperties = { ...btnStyle, backgroundColor: 'rgba(99,102,241,0.15)', color: '#a5b4fc' };

/**
 * Admin/moderator controls for a specific participant.
 * Only visible when the local user is a moderator.
 */
export function AdminControls({ participantId, className, style, children }: AdminControlsProps) {
  const { participants, localRole, kickParticipant, muteParticipant, grantModerator } = useJitsiContext();

  if (localRole !== 'moderator') return null;

  const participant = participants.get(participantId);
  const actions = {
    kick: () => kickParticipant(participantId),
    muteAudio: () => muteParticipant(participantId, 'audio'),
    muteVideo: () => muteParticipant(participantId, 'video'),
    grantModerator: () => grantModerator(participantId),
  };

  if (children) return <>{children(participant, actions)}</>;

  return (
    <div className={className} style={{ ...containerStyle, ...style }}>
      <button style={muteBtnStyle} onClick={actions.muteAudio} title="Mute audio" type="button">Mute</button>
      <button style={muteBtnStyle} onClick={actions.muteVideo} title="Mute video" type="button">No Video</button>
      <button style={promoteBtnStyle} onClick={actions.grantModerator} title="Make moderator" type="button">Promote</button>
      <button style={kickBtnStyle} onClick={actions.kick} title="Kick participant" type="button">Kick</button>
    </div>
  );
}
