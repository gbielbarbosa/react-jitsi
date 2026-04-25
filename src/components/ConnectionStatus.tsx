import React from 'react';
import { useJitsiContext } from '../JitsiContext';
import type { ConnectionStatus as ConnectionStatusType, ConferenceStatus } from '../types';

export interface ConnectionStatusProps {
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /**
   * Custom render function.
   */
  children?: (
    connectionStatus: ConnectionStatusType,
    conferenceStatus: ConferenceStatus,
    participantCount: number
  ) => React.ReactNode;
}

function getStatusColor(connStatus: ConnectionStatusType, confStatus: ConferenceStatus): string {
  if (connStatus === 'failed' || confStatus === 'error') return '#ef4444';
  if (confStatus === 'joined') return '#22c55e';
  if (connStatus === 'connecting' || confStatus === 'joining') return '#f59e0b';
  if (connStatus === 'disconnected' || confStatus === 'left') return '#6b7280';
  return '#6b7280';
}

function getStatusLabel(connStatus: ConnectionStatusType, confStatus: ConferenceStatus): string {
  if (connStatus === 'failed') return 'Connection failed';
  if (confStatus === 'error') return 'Conference error';
  if (confStatus === 'joined') return 'Connected';
  if (confStatus === 'joining') return 'Joining...';
  if (connStatus === 'connecting') return 'Connecting...';
  if (confStatus === 'left') return 'Left';
  if (connStatus === 'disconnected') return 'Disconnected';
  return 'Initializing...';
}

/**
 * Displays the current connection and conference status.
 *
 * @example
 * ```tsx
 * // Default
 * <ConnectionStatus />
 *
 * // Custom render
 * <ConnectionStatus>
 *   {(conn, conf, count) => (
 *     <span>Status: {conn} | Participants: {count}</span>
 *   )}
 * </ConnectionStatus>
 * ```
 */
export function ConnectionStatus({ className, style, children }: ConnectionStatusProps) {
  const { connectionStatus, conferenceStatus, participants } = useJitsiContext();
  const participantCount = participants.size;

  if (children) {
    return <>{children(connectionStatus, conferenceStatus, participantCount)}</>;
  }

  const color = getStatusColor(connectionStatus, conferenceStatus);
  const label = getStatusLabel(connectionStatus, conferenceStatus);

  return (
    <div className={`rj-connection ${className || ''}`} style={style}>
      <div
        className="rj-connection__dot"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
      <span>{label}</span>
      {conferenceStatus === 'joined' && (
        <span className="rj-connection__count">
          · {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
        </span>
      )}
    </div>
  );
}
