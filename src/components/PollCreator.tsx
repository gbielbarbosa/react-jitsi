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
    <div className={`jr-panel ${className || ''}`} style={style}>
      <label className="jr-label">Question</label>
      <input className="jr-input" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question..." />
      <label className="jr-label">Options</label>
      {options.map((opt, i) => (
        <input key={i} className="jr-input" value={opt}
          onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
          placeholder={`Option ${i + 1}`} />
      ))}
      {options.length < maxOptions && (
        <button className="jr-btn-sm jr-btn-sm--ghost" onClick={() => setOptions([...options, ''])} type="button">+ Add option</button>
      )}
      <button className="jr-btn-sm jr-btn-sm--primary" onClick={handleCreate} type="button">Create Poll</button>
    </div>
  );
}
