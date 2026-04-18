/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// lib-jitsi-meet global type declarations
// ---------------------------------------------------------------------------

/**
 * JitsiMeetJS is loaded as a global from a <script> tag.
 * These types provide a minimal surface for our SDK.
 */
export interface JitsiMeetJSStatic {
  init: (options?: Record<string, unknown>) => void;
  setLogLevel: (level: unknown) => void;
  createLocalTracks: (options?: CreateLocalTracksOptions) => Promise<JitsiLocalTrack[]>;
  events: {
    connection: Record<string, string>;
    conference: Record<string, string>;
    track: Record<string, string>;
    mediaDevices: Record<string, string>;
  };
  errors: {
    connection: Record<string, string>;
    conference: Record<string, string>;
    track: Record<string, string>;
  };
  logLevels: Record<string, unknown>;
  mediaDevices: {
    enumerateDevices: (callback: (devices: MediaDeviceInfo[]) => void) => void;
    isDeviceChangeAvailable: (deviceType: string) => boolean;
    addEventListener: (event: string, handler: (...args: any[]) => void) => void;
    removeEventListener: (event: string, handler: (...args: any[]) => void) => void;
    setAudioOutputDevice: (deviceId: string) => Promise<void>;
  };
  JitsiConnection: new (
    appId: string | null,
    token: string | null,
    options: ConnectionOptions
  ) => JitsiConnection;
}

export interface CreateLocalTracksOptions {
  devices?: Array<'audio' | 'video' | 'desktop'>;
  resolution?: number;
  cameraDeviceId?: string;
  micDeviceId?: string;
  constraints?: Record<string, unknown>;
  firePermissionPromptIsShownEvent?: boolean;
  fireSlowPromiseEvent?: boolean;
}

export interface ConnectionOptions {
  hosts: {
    domain: string;
    muc: string;
    anonymousdomain?: string;
    focus?: string;
  };
  serviceUrl: string;
  clientNode?: string;
  bosh?: string;
}

export interface ConferenceOptions {
  openBridgeChannel?: boolean | string;
  p2p?: {
    enabled: boolean;
    stunServers?: Array<{ urls: string }>;
  };
  [key: string]: unknown;
}

export interface JitsiConnection {
  addEventListener: (event: string, handler: (...args: any[]) => void) => void;
  removeEventListener: (event: string, handler: (...args: any[]) => void) => void;
  connect: () => void;
  disconnect: () => void;
  initJitsiConference: (roomName: string, options: ConferenceOptions) => JitsiConference;
}

export interface JitsiConference {
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler: (...args: any[]) => void) => void;
  join: (password?: string) => void;
  leave: () => Promise<void>;
  addTrack: (track: JitsiLocalTrack) => Promise<void>;
  removeTrack: (track: JitsiLocalTrack) => Promise<void>;
  replaceTrack: (oldTrack: JitsiLocalTrack | null, newTrack: JitsiLocalTrack | null) => Promise<void>;
  getParticipants: () => JitsiParticipant[];
  getParticipantById: (id: string) => JitsiParticipant | undefined;
  myUserId: () => string;
  setDisplayName: (name: string) => void;
  sendTextMessage: (message: string) => void;
  sendMessage: (message: string | object, to?: string, sendThroughVideobridge?: boolean) => void;
  sendEndpointMessage: (to: string, payload: object) => void;
  broadcastEndpointMessage: (payload: object) => void;
  sendCommand: (name: string, values: object) => void;
  setReceiverConstraints: (constraints: Record<string, unknown>) => void;
  setSenderVideoConstraint: (maxHeight: number) => Promise<void>;
  getLocalTracks: () => JitsiLocalTrack[];
  getRole: () => string;
  isModerator: () => boolean;
  kickParticipant: (id: string, reason?: string) => void;
  muteParticipant: (id: string, mediaType?: string) => void;
  grantOwner: (id: string) => void;
  setLocalParticipantProperty: (name: string, value: string) => void;
  startRecording: (options: RecordingOptions) => Promise<void>;
  stopRecording: (sessionId: string) => Promise<void>;
  setSubject: (subject: string) => void;
}

export interface JitsiParticipant {
  getId: () => string;
  getDisplayName: () => string;
  getJid: () => string;
  getTracks: () => JitsiRemoteTrack[];
  getRole: () => string;
  isHidden: () => boolean;
  getStatus: () => string;
}

export interface JitsiTrack {
  getType: () => 'audio' | 'video';
  isMuted: () => boolean;
  isLocal: () => boolean;
  attach: (element: HTMLMediaElement) => void;
  detach: (element: HTMLMediaElement) => void;
  dispose: () => Promise<void>;
  getId: () => string;
  getParticipantId: () => string;
  addEventListener: (event: string, handler: (...args: any[]) => void) => void;
  removeEventListener: (event: string, handler: (...args: any[]) => void) => void;
  isVideoTrack: () => boolean;
  isAudioTrack: () => boolean;
  getVideoType?: () => 'camera' | 'desktop';
  stream?: MediaStream;
}

export interface JitsiLocalTrack extends JitsiTrack {
  mute: () => Promise<void>;
  unmute: () => Promise<void>;
  setEffect: (effect: TrackEffect | undefined) => Promise<void>;
  isEnded: () => boolean;
}

export interface JitsiRemoteTrack extends JitsiTrack {
  // Remote tracks don't have mute/unmute controls
}

// ---------------------------------------------------------------------------
// Effects
// ---------------------------------------------------------------------------

/**
 * Interface for track effects (virtual backgrounds, noise suppression, etc.)
 * Must implement these 3 methods to be used with `track.setEffect()`.
 */
export interface TrackEffect {
  /** Returns true if this effect should be applied to the given track */
  isEnabled: (track: JitsiTrack) => boolean;
  /** Starts the effect on the given MediaStream, returns a processed MediaStream */
  startEffect: (stream: MediaStream) => MediaStream;
  /** Stops the effect and releases resources */
  stopEffect: () => void;
}

// ---------------------------------------------------------------------------
// Recording
// ---------------------------------------------------------------------------

export interface RecordingOptions {
  mode: 'file' | 'stream';
  dropboxToken?: string;
  shouldShare?: boolean;
  rtmpStreamKey?: string;
  rtmpBroadcastID?: string;
  youtubeStreamKey?: string;
  youtubeBroadcastID?: string;
  appData?: string;
}

export interface RecordingSession {
  id: string;
  mode: 'file' | 'stream';
  status: 'pending' | 'on' | 'off' | 'error';
  error?: string;
}

// ---------------------------------------------------------------------------
// SDK public types
// ---------------------------------------------------------------------------

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'failed';
export type ConferenceStatus = 'none' | 'joining' | 'joined' | 'left' | 'error';

export interface UserInfo {
  displayName?: string;
  email?: string;
  avatarUrl?: string;
}

export interface Participant {
  id: string;
  displayName: string;
  role: string;
  isLocal: boolean;
  audioMuted: boolean;
  videoMuted: boolean;
  audioLevel?: number;
}

export interface TrackInfo {
  id: string;
  type: 'audio' | 'video';
  participantId: string;
  muted: boolean;
  isLocal: boolean;
  videoType?: 'camera' | 'desktop';
  track: JitsiTrack;
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export interface ChatMessage {
  id: string;
  participantId: string;
  displayName: string;
  text: string;
  timestamp: number;
  isPrivate: boolean;
  isLocal: boolean;
}

// ---------------------------------------------------------------------------
// Captions / Transcription
// ---------------------------------------------------------------------------

export interface CaptionEntry {
  participantId: string;
  displayName: string;
  text: string;
  timestamp: number;
  language?: string;
  isFinal: boolean;
}

// ---------------------------------------------------------------------------
// Polls
// ---------------------------------------------------------------------------

export interface PollOption {
  text: string;
  voters: string[]; // participant IDs
}

export interface Poll {
  id: string;
  creatorId: string;
  creatorName: string;
  question: string;
  options: PollOption[];
  isOpen: boolean;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Virtual Background
// ---------------------------------------------------------------------------

export type VirtualBackgroundType = 'none' | 'blur' | 'image' | 'custom';

export interface VirtualBackgroundConfig {
  type: VirtualBackgroundType;
  /** URL of the image (when type is 'image') */
  imageUrl?: string;
  /** Blur intensity 1-25 (when type is 'blur') */
  blurIntensity?: number;
  /** Custom effect instance (when type is 'custom') */
  customEffect?: TrackEffect;
}

// ---------------------------------------------------------------------------
// Whiteboard
// ---------------------------------------------------------------------------

export interface WhiteboardData {
  type: string;
  payload: unknown;
  senderId: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Screen share options
// ---------------------------------------------------------------------------

export interface ScreenShareOptions {
  /** Max frame rate for screen share (default: 30) */
  frameRate?: number;
  /** Resolution height */
  resolution?: number;
}

// ---------------------------------------------------------------------------
// Provider Props
// ---------------------------------------------------------------------------

export interface JitsiProviderProps {
  /** Jitsi server domain (e.g. "meet.jit.si" or "8x8.vc") */
  domain: string;
  /** Conference room name (just the room, NOT including AppID/tenant) */
  roomName: string;
  /** Optional user info */
  userInfo?: UserInfo;
  /** Optional JWT token for authentication */
  token?: string | null;
  /**
   * Tenant / AppID for multi-tenant deployments (e.g. JaaS).
   * When set, the MUC domain becomes `conference.{tenant}.{domain}`.
   *
   * @example
   * ```tsx
   * // JaaS usage:
   * <JitsiProvider
   *   domain="8x8.vc"
   *   tenant="vpaas-magic-cookie-5c009a8fcc684979bb49fe3ddaa3de77"
   *   roomName="my-room"
   *   token={jwt}
   * />
   * ```
   */
  tenant?: string;
  /**
   * Override the WebSocket/BOSH service URL.
   * Default: `wss://${domain}/xmpp-websocket`
   *
   * Examples:
   * - `wss://8x8.vc/xmpp-websocket`
   * - `https://meet.jit.si/http-bind` (BOSH fallback)
   */
  serviceUrl?: string;
  /**
   * Override the XMPP connection hosts configuration.
   * Useful when the XMPP domain differs from the HTTP domain.
   *
   * @example
   * ```tsx
   * connectionOptions={{
   *   hosts: {
   *     domain: 'meet.jit.si',
   *     muc: 'conference.meet.jit.si',
   *     focus: 'focus.meet.jit.si',
   *   },
   * }}
   * ```
   */
  connectionOptions?: Partial<ConnectionOptions>;
  /** Optional conference configuration options */
  configOverwrite?: ConferenceOptions;
  /** Whether to automatically join on mount (default: true) */
  autoJoin?: boolean;
  /** Devices to request on join (default: ['audio', 'video']) */
  devices?: Array<'audio' | 'video'>;
  /** Called when conference is joined successfully */
  onConferenceJoined?: () => void;
  /** Called when conference is left */
  onConferenceLeft?: () => void;
  /** Called when a participant joins */
  onParticipantJoined?: (participant: Participant) => void;
  /** Called when a participant leaves */
  onParticipantLeft?: (participantId: string) => void;
  /** Called when a chat message is received */
  onMessageReceived?: (message: ChatMessage) => void;
  /** Called on any error */
  onError?: (error: Error) => void;
  /** Called when connection status changes */
  onConnectionStatusChanged?: (status: ConnectionStatus) => void;
  /** React children */
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Context Value
// ---------------------------------------------------------------------------

export interface JitsiContextValue {
  // Connection state
  connectionStatus: ConnectionStatus;
  conferenceStatus: ConferenceStatus;

  // Tracks
  localTracks: JitsiLocalTrack[];
  localScreenTrack: JitsiLocalTrack | null;
  remoteTracks: Map<string, JitsiRemoteTrack[]>;

  // Participants
  participants: Map<string, Participant>;
  localParticipantId: string | null;
  localRole: 'moderator' | 'participant' | 'none';

  // Media state
  audioMuted: boolean;
  videoMuted: boolean;
  isScreenSharing: boolean;
  isMirrored: boolean;

  // Chat
  messages: ChatMessage[];
  unreadCount: number;

  // Captions
  captionsEnabled: boolean;
  captions: CaptionEntry[];

  // Recording
  isRecording: boolean;
  recordingSession: RecordingSession | null;

  // Noise suppression
  noiseSuppressionEnabled: boolean;

  // Virtual background
  virtualBackground: VirtualBackgroundConfig;

  // Whiteboard
  whiteboardActive: boolean;

  // Polls
  polls: Poll[];
  activePoll: Poll | null;

  // Raw references (for advanced usage)
  connection: JitsiConnection | null;
  conference: JitsiConference | null;

  // ----- Actions -----

  // Audio/Video
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  leave: () => Promise<void>;
  startScreenShare: (options?: ScreenShareOptions) => Promise<void>;
  stopScreenShare: () => Promise<void>;
  setDisplayName: (name: string) => void;
  getDevices: () => Promise<MediaDeviceInfo[]>;
  switchCamera: (deviceId: string) => Promise<void>;
  switchMicrophone: (deviceId: string) => Promise<void>;
  setAudioOutput: (deviceId: string) => Promise<void>;
  toggleMirror: () => void;

  // Virtual background
  setVirtualBackground: (config: VirtualBackgroundConfig) => Promise<void>;
  removeVirtualBackground: () => Promise<void>;

  // Noise suppression
  setNoiseSuppression: (effect: TrackEffect | null) => Promise<void>;
  toggleNoiseSuppression: () => Promise<void>;

  // Chat
  sendMessage: (text: string, to?: string) => void;
  sendPrivateMessage: (text: string, participantId: string) => void;
  clearMessages: () => void;
  markMessagesRead: () => void;

  // Captions
  toggleCaptions: () => void;
  clearCaptions: () => void;

  // Recording
  startRecording: (options: RecordingOptions) => Promise<void>;
  stopRecording: () => Promise<void>;

  // Whiteboard
  toggleWhiteboard: () => void;
  sendWhiteboardData: (data: WhiteboardData) => void;
  onWhiteboardData: (handler: (data: WhiteboardData) => void) => () => void;

  // Polls
  createPoll: (question: string, options: string[]) => void;
  votePoll: (pollId: string, optionIndex: number) => void;
  closePoll: (pollId: string) => void;

  // Performance
  setVideoQuality: (maxHeight: number) => void;
  setSenderQuality: (maxHeight: number) => Promise<void>;
  setMaxVisibleParticipants: (n: number) => void;

  // Admin
  kickParticipant: (id: string, reason?: string) => void;
  muteParticipant: (id: string, mediaType?: 'audio' | 'video') => void;
  grantModerator: (id: string) => void;
  muteAll: (mediaType?: 'audio' | 'video') => void;
}
