import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import type { Poll } from '../types';

export interface PollDisplayProps {
  className?: string;
  style?: React.CSSProperties;
  /** Specific poll to display. If omitted, all polls are shown. */
  poll?: Poll;
  children?: (poll: Poll | null, vote: (pollId: string, idx: number) => void, close: (pollId: string) => void) => React.ReactNode;
}

function SinglePoll({ poll }: { poll: Poll }) {
  const { votePoll, closePoll, localParticipantId, localRole } = useJitsiContext();
  const totalVotes = poll.options.reduce((sum, o) => sum + o.voters.length, 0);
  const isMod = localRole === 'moderator';
  const isCreator = poll.creatorId === localParticipantId;

  return (
    <div className="rj-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="rj-poll__question">{poll.question}</span>
        <span className="rj-poll__status">{poll.isOpen ? 'Open' : 'Closed'}</span>
      </div>
      <span className="rj-poll__meta">by {poll.creatorName} · {totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
      {poll.options.map((opt, i) => {
        const pct = totalVotes > 0 ? (opt.voters.length / totalVotes) * 100 : 0;
        const voted = localParticipantId ? opt.voters.includes(localParticipantId) : false;
        return (
          <div key={i} className={`rj-poll__option ${voted ? 'rj-poll__option--voted' : ''}`}
            onClick={() => { if (poll.isOpen) votePoll(poll.id, i); }}>
            <div className="rj-poll__option-bar-container">
              <span className="rj-poll__option-text">{opt.text}</span>
              <div className="rj-poll__option-bar-bg"><div className="rj-poll__option-bar-fill" style={{ width: `${pct}%` }} /></div>
            </div>
            <span className="rj-poll__vote-count">{opt.voters.length}</span>
          </div>
        );
      })}
      {poll.isOpen && (isMod || isCreator) && (
        <button className="rj-poll__close-btn" onClick={() => closePoll(poll.id)} type="button">Close Poll</button>
      )}
    </div>
  );
}

/**
 * Displays poll(s) with voting options and results.
 * Shows a specific poll if provided via `poll` prop, otherwise shows all polls.
 */
export function PollDisplay({ className, style, poll: pollProp, children }: PollDisplayProps) {
  const { activePoll, polls, votePoll, closePoll } = useJitsiContext();

  if (children) return <>{children(activePoll, votePoll, closePoll)}</>;

  // If a specific poll is given, show just that one
  if (pollProp) {
    return (
      <div className={className} style={style}>
        <SinglePoll poll={pollProp} />
      </div>
    );
  }

  // Otherwise show all polls (open first, then closed)
  const sorted = [...polls].sort((a, b) => {
    if (a.isOpen && !b.isOpen) return -1;
    if (!a.isOpen && b.isOpen) return 1;
    return b.timestamp - a.timestamp;
  });

  if (sorted.length === 0) {
    return (
      <div className={`rj-panel rj-poll__empty ${className || ''}`} style={style}>
        No polls yet. Create one above!
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
      {sorted.map((p) => <SinglePoll key={p.id} poll={p} />)}
    </div>
  );
}
