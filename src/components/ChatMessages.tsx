import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import type { ChatMessage } from '../types';

export interface ChatMessagesProps {
  className?: string;
  style?: React.CSSProperties;
  renderMessage?: (message: ChatMessage) => React.ReactNode;
  children?: (messages: ChatMessage[]) => React.ReactNode;
}

const containerStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const msgRow: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '2px' };
const nameStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 500, color: '#9ca3af' };
const bubbleStyle: React.CSSProperties = {
  padding: '6px 10px', borderRadius: '8px', fontSize: '13px',
  backgroundColor: 'rgba(255,255,255,0.08)', color: '#e0e0e0', lineHeight: 1.4,
};
const localBubble: React.CSSProperties = { ...bubbleStyle, backgroundColor: 'rgba(99,102,241,0.6)' };

/**
 * Standalone chat messages list. Use alongside ChatInput for custom layouts.
 */
export function ChatMessages({ className, style, renderMessage, children }: ChatMessagesProps) {
  const { messages } = useJitsiContext();

  if (children) return <>{children(messages)}</>;

  return (
    <div className={className} style={{ ...containerStyle, ...style }}>
      {messages.map((msg) => {
        if (renderMessage) return <React.Fragment key={msg.id}>{renderMessage(msg)}</React.Fragment>;
        return (
          <div key={msg.id} style={msgRow}>
            <span style={nameStyle}>{msg.displayName}{msg.isPrivate ? ' (private)' : ''}</span>
            <div style={msg.isLocal ? localBubble : bubbleStyle}>{msg.text}</div>
          </div>
        );
      })}
    </div>
  );
}
