import React from 'react';
import * as HoverCard from '@radix-ui/react-hover-card';
import type { Participant } from '../types';
import { ParticipantStatsPanel, ParticipantStats } from './ParticipantStatsPanel';

export interface ConnectionIndicatorProps {
  participant: Participant;
  stats?: ParticipantStats;
  className?: string;
  style?: React.CSSProperties;
  /** Custom render function */
  children?: (
    status: string,
    bars: number,
    color: string,
    displayStats: ParticipantStats
  ) => React.ReactNode;
}

/**
 * Displays an indicator of the participant's connection status (active, inactive, interrupted).
 * Shows detailed stats on hover.
 */
export function ConnectionIndicator({ participant, stats, className, style, children }: ConnectionIndicatorProps) {
  const status = participant.connectionStatus || 'active';

  let color = '#22c55e'; // Green for active
  let bars = 3;

  if (status === 'inactive') {
    color = '#f59e0b'; // Yellow
    bars = 2;
  } else if (status === 'interrupted') {
    color = '#ef4444'; // Red
    bars = 1;
  } else if (status === 'restoring') {
    color = '#f97316'; // Orange
    bars = 1;
  }

  // Merge provided stats or context stats with the participant properties
  const displayStats: ParticipantStats = {
    isLocal: participant.isLocal,
    connectionStatus: status,
    participantId: participant.id,
    ...(participant.stats || {}),
    ...(stats || {}),
  };

  if (children) return <>{children(status, bars, color, displayStats)}</>;

  return (
    <HoverCard.Root openDelay={200} closeDelay={300}>
      <HoverCard.Trigger asChild>
        <div
          className={`rj-connection-indicator ${className || ''}`}
          style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px', cursor: 'help', ...style }}
        >
          <div style={{ width: '3px', height: '6px', backgroundColor: color, borderRadius: '1px' }} />
          <div style={{ width: '3px', height: '10px', backgroundColor: bars >= 2 ? color : 'rgba(255,255,255,0.2)', borderRadius: '1px' }} />
          <div style={{ width: '3px', height: '14px', backgroundColor: bars === 3 ? color : 'rgba(255,255,255,0.2)', borderRadius: '1px' }} />
        </div>
      </HoverCard.Trigger>
      
      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          sideOffset={8}
          style={{ zIndex: 1000, filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.5))' }}
        >
          <ParticipantStatsPanel stats={displayStats} style={{ minWidth: '220px', marginTop: 0 }} />
          <HoverCard.Arrow fill="var(--rj-card, #1e1e1e)" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
