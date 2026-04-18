import React from 'react';
import { useJitsiContext } from '../JitsiContext';

export interface PerformanceSettingsProps {
  className?: string;
  style?: React.CSSProperties;
  children?: (
    setVideoQuality: (h: number) => void,
    setSenderQuality: (h: number) => Promise<void>,
    setMaxVisible: (n: number) => void
  ) => React.ReactNode;
}

const containerStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px',
  backgroundColor: 'rgba(15,15,25,0.95)', borderRadius: '12px',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const labelStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 500, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.05em' };
const selectStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
  backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '13px',
  outline: 'none', cursor: 'pointer', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};
const rowStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px' };

const QUALITY_OPTIONS = [
  { label: 'Low (180p)', value: 180 },
  { label: 'Medium (360p)', value: 360 },
  { label: 'HD (720p)', value: 720 },
  { label: 'Full HD (1080p)', value: 1080 },
];
const LAST_N = [
  { label: '5 participants', value: 5 },
  { label: '10 participants', value: 10 },
  { label: '20 participants', value: 20 },
  { label: 'Unlimited', value: -1 },
];

/**
 * Performance settings panel for video quality and visible participant limits.
 */
export function PerformanceSettings({ className, style, children }: PerformanceSettingsProps) {
  const { setVideoQuality, setSenderQuality, setMaxVisibleParticipants } = useJitsiContext();

  if (children) return <>{children(setVideoQuality, setSenderQuality, setMaxVisibleParticipants)}</>;

  return (
    <div className={className} style={{ ...containerStyle, ...style }}>
      <div style={rowStyle}>
        <label style={labelStyle}>Receive Quality</label>
        <select style={selectStyle} defaultValue={720} onChange={(e) => setVideoQuality(Number(e.target.value))}>
          {QUALITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div style={rowStyle}>
        <label style={labelStyle}>Send Quality</label>
        <select style={selectStyle} defaultValue={720} onChange={(e) => setSenderQuality(Number(e.target.value))}>
          {QUALITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div style={rowStyle}>
        <label style={labelStyle}>Max Visible Participants</label>
        <select style={selectStyle} defaultValue={20} onChange={(e) => setMaxVisibleParticipants(Number(e.target.value))}>
          {LAST_N.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}
