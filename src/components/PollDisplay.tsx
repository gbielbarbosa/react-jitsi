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

const containerStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px',
  backgroundColor: 'rgba(15,15,25,0.95)', borderRadius: '12px',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const questionStyle: React.CSSProperties = { fontSize: '15px', fontWeight: 600, color: '#e0e0e0' };
const optionStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
  borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)',
  backgroundColor: 'rgba(255,255,255,0.04)', cursor: 'pointer',
  transition: 'all 0.15s ease',
};
const barContainer: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' };
const barBg: React.CSSProperties = { height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' };
const barFill: React.CSSProperties = { height: '100%', borderRadius: '2px', backgroundColor: '#6366f1', transition: 'width 0.3s ease' };
const optTextStyle: React.CSSProperties = { fontSize: '13px', color: '#e0e0e0' };
const voteCountStyle: React.CSSProperties = { fontSize: '12px', color: '#9ca3af', minWidth: '30px', textAlign: 'right' };
const closeBtnStyle: React.CSSProperties = {
  padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
  backgroundColor: 'rgba(239,68,68,0.8)', color: '#fff', fontSize: '12px',
  fontWeight: 600, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const statusStyle: React.CSSProperties = { fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' };

function SinglePoll({ poll }: { poll: Poll }) {
  const { votePoll, closePoll, localParticipantId, localRole } = useJitsiContext();
  const totalVotes = poll.options.reduce((sum, o) => sum + o.voters.length, 0);
  const isMod = localRole === 'moderator';
  const isCreator = poll.creatorId === localParticipantId;

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={questionStyle}>{poll.question}</span>
        <span style={statusStyle}>{poll.isOpen ? 'Open' : 'Closed'}</span>
      </div>
      <span style={{ fontSize: '11px', color: '#6b7280' }}>by {poll.creatorName} · {totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
      {poll.options.map((opt, i) => {
        const pct = totalVotes > 0 ? (opt.voters.length / totalVotes) * 100 : 0;
        const voted = localParticipantId ? opt.voters.includes(localParticipantId) : false;
        return (
          <div key={i} style={{ ...optionStyle, ...(voted ? { borderColor: '#6366f1' } : {}) }}
            onClick={() => { if (poll.isOpen) votePoll(poll.id, i); }}>
            <div style={barContainer}>
              <span style={optTextStyle}>{opt.text}</span>
              <div style={barBg}><div style={{ ...barFill, width: `${pct}%` }} /></div>
            </div>
            <span style={voteCountStyle}>{opt.voters.length}</span>
          </div>
        );
      })}
      {poll.isOpen && (isMod || isCreator) && (
        <button style={closeBtnStyle} onClick={() => closePoll(poll.id)} type="button">Close Poll</button>
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
      <div className={className} style={{ ...containerStyle, ...style, textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
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

