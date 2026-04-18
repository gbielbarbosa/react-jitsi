/**
 * Centralized SVG icon components for jitsi-react.
 * All icons are 20×20 unless specified otherwise.
 */
import React from 'react';

const defaultProps = {
  width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
};

// ----- Audio -----

export const MicOnIcon = () => (
  <svg {...defaultProps}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

export const MicOffIcon = () => (
  <svg {...defaultProps}>
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.12 1.5-.34 2.18" />
    <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

/** Smaller variant for participant lists and overlays */
export const MicMutedSmallIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
  </svg>
);

// ----- Video -----

export const VideoOnIcon = () => (
  <svg {...defaultProps}>
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

export const VideoOffIcon = () => (
  <svg {...defaultProps}>
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/** Smaller variant for participant lists and overlays */
export const VideoMutedSmallIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/** Mute overlay icon used on remote video tiles */
export const MicMutedOverlayIcon = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}>
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.12 1.5-.34 2.18" />
    <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

// ----- Screen share -----

export const ScreenShareIcon = () => (
  <svg {...defaultProps}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" /><polyline points="8 10 12 6 16 10" /><line x1="12" y1="6" x2="12" y2="14" />
  </svg>
);

export const StopShareIcon = () => (
  <svg {...defaultProps}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" /><line x1="2" y1="3" x2="22" y2="17" />
  </svg>
);

// ----- Phone -----

export const PhoneOffIcon = () => (
  <svg {...defaultProps}>
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
    <line x1="23" y1="1" x2="1" y2="23" />
  </svg>
);

// ----- Chat -----

export const ChatIcon = () => (
  <svg {...defaultProps}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// ----- Mirror -----

export const MirrorIcon = () => (
  <svg {...defaultProps}>
    <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="4 2" />
    <path d="M17 7l3 5-3 5" /><path d="M7 7l-3 5 3 5" />
  </svg>
);

// ----- Recording -----

export const RecordIcon = () => (
  <svg {...defaultProps}>
    <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

export const StopRecordIcon = () => (
  <svg {...defaultProps}>
    <circle cx="12" cy="12" r="8" /><rect x="9" y="9" width="6" height="6" fill="currentColor" />
  </svg>
);

// ----- Captions -----

export const CaptionsIcon = () => (
  <svg {...defaultProps}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M7 12h2m4 0h4M7 16h10" />
  </svg>
);

// ----- Polls -----

export const PollIcon = () => (
  <svg {...defaultProps}>
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

// ----- Noise suppression -----

export const NoiseIcon = () => (
  <svg {...defaultProps}>
    <path d="M2 12h2l3-9 4 18 4-18 3 9h2" />
  </svg>
);

// ----- Whiteboard -----

export const WhiteboardIcon = () => (
  <svg {...defaultProps}>
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
  </svg>
);

// ----- Virtual background -----

export const BackgroundIcon = () => (
  <svg {...defaultProps}>
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

// ----- Empty room (JitsiMeeting) -----

export const EmptyRoomIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
