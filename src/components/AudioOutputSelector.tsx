import React, { useCallback, useEffect, useState } from 'react';
import { useJitsiContext } from '../JitsiContext';

export interface AudioOutputSelectorProps {
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  children?: (devices: MediaDeviceInfo[], select: (id: string) => Promise<void>, selectedId: string | undefined) => React.ReactNode;
}

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
    <div className={`rj-field-group ${className || ''}`} style={style}>
      <label className="rj-label">{label || 'Speaker'}</label>
      <select className="rj-select" value={selectedId || ''} onChange={(e) => handleSelect(e.target.value)}>
        {devices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || `Device ${d.deviceId.substring(0, 8)}`}</option>)}
      </select>
    </div>
  );
}
