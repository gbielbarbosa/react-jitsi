import React from 'react';
import { useJitsiContext } from '../JitsiContext';

export interface RecordingIndicatorProps {
  className?: string;
  style?: React.CSSProperties;
  children?: (isRecording: boolean) => React.ReactNode;
}

const indicatorStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '4px 10px', borderRadius: '6px',
  backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444',
  fontSize: '12px', fontWeight: 600,
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const dotStyle: React.CSSProperties = {
  width: '8px', height: '8px', borderRadius: '50%',
  backgroundColor: '#ef4444', animation: 'jitsi-rec-pulse 1.5s ease-in-out infinite',
};

/**
 * Visual indicator when recording is active.
 * Renders nothing when not recording.
 */
export function RecordingIndicator({ className, style, children }: RecordingIndicatorProps) {
  const { isRecording } = useJitsiContext();

  if (!isRecording) return null;
  if (children) return <>{children(isRecording)}</>;

  return (
    <>
      <style>{`@keyframes jitsi-rec-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
      <div className={className} style={{ ...indicatorStyle, ...style }}>
        <div style={dotStyle} />
        <span>REC</span>
      </div>
    </>
  );
}
