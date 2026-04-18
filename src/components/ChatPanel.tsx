import React, { useCallback, useRef, useState } from 'react';
import { useJitsiContext } from '../JitsiContext';
import type { ChatMessage } from '../types';

export interface ChatPanelProps {
  className?: string;
  style?: React.CSSProperties;
  /** Placeholder for the input (default: "Type a message...") */
  placeholder?: string;
  children?: (messages: ChatMessage[], send: (text: string) => void, unread: number) => React.ReactNode;
}

const panelStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', height: '100%', minHeight: '300px',
  backgroundColor: 'rgba(15,15,25,0.95)', borderRadius: '12px', overflow: 'hidden',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const headerStyle: React.CSSProperties = {
  padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
  fontSize: '14px', fontWeight: 600, color: '#e0e0e0',
};
const messagesContainerStyle: React.CSSProperties = {
  flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex',
  flexDirection: 'column', gap: '8px',
};
const msgStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '85%',
};
const msgLocalStyle: React.CSSProperties = { ...msgStyle, alignSelf: 'flex-end' };
const msgRemoteStyle: React.CSSProperties = { ...msgStyle, alignSelf: 'flex-start' };
const bubbleLocalStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: '12px 12px 4px 12px',
  backgroundColor: 'rgba(99,102,241,0.8)', color: '#fff', fontSize: '13px', lineHeight: 1.4,
};
const bubbleRemoteStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: '12px 12px 12px 4px',
  backgroundColor: 'rgba(255,255,255,0.1)', color: '#e0e0e0', fontSize: '13px', lineHeight: 1.4,
};
const senderStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 500, color: '#9ca3af' };
const inputContainerStyle: React.CSSProperties = {
  display: 'flex', gap: '8px', padding: '12px 16px',
  borderTop: '1px solid rgba(255,255,255,0.08)',
};
const inputStyle: React.CSSProperties = {
  flex: 1, padding: '8px 12px', borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.06)',
  color: '#fff', fontSize: '13px', outline: 'none',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const sendBtnStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '8px', border: 'none',
  backgroundColor: 'rgba(99,102,241,0.9)', color: '#fff',
  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};

/**
 * Full chat panel with message list and input.
 */
export function ChatPanel({ className, style, placeholder = 'Type a message...', children }: ChatPanelProps) {
  const { messages, sendMessage, unreadCount, markMessagesRead } = useJitsiContext();
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = useCallback(() => {
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [text, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  // Mark as read when panel is visible
  React.useEffect(() => { markMessagesRead(); }, [messages.length, markMessagesRead]);

  if (children) return <>{children(messages, sendMessage, unreadCount)}</>;

  return (
    <div className={className} style={{ ...panelStyle, ...style }}>
      <div style={headerStyle}>Chat ({messages.length})</div>
      <div style={messagesContainerStyle}>
        {messages.map((msg) => (
          <div key={msg.id} style={msg.isLocal ? msgLocalStyle : msgRemoteStyle}>
            {!msg.isLocal && <span style={senderStyle}>{msg.displayName}{msg.isPrivate ? ' (private)' : ''}</span>}
            <div style={msg.isLocal ? bubbleLocalStyle : bubbleRemoteStyle}>{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={inputContainerStyle}>
        <input style={inputStyle} value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown} placeholder={placeholder} />
        <button style={sendBtnStyle} onClick={handleSend} type="button">Send</button>
      </div>
    </div>
  );
}
