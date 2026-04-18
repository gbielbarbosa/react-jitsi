import React, { useCallback, useEffect, useState } from 'react';
import { useJitsiContext } from '../JitsiContext';

export interface AudioOutputSelectorProps {
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  children?: (devices: MediaDeviceInfo[], select: (id: string) => Promise<void>, selectedId: string | undefined) => React.ReactNode;
}

const containerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" };
const labelStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 500, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.05em' };
const selectStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" };

/**
 * Dropdown to select audio output device (speaker/headphones).
 */
export function AudioOutputSelector({ className, style, label, children }: AudioOutputSelectorProps) {
  const { getDevices, setAudioOutput } = useJitsiContext();
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  useEffect(() => {
    getDevices().then((all) => setDevices(all.filter((d) => d.kind === 'audiooutput')));
  }, [getDevices]);

  const handleSelect = useCallback(async (deviceId: string) => {
    setSelectedId(deviceId);
    await setAudioOutput(deviceId);
  }, [setAudioOutput]);

  if (children) return <>{children(devices, handleSelect, selectedId)}</>;

  return (
    <div className={className} style={{ ...containerStyle, ...style }}>
      <label style={labelStyle}>{label || 'Speaker'}</label>
      <select style={selectStyle} value={selectedId || ''} onChange={(e) => handleSelect(e.target.value)}>
        {devices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || `Device ${d.deviceId.substring(0, 8)}`}</option>)}
      </select>
    </div>
  );
}
