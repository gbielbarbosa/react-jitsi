import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import { Slot } from '../utils/Slot';
import { BackgroundIcon } from '../icons';
import type { VirtualBackgroundConfig } from '../types';

export interface VirtualBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
  asChild?: boolean;
  children?: React.ReactElement | ((
    config: VirtualBackgroundConfig | null,
    set: (config: VirtualBackgroundConfig | null) => Promise<void>,
    remove: () => Promise<void>
  ) => React.ReactNode);
}

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
  const isActive = !!virtualBackground;
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
    <button className={`rj-btn ${isActive ? 'rj-btn--accent' : 'rj-btn--active'} ${className || ''}`}
      style={style}
      onClick={toggle} data-state={dataState} title={label} aria-label={label} type="button">
      <BackgroundIcon />
    </button>
  );
}
