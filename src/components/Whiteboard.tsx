import React, { useCallback, useEffect } from 'react';
import { useJitsiContext } from '../JitsiContext';
import type { WhiteboardData } from '../types';

export interface WhiteboardProps {
  className?: string;
  style?: React.CSSProperties;
  /**
   * Callback fired when whiteboard data is received from other participants.
   * Use this to feed data into your external whiteboard library (e.g., Excalidraw, tldraw).
   */
  onDataReceived?: (data: WhiteboardData) => void;
  /**
   * Render prop giving full control.
   */
  children?: (
    isActive: boolean,
    sendData: (data: WhiteboardData) => void,
    toggle: () => void
  ) => React.ReactNode;
}

const placeholderStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '100%', minHeight: '400px', borderRadius: '12px',
  backgroundColor: 'rgba(15,15,25,0.95)', border: '2px dashed rgba(255,255,255,0.15)',
  color: '#9ca3af', fontSize: '14px', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  flexDirection: 'column', gap: '8px',
};

/**
 * Whiteboard component — provides the data synchronization layer via Jitsi data channels.
 *
 * This is an interface/hook only. Integrate with your preferred whiteboard library
 * (Excalidraw, tldraw, etc.) using the `sendData` and `onDataReceived` APIs.
 *
 * @example
 * ```tsx
 * <Whiteboard onDataReceived={(data) => excalidrawAPI.updateScene(data.payload)}>
 *   {(isActive, sendData, toggle) => (
 *     <div>
 *       <button onClick={toggle}>{isActive ? 'Close' : 'Open'} Whiteboard</button>
 *       {isActive && <MyExcalidrawWrapper onChange={(scene) => sendData({
 *         type: 'scene', payload: scene, senderId: '', timestamp: Date.now()
 *       })} />}
 *     </div>
 *   )}
 * </Whiteboard>
 * ```
 */
export function Whiteboard({ className, style, onDataReceived, children }: WhiteboardProps) {
  const { whiteboardActive, toggleWhiteboard, sendWhiteboardData, onWhiteboardData } = useJitsiContext();

  // Register data handler
  useEffect(() => {
    if (!onDataReceived) return;
    const unsubscribe = onWhiteboardData(onDataReceived);
    return unsubscribe;
  }, [onDataReceived, onWhiteboardData]);

  const sendData = useCallback((data: WhiteboardData) => {
    sendWhiteboardData(data);
  }, [sendWhiteboardData]);

  if (children) return <>{children(whiteboardActive, sendData, toggleWhiteboard)}</>;

  if (!whiteboardActive) return null;

  return (
    <div className={className} style={{ ...placeholderStyle, ...style }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
      <span>Whiteboard active — Integrate your preferred whiteboard library</span>
      <span style={{ fontSize: '12px', color: '#6b7280' }}>Use the render prop API for full control</span>
    </div>
  );
}
