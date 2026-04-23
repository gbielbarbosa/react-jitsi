import React, { useCallback, useEffect, useState } from 'react';
import { useJitsiContext } from '../JitsiContext';

export interface DeviceSelectorProps {
  /** Filter by device kind */
  kind?: 'audioinput' | 'videoinput' | 'audiooutput';
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Label to display before the selector */
  label?: string;
  /**
   * Custom render function. Receives devices list and a handler.
   */
  children?: (
    devices: MediaDeviceInfo[],
    selectDevice: (deviceId: string) => Promise<void>,
    selectedDeviceId: string | undefined
  ) => React.ReactNode;
}

/**
 * Device selector dropdown for camera, microphone, or speaker.
 *
 * @example
 * ```tsx
 * <DeviceSelector kind="audioinput" label="Microphone" />
 * <DeviceSelector kind="videoinput" label="Camera" />
 * ```
 */
export function DeviceSelector({
  kind = 'audioinput',
  className,
  style,
  label,
  children,
}: DeviceSelectorProps) {
  const { getDevices, switchCamera, switchMicrophone, localTracks } = useJitsiContext();
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  // Get current device IDs from tracks
  useEffect(() => {
    const track = localTracks.find((t) => {
      if (kind === 'audioinput') return t.getType() === 'audio';
      if (kind === 'videoinput') return t.getType() === 'video';
      return false;
    });

    if (track?.stream) {
      const mediaTrack =
        kind === 'audioinput'
          ? track.stream.getAudioTracks()[0]
          : track.stream.getVideoTracks()[0];
      if (mediaTrack) {
        const settings = mediaTrack.getSettings();
        setSelectedId(settings.deviceId);
      }
    }
  }, [localTracks, kind]);

  // Enumerate devices
  useEffect(() => {
    getDevices().then((allDevices) => {
      const filtered = allDevices.filter((d) => d.kind === kind);
      setDevices(filtered);
    });
  }, [getDevices, kind]);

  const handleSelect = useCallback(
    async (deviceId: string) => {
      setSelectedId(deviceId);
      if (kind === 'videoinput') {
        await switchCamera(deviceId);
      } else if (kind === 'audioinput') {
        await switchMicrophone(deviceId);
      }
    },
    [kind, switchCamera, switchMicrophone]
  );

  if (children) {
    return <>{children(devices, handleSelect, selectedId)}</>;
  }

  const defaultLabel =
    label ||
    (kind === 'audioinput'
      ? 'Microphone'
      : kind === 'videoinput'
        ? 'Camera'
        : 'Speaker');

  return (
    <div className={`jr-field-group ${className || ''}`} style={style}>
      <label className="jr-label">{defaultLabel}</label>
      <select
        className="jr-select"
        value={selectedId || ''}
        onChange={(e) => handleSelect(e.target.value)}
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Device ${device.deviceId.substring(0, 8)}`}
          </option>
        ))}
      </select>
    </div>
  );
}
