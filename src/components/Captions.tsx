import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import type { CaptionEntry } from '../types';

export interface CaptionsProps {
  className?: string;
  style?: React.CSSProperties;
  /** Max number of visible captions (default: 3) */
  maxVisible?: number;
  children?: (captions: CaptionEntry[], enabled: boolean) => React.ReactNode;
}

const containerStyle: React.CSSProperties = {
  position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
  display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center',
  maxWidth: '80%', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const captionStyle: React.CSSProperties = {
  padding: '6px 16px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.75)',
  backdropFilter: 'blur(4px)', color: '#fff', fontSize: '14px',
  textAlign: 'center', maxWidth: '100%', lineHeight: 1.4,
};
const nameStyle: React.CSSProperties = { fontWeight: 600, marginRight: '6px', color: '#a5b4fc' };

/**
 * Displays live captions/subtitles.
 * Requires Jigasi on the server.
 */
export function Captions({ className, style, maxVisible = 3, children }: CaptionsProps) {
  const { captions, captionsEnabled } = useJitsiContext();

  if (!captionsEnabled) return null;
  if (children) return <>{children(captions, captionsEnabled)}</>;

  const visible = captions.slice(-maxVisible);

  return (
    <div className={className} style={{ ...containerStyle, ...style }}>
      {visible.map((c, i) => (
        <div key={`${c.participantId}-${c.timestamp}-${i}`} style={captionStyle}>
          <span style={nameStyle}>{c.displayName}:</span>
          <span>{c.text}</span>
        </div>
      ))}
    </div>
  );
}
