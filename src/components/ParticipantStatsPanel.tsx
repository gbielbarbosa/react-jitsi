import React from 'react';

export interface ParticipantStats {
  isLocal?: boolean;
  isScreenShare?: boolean;

  // Common
  connectionStatus?: string;
  bitrate?: number;
  packetLoss?: number;
  resolution?: string;
  frameRate?: number;
  codec?: string;
  estimatedBandwidth?: number;

  // Remote / Local common
  connectedTo?: string;
  audioSsrc?: string;
  videoSsrc?: string;
  participantId?: string;

  // Local only
  remoteAddress?: string;
  remotePort?: number;
  localAddress?: string;
  localPort?: number;
  transport?: string;
  servers?: string;
}

export interface ParticipantStatsPanelProps {
  stats: ParticipantStats;
  className?: string;
  style?: React.CSSProperties;
  /** Custom render function */
  children?: (stats: ParticipantStats) => React.ReactNode;
}

/**
 * Displays detailed connection statistics for a participant.
 */
export function ParticipantStatsPanel({ stats, className, style, children }: ParticipantStatsPanelProps) {
  if (children) return <>{children(stats)}</>;

  if (stats.isScreenShare) {
    return (
      <div className={`rj-stats-panel ${className || ''}`} style={style}>
        <div className="rj-stats-panel__header">Screen Share Statistics</div>
        <div className="rj-stats-panel__grid">
          <StatItem label="Resolution" value={stats.resolution} />
          <StatItem label="Frame rate" value={stats.frameRate ? `${stats.frameRate} fps` : undefined} />
        </div>
      </div>
    );
  }

  return (
    <div className={`rj-stats-panel ${className || ''}`} style={style}>
      <div className="rj-stats-panel__header">
        {stats.isLocal ? 'Local Statistics' : 'Remote Statistics'}
      </div>

      <div className="rj-stats-panel__grid">
        <StatItem label="Connection" value={stats.connectionStatus} />
        <StatItem label="Bitrate" value={stats.bitrate ? `${stats.bitrate} kbps` : undefined} />
        <StatItem label="Packet loss" value={stats.packetLoss !== undefined ? `${stats.packetLoss}%` : undefined} />
        <StatItem label="Resolution" value={stats.resolution} />
        <StatItem label="Frame rate" value={stats.frameRate ? `${stats.frameRate} fps` : undefined} />
        <StatItem label="Codecs" value={stats.codec} />

        {stats.isLocal && (
          <>
            <StatItem label="Estimated bandwidth" value={stats.estimatedBandwidth ? `${stats.estimatedBandwidth} kbps` : undefined} />
            <StatItem label="Remote address" value={stats.remoteAddress} />
            <StatItem label="Remote port" value={stats.remotePort?.toString()} />
            <StatItem label="Local address" value={stats.localAddress} />
            <StatItem label="Local port" value={stats.localPort?.toString()} />
            <StatItem label="Transport" value={stats.transport} />
            <StatItem label="Servers" value={stats.servers} />
          </>
        )}

        <StatItem label="Connected to" value={stats.connectedTo} />
        <StatItem label="SSRC Audio" value={stats.audioSsrc} />
        <StatItem label="SSRC Video" value={stats.videoSsrc} />
        <StatItem label="Participant ID" value={stats.participantId} />
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rj-stats-panel__item">
      <span className="rj-stats-panel__label">{label}:</span>
      <span className="rj-stats-panel__value">{value ?? "N/A"}</span>
    </div>
  );
}
