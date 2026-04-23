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
    <div className={`jr-chat-panel ${className || ''}`} style={style}>
      <div className="jr-chat-panel__header">Chat ({messages.length})</div>
      <div className="jr-chat-panel__messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`jr-msg ${msg.isLocal ? 'jr-msg--local' : 'jr-msg--remote'}`}>
            {!msg.isLocal && <span className="jr-msg__sender">{msg.displayName}{msg.isPrivate ? ' (private)' : ''}</span>}
            <div className={`jr-msg__bubble ${msg.isLocal ? 'jr-msg__bubble--local' : ''}`}>{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="jr-chat-panel__input-area">
        <input className="jr-input" value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown} placeholder={placeholder} />
        <button className="jr-send-btn" onClick={handleSend} type="button">Send</button>
      </div>
    </div>
  );
}
