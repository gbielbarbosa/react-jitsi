import React, { useCallback, useState } from 'react';
import { useJitsiContext } from '../JitsiContext';

export interface ChatInputProps {
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  /** If set, sends private messages to this participant */
  privateTo?: string;
  children?: (text: string, setText: (v: string) => void, send: () => void) => React.ReactNode;
}

const defaultInputStyle: React.CSSProperties = {
  display: 'flex', gap: '8px', width: '100%',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const inputStyle: React.CSSProperties = {
  flex: 1, padding: '8px 12px', borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.06)',
  color: '#fff', fontSize: '13px', outline: 'none',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const btnStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '8px', border: 'none',
  backgroundColor: 'rgba(99,102,241,0.9)', color: '#fff', fontSize: '13px',
  fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};

/**
 * Standalone chat input. Use alongside ChatMessages for custom layouts.
 */
export function ChatInput({ className, style, placeholder = 'Type a message...', privateTo, children }: ChatInputProps) {
  const { sendMessage } = useJitsiContext();
  const [text, setText] = useState('');

  const send = useCallback(() => {
    if (!text.trim()) return;
    sendMessage(text.trim(), privateTo);
    setText('');
  }, [text, sendMessage, privateTo]);

  if (children) return <>{children(text, setText, send)}</>;

  return (
    <div className={className} style={{ ...defaultInputStyle, ...style }}>
      <input style={inputStyle} value={text} onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        placeholder={placeholder} />
      <button style={btnStyle} onClick={send} type="button">Send</button>
    </div>
  );
}
