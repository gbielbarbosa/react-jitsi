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
    <div className={`jr-chat-input ${className || ''}`} style={style}>
      <input className="jr-input" value={text} onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        placeholder={placeholder} />
      <button className="jr-send-btn" onClick={send} type="button">Send</button>
    </div>
  );
}
