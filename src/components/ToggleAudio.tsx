import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';
import { MicOnIcon, MicOffIcon } from '../icons';

export interface ToggleAudioProps {
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /**
   * When true, merges behavior into the child element instead of rendering
   * a default button. The child receives onClick, data-state, aria-label, and title.
   */
  asChild?: boolean;
  /**
   * Custom render function. Receives muted state and toggle handler.
   */
  children?: React.ReactElement | ((muted: boolean, toggle: () => Promise<void>) => React.ReactNode);
}

/**
 * Toggle microphone mute/unmute.
 *
 * @example
 * ```tsx
 * <ToggleAudio />
 *
 * <ToggleAudio asChild>
 *   <button className="my-btn">🎤</button>
 * </ToggleAudio>
 * ```
 */
export function ToggleAudio({ className, style, asChild, children }: ToggleAudioProps) {
  const { audioMuted, toggleAudio } = useJitsiContext();

  const dataState = audioMuted ? 'muted' : 'active';
  const label = audioMuted ? 'Unmute microphone' : 'Mute microphone';

  // Render prop function
  if (typeof children === 'function') {
    return <>{children(audioMuted, toggleAudio)}</>;
  }

  // asChild pattern
  if (asChild && React.isValidElement(children)) {
    return (
      <Slot
        onClick={toggleAudio}
        data-state={dataState}
        aria-label={label}
        title={label}
        className={className}
        style={style}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      className={`rj-btn ${audioMuted ? 'rj-btn--muted' : 'rj-btn--active'} ${className || ''}`}
      style={style}
      onClick={toggleAudio}
      data-state={dataState}
      title={label}
      aria-label={label}
      type="button"
    >
      {audioMuted ? <MicOffIcon /> : <MicOnIcon />}
    </button>
  );
}
