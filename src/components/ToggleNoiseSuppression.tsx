import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';
import type { TrackEffect } from '../types';

export interface ToggleNoiseSuppressionProps {
  className?: string;
  style?: React.CSSProperties;
  asChild?: boolean;
  children?: React.ReactElement | ((
    enabled: boolean,
    setEffect: (effect: TrackEffect | null) => Promise<void>
  ) => React.ReactNode);
}

/**
 * Toggle noise suppression on/off.
 *
 * This component provides the interface only. You must provide a
 * `TrackEffect` implementation via `setNoiseSuppression(effect)`.
 *
 * @example
 * ```tsx
 * <ToggleNoiseSuppression>
 *   {(enabled, setEffect) => (
 *     <button onClick={() => setEffect(enabled ? null : myNoiseEffect)}>
 *       {enabled ? '🔇 NS On' : '🔊 NS Off'}
 *     </button>
 *   )}
 * </ToggleNoiseSuppression>
 * ```
 */
export function ToggleNoiseSuppression({ className, style, asChild, children }: ToggleNoiseSuppressionProps) {
  const { noiseSuppressionEnabled, noiseSuppressionEffect, setNoiseSuppression, toggleNoiseSuppression } = useJitsiContext();
  const dataState = noiseSuppressionEnabled ? 'active' : 'off';
  const label = noiseSuppressionEnabled ? 'Disable noise suppression' : 'Enable noise suppression';

  if (typeof children === 'function') return <>{children(noiseSuppressionEnabled, setNoiseSuppression)}</>;

  if (asChild && React.isValidElement(children)) {
    return <Slot onClick={toggleNoiseSuppression} data-state={dataState} aria-label={label} title={label} className={className} style={style}>{children}</Slot>;
  }

  return (
    <div style={{ display: "flex", gap: "5px" }}>
      <input disabled={!noiseSuppressionEffect} id='rj-toggle-noise-suppression' type="checkbox" style={style} data-state={dataState} title={label} aria-label={label} checked={noiseSuppressionEnabled} onChange={(toggleNoiseSuppression)} />
      <label className='rj-label' htmlFor="rj-toggle-noise-suppression">Enable noise suppression</label>
    </div>
  );
}
