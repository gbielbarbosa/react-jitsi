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

const buttonBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '48px', height: '48px', borderRadius: '50%', border: 'none',
  cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};

const NoiseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12h2l3-9 4 18 4-18 3 9h2" />
  </svg>
);

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
  const { noiseSuppressionEnabled, setNoiseSuppression, toggleNoiseSuppression } = useJitsiContext();
  const dataState = noiseSuppressionEnabled ? 'active' : 'off';
  const label = noiseSuppressionEnabled ? 'Disable noise suppression' : 'Enable noise suppression';

  if (typeof children === 'function') return <>{children(noiseSuppressionEnabled, setNoiseSuppression)}</>;

  if (asChild && React.isValidElement(children)) {
    return <Slot onClick={toggleNoiseSuppression} data-state={dataState} aria-label={label} title={label} className={className} style={style}>{children}</Slot>;
  }

  return (
    <button className={className}
      style={{ ...buttonBase, backgroundColor: noiseSuppressionEnabled ? 'rgba(34,197,94,0.9)' : 'rgba(255,255,255,0.15)', color: '#fff', ...style }}
      onClick={toggleNoiseSuppression} data-state={dataState} title={label} aria-label={label} type="button">
      <NoiseIcon />
    </button>
  );
}
