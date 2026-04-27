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
    getWhiteboardData: () => WhiteboardData | null,
    sendData: (data: WhiteboardData) => void,
    toggle: () => void
  ) => React.ReactNode;
}

/**
 * Whiteboard component - provides the data synchronization layer via Jitsi data channels.
 *
 * This is an interface/hook only. Integrate with your preferred whiteboard library
 * (Excalidraw, tldraw, etc.) using the `sendData` and `onDataReceived` APIs.
 *
 * @example
 * ```tsx
 * <Whiteboard onDataReceived={(data) => {
 *     // Inform Excalidraw that the updateScene is from remote data, so the data will not be sent back.
 *     isRemoteUpdate.current = true;
 * 
 *     excalidrawAPI?.updateScene({ elements: data.payload as any });
 *   }}>
 *   {(isActive, getData, sendData, toggle) => {
 *     if (!isActive) return null;
 *     return (
 *       <Excalidraw 
 *         initialData={{ elements: getData()?.payload as any }}
 *         excalidrawAPI={(api) => setExcalidrawAPI(api)}
 *         onChange={(elements) => {
 *           // If the change was made remotely, we don't want to send it back.
 *           // This prevent Synchronization Feedback Loop.
 *           if (isRemoteUpdate.current) {
 *             isRemoteUpdate.current = false;
 *             return;
 *           }
 *           // Send your local drawings to the Jitsi room.
 *           sendData({ type: 'update', payload: elements });
 *         }}
 *       />
 *     );
 *   }}
 * </Whiteboard>
 * ```
 */
export function Whiteboard({ className, style, onDataReceived, children }: WhiteboardProps) {
  const { whiteboardActive, getWhiteboardData, toggleWhiteboard, sendWhiteboardData, onWhiteboardData } = useJitsiContext();

  // Register data handler
  useEffect(() => {
    if (!onDataReceived) return;
    const unsubscribe = onWhiteboardData(onDataReceived);
    return unsubscribe;
  }, [onDataReceived, onWhiteboardData]);

  const sendData = useCallback((data: WhiteboardData) => {
    sendWhiteboardData(data);
  }, [sendWhiteboardData]);

  if (children) return <>{children(whiteboardActive, getWhiteboardData, sendData, toggleWhiteboard)}</>;

  if (!whiteboardActive) return null;

  return (
    <div className={`rj-panel ${className || ''}`} style={{ alignItems: 'center', justifyContent: 'center', minHeight: '400px', border: '2px dashed rgba(255,255,255,0.15)', ...style }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
      <span style={{ color: '#9ca3af' }}>Whiteboard active - Integrate your preferred whiteboard library</span>
      <span style={{ fontSize: '12px', color: '#6b7280' }}>Use the render prop API for full control</span>
    </div>
  );
}
