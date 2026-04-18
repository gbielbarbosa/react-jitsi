import React, { useCallback, useState } from 'react';
import { useJitsiContext } from '../JitsiContext';
import type { Poll } from '../types';

export interface PollCreatorProps {
  className?: string;
  style?: React.CSSProperties;
  /** Min options (default: 2) */
  minOptions?: number;
  /** Max options (default: 10) */
  maxOptions?: number;
  /** Called after poll is created */
  onCreated?: (poll: Poll) => void;
  children?: (create: (question: string, options: string[]) => void) => React.ReactNode;
}

const containerStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px',
  backgroundColor: 'rgba(15,15,25,0.95)', borderRadius: '12px',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const inputStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
  backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '13px',
  outline: 'none', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const labelStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 500, color: '#a0a0b0' };
const btnStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
  fontSize: '13px', fontWeight: 600, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const addBtnStyle: React.CSSProperties = { ...btnStyle, backgroundColor: 'rgba(255,255,255,0.1)', color: '#e0e0e0' };
const createBtnStyle: React.CSSProperties = { ...btnStyle, backgroundColor: 'rgba(99,102,241,0.9)', color: '#fff' };

/**
 * Form to create a new poll/voting.
 */
export function PollCreator({ className, style, minOptions = 2, maxOptions = 10, onCreated, children }: PollCreatorProps) {
  const { createPoll } = useJitsiContext();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const handleCreate = useCallback(() => {
    const validOptions = options.filter((o) => o.trim());
    if (!question.trim() || validOptions.length < minOptions) return;
    createPoll(question.trim(), validOptions);
    onCreated?.({} as Poll);
    setQuestion('');
    setOptions(['', '']);
  }, [question, options, minOptions, createPoll, onCreated]);

  if (children) return <>{children(createPoll)}</>;

  return (
    <div className={className} style={{ ...containerStyle, ...style }}>
      <label style={labelStyle}>Question</label>
      <input style={inputStyle} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question..." />
      <label style={labelStyle}>Options</label>
      {options.map((opt, i) => (
        <input key={i} style={inputStyle} value={opt}
          onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
          placeholder={`Option ${i + 1}`} />
      ))}
      {options.length < maxOptions && (
        <button style={addBtnStyle} onClick={() => setOptions([...options, ''])} type="button">+ Add option</button>
      )}
      <button style={createBtnStyle} onClick={handleCreate} type="button">Create Poll</button>
    </div>
  );
}
