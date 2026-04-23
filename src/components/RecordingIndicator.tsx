import React from 'react';
import { useJitsiContext } from '../JitsiContext';

export interface RecordingIndicatorProps {
  className?: string;
  style?: React.CSSProperties;
  children?: (isRecording: boolean) => React.ReactNode;
}

/**
 * Visual indicator when recording is active.
 * Renders nothing when not recording.
 */
export function RecordingIndicator({ className, style, children }: RecordingIndicatorProps) {
  const { isRecording } = useJitsiContext();

  if (!isRecording) return null;
  if (children) return <>{children(isRecording)}</>;

  return (
    <div className={`jr-rec-indicator ${className || ''}`} style={style}>
      <div className="jr-rec-indicator__dot" />
      <span>REC</span>
    </div>
  );
}
