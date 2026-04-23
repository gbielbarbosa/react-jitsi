import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import type { ChatMessage } from '../types';

export interface ChatMessagesProps {
  className?: string;
  style?: React.CSSProperties;
  renderMessage?: (message: ChatMessage) => React.ReactNode;
  children?: (messages: ChatMessage[]) => React.ReactNode;
}

/**
 * Standalone chat messages list. Use alongside ChatInput for custom layouts.
 */
export function ChatMessages({ className, style, renderMessage, children }: ChatMessagesProps) {
  const { messages } = useJitsiContext();

  if (children) return <>{children(messages)}</>;

  return (
    <div className={`jr-msg-list ${className || ''}`} style={style}>
      {messages.map((msg) => {
        if (renderMessage) return <React.Fragment key={msg.id}>{renderMessage(msg)}</React.Fragment>;
        return (
          <div key={msg.id} className={`jr-msg ${msg.isLocal ? 'jr-msg--local' : 'jr-msg--remote'}`}>
            <span className="jr-msg__sender">{msg.displayName}{msg.isPrivate ? ' (private)' : ''}</span>
            <div className={`jr-msg__bubble ${msg.isLocal ? 'jr-msg__bubble--local' : ''}`}>{msg.text}</div>
          </div>
        );
      })}
    </div>
  );
}
