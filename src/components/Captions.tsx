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
    <div className={`rj-captions ${className || ''}`} style={style}>
      {visible.map((c, i) => (
        <div key={`${c.participantId}-${c.timestamp}-${i}`} className="rj-caption">
          <span className="rj-caption__name">{c.displayName}:</span>
          <span>{c.text}</span>
        </div>
      ))}
    </div>
  );
}
