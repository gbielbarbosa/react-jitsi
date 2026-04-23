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
    <div className={`jr-panel ${className || ''}`} style={style}>
      <div className="jr-form-row">
        <label className="jr-label">Receive Quality</label>
        <select className="jr-select" defaultValue={720} onChange={(e) => setVideoQuality(Number(e.target.value))}>
          {QUALITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="jr-form-row">
        <label className="jr-label">Send Quality</label>
        <select className="jr-select" defaultValue={720} onChange={(e) => setSenderQuality(Number(e.target.value))}>
          {QUALITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="jr-form-row">
        <label className="jr-label">Max Visible Participants</label>
        <select className="jr-select" defaultValue={20} onChange={(e) => setMaxVisibleParticipants(Number(e.target.value))}>
          {LAST_N.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}
