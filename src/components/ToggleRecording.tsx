import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';
import { RecordIcon, StopRecordIcon } from '../icons';
import type { RecordingOptions } from '../types';

export interface ToggleRecordingProps {
  className?: string;
  style?: React.CSSProperties;
  /** Recording mode (default: 'file') */
  mode?: 'file' | 'stream';
  /** Additional recording options */
  recordingOptions?: Omit<RecordingOptions, 'mode'>;
  asChild?: boolean;
  children?: React.ReactElement | ((isRecording: boolean, toggle: () => Promise<void>) => React.ReactNode);
}

/**
 * Toggle recording start/stop.
 * Requires moderator privilege and Jibri on the server.
 */
export function ToggleRecording({ className, style, mode = 'file', recordingOptions, asChild, children }: ToggleRecordingProps) {
  const { isRecording, startRecording, stopRecording } = useJitsiContext();
  const dataState = isRecording ? 'recording' : 'idle';
  const label = isRecording ? 'Stop recording' : 'Start recording';

  const toggle = async () => {
    if (isRecording) { await stopRecording(); }
    else { await startRecording({ mode, ...recordingOptions }); }
  };

  if (typeof children === 'function') return <>{children(isRecording, toggle)}</>;
  if (asChild && React.isValidElement(children)) {
    return <Slot onClick={toggle} data-state={dataState} aria-label={label} title={label} className={className} style={style}>{children}</Slot>;
  }

  return (
    <button className={`rj-btn ${isRecording ? 'rj-btn--muted' : 'rj-btn--active'} ${className || ''}`}
      style={style} onClick={toggle} data-state={dataState} title={label} aria-label={label} type="button">
      {isRecording ? <StopRecordIcon /> : <RecordIcon />}
    </button>
  );
}
