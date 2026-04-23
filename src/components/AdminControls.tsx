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
    <div className={`jr-admin-controls ${className || ''}`} style={style}>
      <button className="jr-admin-btn jr-admin-btn--mute" onClick={actions.muteAudio} title="Mute audio" type="button">Mute</button>
      <button className="jr-admin-btn jr-admin-btn--mute" onClick={actions.muteVideo} title="Mute video" type="button">No Video</button>
      <button className="jr-admin-btn jr-admin-btn--promote" onClick={actions.grantModerator} title="Make moderator" type="button">Promote</button>
      <button className="jr-admin-btn jr-admin-btn--kick" onClick={actions.kick} title="Kick participant" type="button">Kick</button>
    </div>
  );
}
