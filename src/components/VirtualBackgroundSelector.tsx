import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import type { VirtualBackgroundConfig, VirtualBackgroundEffect } from '../types';

export interface VirtualBackgroundSelectorProps {
  className?: string;
  style?: React.CSSProperties;
  /** Component/Render prop for custom item rendering */
  children?: (
    effects: VirtualBackgroundEffect[],
    current: VirtualBackgroundConfig | null,
    set: (config: VirtualBackgroundConfig | null) => Promise<void>
  ) => React.ReactNode;
}

/**
 * A component that renders the registered virtual background options.
 * It uses the `virtualBackgroundOptions` registered in the `JitsiProvider`.
 */
export function VirtualBackgroundSelector({ className, style, children }: VirtualBackgroundSelectorProps) {
  const { virtualBackground, virtualBackgroundEffects, setVirtualBackground } = useJitsiContext();

  if (typeof children === 'function') {
    return <>{children(virtualBackgroundEffects, virtualBackground, setVirtualBackground)}</>;
  }

  if (virtualBackgroundEffects.length === 0) return null;

  return (
    <div className={`rj-vb-selector ${className || ''}`} style={style}>
      <div className="rj-vb-selector__grid">
        {/* None option */}
        <button
          type="button"
          className={`rj-vb-item ${!virtualBackground ? 'rj-vb-item--active' : ''}`}
          onClick={() => setVirtualBackground(null)}
        >
          <div className="rj-vb-item__preview rj-vb-item__preview--none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <span className="rj-vb-item__label">None</span>
        </button>

        {/* Registered options */}
        {virtualBackgroundEffects.map((opt) => {
          const isSelected = virtualBackground?.type === opt.config.type &&
            (opt.config.type === 'image' ? virtualBackground.imageUrl === opt.config.imageUrl : true);
          return (
            <button
              key={opt.id}
              type="button"
              className={`rj-vb-item ${isSelected ? 'rj-vb-item--active' : ''}`}
              onClick={() => setVirtualBackground(opt.config)}
            >
              <div className="rj-vb-item__preview">
                {opt.config.imageUrl ? (
                  <img src={opt.config.imageUrl} alt={opt.label} />
                ) : opt.config.type === 'blur' ? (
                  <div className="rj-vb-item__preview--blur" />
                ) : (
                  <div className="rj-vb-item__preview--placeholder" />
                )}
              </div>
              <span className="rj-vb-item__label">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
