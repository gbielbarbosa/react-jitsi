import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';
import type { VirtualBackgroundConfig } from '../types';

export interface VirtualBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
  asChild?: boolean;
  children?: React.ReactElement | ((
    config: VirtualBackgroundConfig,
    set: (config: VirtualBackgroundConfig) => Promise<void>,
    remove: () => Promise<void>
  ) => React.ReactNode);
}

const buttonBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '48px', height: '48px', borderRadius: '50%', border: 'none',
  cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};

const BgIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

/**
 * Virtual background toggle/control.
 *
 * This component provides the interface only. You must provide a
 * `TrackEffect` implementation via `setVirtualBackground({ type: 'custom', customEffect })`.
 *
 * @example
 * ```tsx
 * <VirtualBackground>
 *   {(config, set, remove) => (
 *     <div>
 *       <button onClick={() => set({ type: 'custom', customEffect: myBlurEffect })}>Blur</button>
 *       <button onClick={remove}>None</button>
 *     </div>
 *   )}
 * </VirtualBackground>
 * ```
 */
export function VirtualBackground({ className, style, asChild, children }: VirtualBackgroundProps) {
  const { virtualBackground, setVirtualBackground, removeVirtualBackground } = useJitsiContext();
  const isActive = virtualBackground.type !== 'none';
  const dataState = isActive ? 'active' : 'off';
  const label = isActive ? 'Remove background' : 'Virtual background';

  if (typeof children === 'function') return <>{children(virtualBackground, setVirtualBackground, removeVirtualBackground)}</>;

  const toggle = async () => {
    if (isActive) await removeVirtualBackground();
    // When no children/render prop, clicking just removes. To set, use the render prop API.
  };

  if (asChild && React.isValidElement(children)) {
    return <Slot onClick={toggle} data-state={dataState} aria-label={label} title={label} className={className} style={style}>{children}</Slot>;
  }

  return (
    <button className={className}
      style={{ ...buttonBase, backgroundColor: isActive ? 'rgba(99,102,241,0.9)' : 'rgba(255,255,255,0.15)', color: '#fff', ...style }}
      onClick={toggle} data-state={dataState} title={label} aria-label={label} type="button">
      <BgIcon />
    </button>
  );
}
