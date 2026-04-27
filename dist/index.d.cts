import * as react_jsx_runtime from 'react/jsx-runtime';
import React$1 from 'react';

interface ParticipantStats {
    isLocal?: boolean;
    isScreenShare?: boolean;
    connectionStatus?: string;
    bitrate?: number;
    packetLoss?: number;
    resolution?: string;
    frameRate?: number;
    codec?: string;
    estimatedBandwidth?: number;
    connectedTo?: string;
    audioSsrc?: string;
    videoSsrc?: string;
    participantId?: string;
    remoteAddress?: string;
    remotePort?: number;
    localAddress?: string;
    localPort?: number;
    transport?: string;
    servers?: string;
}
interface ParticipantStatsPanelProps {
    stats: ParticipantStats;
    className?: string;
    style?: React$1.CSSProperties;
    /** Custom render function */
    children?: (stats: ParticipantStats) => React$1.ReactNode;
}
/**
 * Displays detailed connection statistics for a participant.
 */
declare function ParticipantStatsPanel({ stats, className, style, children }: ParticipantStatsPanelProps): react_jsx_runtime.JSX.Element;

interface ConnectionOptions {
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
interface ConferenceOptions {
    openBridgeChannel?: boolean | string;
    p2p?: {
        enabled: boolean;
        stunServers?: Array<{
            urls: string;
        }>;
    };
    [key: string]: unknown;
}
interface JitsiConnection {
    addEventListener: (event: string, handler: (...args: any[]) => void) => void;
    removeEventListener: (event: string, handler: (...args: any[]) => void) => void;
    connect: () => void;
    disconnect: () => void;
    initJitsiConference: (roomName: string, options: ConferenceOptions) => JitsiConference;
}
interface JitsiConference {
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
interface JitsiParticipant {
    getId: () => string;
    getDisplayName: () => string;
    getJid: () => string;
    getTracks: () => JitsiRemoteTrack[];
    getRole: () => string;
    isHidden: () => boolean;
    getStatus: () => string;
}
interface JitsiTrack {
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
interface JitsiLocalTrack extends JitsiTrack {
    mute: () => Promise<void>;
    unmute: () => Promise<void>;
    setEffect: (effect: TrackEffect | undefined) => Promise<void>;
    isEnded: () => boolean;
}
interface JitsiRemoteTrack extends JitsiTrack {
}
/**
 * Interface for track effects (virtual backgrounds, noise suppression, etc.)
 * Must implement these 3 methods to be used with `track.setEffect()`.
 */
interface TrackEffect {
    /** Returns true if this effect should be applied to the given track */
    isEnabled: (track: JitsiTrack) => boolean;
    /** Starts the effect on the given MediaStream, returns a processed MediaStream */
    startEffect: (stream: MediaStream) => MediaStream;
    /** Stops the effect and releases resources */
    stopEffect: () => void;
}
interface RecordingOptions {
    mode: 'file' | 'stream';
    dropboxToken?: string;
    shouldShare?: boolean;
    rtmpStreamKey?: string;
    rtmpBroadcastID?: string;
    youtubeStreamKey?: string;
    youtubeBroadcastID?: string;
    appData?: string;
}
interface RecordingSession {
    id: string;
    mode: 'file' | 'stream';
    status: 'pending' | 'on' | 'off' | 'error';
    error?: string;
}
type ConnectionStatus$1 = 'disconnected' | 'connecting' | 'connected' | 'failed';
type ConferenceStatus = 'none' | 'joining' | 'joined' | 'left' | 'error';
interface UserInfo {
    displayName?: string;
    email?: string;
    avatarUrl?: string;
}

interface Participant {
    id: string;
    displayName: string;
    role: string;
    isLocal: boolean;
    audioMuted: boolean;
    videoMuted: boolean;
    audioLevel?: number;
    connectionStatus?: string;
    stats?: ParticipantStats;
}
interface TrackInfo {
    id: string;
    type: 'audio' | 'video';
    participantId: string;
    muted: boolean;
    isLocal: boolean;
    videoType?: 'camera' | 'desktop';
    track: JitsiTrack;
}
interface ChatMessage {
    id: string;
    participantId: string;
    displayName: string;
    text: string;
    timestamp: number;
    isPrivate: boolean;
    isLocal: boolean;
}
interface CaptionEntry {
    participantId: string;
    displayName: string;
    text: string;
    timestamp: number;
    language?: string;
    isFinal: boolean;
}
interface PollOption {
    text: string;
    voters: string[];
}
interface Poll {
    id: string;
    creatorId: string;
    creatorName: string;
    question: string;
    options: PollOption[];
    isOpen: boolean;
    timestamp: number;
}
type VirtualBackgroundType = 'blur' | 'image' | 'custom';
interface VirtualBackgroundConfig {
    type: VirtualBackgroundType;
    /** URL of the image (when type is 'image') */
    imageUrl?: string;
    /** Blur intensity 1-25 (when type is 'blur') */
    blurIntensity?: number;
    /** Custom effect instance (when type is 'custom') */
    effect: TrackEffect;
}
interface VirtualBackgroundEffect {
    id: string;
    label: string;
    config: VirtualBackgroundConfig;
}
interface WhiteboardData {
    type: string;
    payload: unknown;
    senderId?: string;
    timestamp?: number;
}
interface ScreenShareOptions {
    /** Max frame rate for screen share (default: 30) */
    frameRate?: number;
    /** Resolution height */
    resolution?: number;
}
interface JitsiProviderProps {
    /** Jitsi server domain (e.g. "8x8.vc") */
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
     *     domain: '8x8.vc',
     *     muc: 'conference.8x8.vc',
     *     focus: 'focus.8x8.vc',
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
    onConnectionStatusChanged?: (status: ConnectionStatus$1) => void;
    /** Available virtual background options for the UI to render */
    virtualBackgroundEffects?: VirtualBackgroundEffect[];
    /** React children */
    children: React.ReactNode;
}
interface JitsiContextValue {
    connectionStatus: ConnectionStatus$1;
    conferenceStatus: ConferenceStatus;
    localTracks: JitsiLocalTrack[];
    localScreenTrack: JitsiLocalTrack | null;
    remoteTracks: Map<string, JitsiRemoteTrack[]>;
    participants: Map<string, Participant>;
    localParticipantId: string | null;
    localRole: 'moderator' | 'participant' | 'none';
    audioMuted: boolean;
    videoMuted: boolean;
    isScreenSharing: boolean;
    isMirrored: boolean;
    messages: ChatMessage[];
    unreadCount: number;
    captionsEnabled: boolean;
    captions: CaptionEntry[];
    isRecording: boolean;
    recordingSession: RecordingSession | null;
    noiseSuppressionEnabled: boolean;
    virtualBackground: VirtualBackgroundConfig | null;
    virtualBackgroundEffects: VirtualBackgroundEffect[];
    whiteboardActive: boolean;
    whiteboardData: WhiteboardData | null;
    polls: Poll[];
    activePoll: Poll | null;
    connection: JitsiConnection | null;
    conference: JitsiConference | null;
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
    setVirtualBackground: (config: VirtualBackgroundConfig | null) => Promise<void>;
    removeVirtualBackground: () => Promise<void>;
    setNoiseSuppression: (effect: TrackEffect | null) => Promise<void>;
    toggleNoiseSuppression: () => Promise<void>;
    sendMessage: (text: string, to?: string) => void;
    sendPrivateMessage: (text: string, participantId: string) => void;
    clearMessages: () => void;
    markMessagesRead: () => void;
    toggleCaptions: () => void;
    clearCaptions: () => void;
    startRecording: (options: RecordingOptions) => Promise<void>;
    stopRecording: () => Promise<void>;
    toggleWhiteboard: () => void;
    getWhiteboardData: () => WhiteboardData | null;
    sendWhiteboardData: (data: WhiteboardData) => void;
    onWhiteboardData: (handler: (data: WhiteboardData) => void) => () => void;
    createPoll: (question: string, options: string[]) => void;
    votePoll: (pollId: string, optionIndex: number) => void;
    closePoll: (pollId: string) => void;
    setVideoQuality: (maxHeight: number) => void;
    setSenderQuality: (maxHeight: number) => Promise<void>;
    setMaxVisibleParticipants: (n: number) => void;
    kickParticipant: (id: string, reason?: string) => void;
    muteParticipant: (id: string, mediaType?: 'audio' | 'video') => void;
    grantModerator: (id: string) => void;
    muteAll: (mediaType?: 'audio' | 'video') => void;
}

declare function JitsiProvider({ domain, roomName, userInfo, token, tenant, serviceUrl: serviceUrlProp, connectionOptions: connectionOptionsProp, configOverwrite, autoJoin, devices, onConferenceJoined, onConferenceLeft, onParticipantJoined, onParticipantLeft, onMessageReceived, onError, onConnectionStatusChanged, virtualBackgroundEffects, children, }: JitsiProviderProps): react_jsx_runtime.JSX.Element;

/**
 * Public hook to access the Jitsi conference state and actions.
 *
 * Must be used within a <JitsiProvider>.
 *
 * @example
 * ```tsx
 * function CustomControl() {
 *   const { audioMuted, toggleAudio, participants } = useJitsi();
 *   return (
 *     <button onClick={toggleAudio}>
 *       {audioMuted ? '🔇 Unmute' : '🔊 Mute'}
 *     </button>
 *   );
 * }
 * ```
 */
declare function useJitsi(): JitsiContextValue;

interface JitsiMeetingProps extends Omit<JitsiProviderProps, 'children'> {
    /** Meeting title displayed in the header */
    title?: string;
    /** Height of the meeting container (default: '100vh') */
    height?: string;
    /** Show sidebar with participants and chat (default: true) */
    showSidebar?: boolean;
    /** Show settings button (default: true) */
    showSettings?: boolean;
    /** Component to render inside the grid when the whiteboard is active */
    whiteboardComponent?: React.ReactNode;
}
/**
 * A pre-built, fully-featured meeting UI that uses all SDK components.
 * Great for quick testing, demos, or as a starting point for customization.
 *
 * @example
 * ```tsx
 * import { JitsiMeeting } from '@gbielbarbosa/react-jitsi';
 * import "@gbielbarbosa/react-jitsi/styles.css";
 *
 * function App() {
 *   return (
 *     <JitsiMeeting
 *       domain="8x8.vc"
 *       roomName="my-test-room"
 *       userInfo={{ displayName: 'Test User' }}
 *       title="Team Standup"
 *     />
 *   );
 * }
 * ```
 */
declare function JitsiMeeting({ title, height, showSidebar, showSettings, whiteboardComponent, ...providerProps }: JitsiMeetingProps): react_jsx_runtime.JSX.Element;

interface SlotProps extends React$1.HTMLAttributes<HTMLElement> {
    children: React$1.ReactElement;
}
/**
 * Slot component for the `asChild` pattern.
 *
 * Instead of rendering its own DOM element, it clones the child element
 * and merges the Slot's props into it. This allows transferring behavior
 * (onClick, aria-*, data-*, etc.) to a custom child element.
 *
 * Inspired by Radix UI's Slot primitive.
 *
 * @example
 * ```tsx
 * <Slot onClick={handleClick} aria-pressed={true}>
 *   <button className="custom">Click me</button>
 * </Slot>
 * // Renders: <button className="custom" onClick={handleClick} aria-pressed={true}>Click me</button>
 * ```
 */
declare function Slot({ children, ...slotProps }: SlotProps): React$1.ReactElement<unknown, string | React$1.JSXElementConstructor<any>> | null;

interface LocalVideoProps {
    className?: string;
    style?: React$1.CSSProperties;
    /** Override the mirrored state from context (default: uses context isMirrored) */
    mirror?: boolean;
    muted?: boolean;
    showPlaceholder?: boolean;
    objectFit?: 'cover' | 'contain';
    children?: React$1.ReactNode;
}
/**
 * Renders the local video track.
 * Mirror state is controlled by context (via ToggleMirror) unless overridden with `mirror` prop.
 *
 * The `<video>` element is always rendered (never unmounted) to keep the track attached.
 * When the video is muted, it's hidden and a placeholder avatar is shown on top.
 */
declare function LocalVideo({ className, style, mirror, muted, showPlaceholder, objectFit, children }: LocalVideoProps): react_jsx_runtime.JSX.Element;

interface RemoteVideosProps {
    /** CSS class name for the container */
    className?: string;
    /** Inline styles for the container */
    style?: React$1.CSSProperties;
    /**
     * Custom render function for each participant.
     * If not provided, a default tile is rendered.
     */
    renderParticipant?: (participant: Participant, videoRef: React$1.RefObject<HTMLVideoElement | null>, audioRef: React$1.RefObject<HTMLAudioElement | null>, tracks: JitsiRemoteTrack[]) => React$1.ReactNode;
}
/**
 * Renders all remote participants' video and audio tracks.
 *
 * @example
 * ```tsx
 * // Default rendering
 * <RemoteVideos />
 *
 * // Custom rendering
 * <RemoteVideos
 *   renderParticipant={(participant, videoRef, audioRef) => (
 *     <div className="my-tile">
 *       <video ref={videoRef} autoPlay playsInline />
 *       <audio ref={audioRef} autoPlay />
 *       <span>{participant.displayName}</span>
 *     </div>
 *   )}
 * />
 * ```
 */
declare function RemoteVideos({ className, style, renderParticipant, }: RemoteVideosProps): react_jsx_runtime.JSX.Element | null;

interface VideoLayoutProps {
    className?: string;
    style?: React$1.CSSProperties;
    /** Component to render inside the grid when the whiteboard is active */
    whiteboardComponent?: React$1.ReactNode;
}
declare function VideoLayout({ className, style, whiteboardComponent }: VideoLayoutProps): react_jsx_runtime.JSX.Element;

/**
 * Invisible component that manages audio playback for all remote participants.
 *
 * This ensures that remote audio plays even if you are not using <RemoteVideos>.
 * If you are already using <RemoteVideos>, this component is not needed
 * as <RemoteVideos> handles audio attachment internally.
 *
 * @example
 * ```tsx
 * <JitsiProvider domain="8x8.vc" roomName="my-room">
 *   <AudioTrack />
 *   <LocalVideo />
 *   {/* remote audio will play even without RemoteVideos *\/}
 * </JitsiProvider>
 * ```
 */
declare function AudioTrack(): null;

interface ToggleAudioProps {
    /** CSS class name */
    className?: string;
    /** Inline styles */
    style?: React$1.CSSProperties;
    /**
     * When true, merges behavior into the child element instead of rendering
     * a default button. The child receives onClick, data-state, aria-label, and title.
     */
    asChild?: boolean;
    /**
     * Custom render function. Receives muted state and toggle handler.
     */
    children?: React$1.ReactElement | ((muted: boolean, toggle: () => Promise<void>) => React$1.ReactNode);
}
/**
 * Toggle microphone mute/unmute.
 *
 * @example
 * ```tsx
 * <ToggleAudio />
 *
 * <ToggleAudio asChild>
 *   <button className="my-btn">🎤</button>
 * </ToggleAudio>
 * ```
 */
declare function ToggleAudio({ className, style, asChild, children }: ToggleAudioProps): react_jsx_runtime.JSX.Element;

interface ToggleVideoProps {
    className?: string;
    style?: React$1.CSSProperties;
    asChild?: boolean;
    children?: React$1.ReactElement | ((muted: boolean, toggle: () => Promise<void>) => React$1.ReactNode);
}
declare function ToggleVideo({ className, style, asChild, children }: ToggleVideoProps): react_jsx_runtime.JSX.Element;

interface LeaveButtonProps {
    className?: string;
    style?: React$1.CSSProperties;
    label?: string;
    confirmBeforeLeave?: boolean;
    confirmMessage?: string;
    onLeave?: () => void;
    asChild?: boolean;
    children?: React$1.ReactElement | ((leave: () => Promise<void>) => React$1.ReactNode);
}
declare function LeaveButton({ className, style, label, confirmBeforeLeave, confirmMessage, onLeave, asChild, children }: LeaveButtonProps): react_jsx_runtime.JSX.Element;

interface ScreenShareButtonProps {
    className?: string;
    style?: React$1.CSSProperties;
    /** Max frame rate for screen share */
    frameRate?: number;
    asChild?: boolean;
    children?: React$1.ReactElement | ((isSharing: boolean, toggle: () => Promise<void>) => React$1.ReactNode);
}
declare function ScreenShareButton({ className, style, frameRate, asChild, children }: ScreenShareButtonProps): react_jsx_runtime.JSX.Element;

interface DeviceSelectorProps {
    /** Filter by device kind */
    kind?: 'audioinput' | 'videoinput' | 'audiooutput';
    /** CSS class name */
    className?: string;
    /** Inline styles */
    style?: React$1.CSSProperties;
    /** Label to display before the selector */
    label?: string;
    /**
     * Custom render function. Receives devices list and a handler.
     */
    children?: (devices: MediaDeviceInfo[], selectDevice: (deviceId: string) => Promise<void>, selectedDeviceId: string | undefined) => React$1.ReactNode;
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
declare function DeviceSelector({ kind, className, style, label, children, }: DeviceSelectorProps): react_jsx_runtime.JSX.Element;

interface AudioOutputSelectorProps {
    className?: string;
    style?: React$1.CSSProperties;
    label?: string;
    children?: (devices: MediaDeviceInfo[], select: (id: string) => Promise<void>, selectedId: string | undefined) => React$1.ReactNode;
}
/**
 * Dropdown to select audio output device (speaker/headphones).
 */
declare function AudioOutputSelector({ className, style, label, children }: AudioOutputSelectorProps): react_jsx_runtime.JSX.Element;

interface ToggleMirrorProps {
    className?: string;
    style?: React$1.CSSProperties;
    asChild?: boolean;
    children?: React$1.ReactElement | ((isMirrored: boolean, toggle: () => void) => React$1.ReactNode);
}
/**
 * Toggle local video mirror on/off.
 */
declare function ToggleMirror({ className, style, asChild, children }: ToggleMirrorProps): react_jsx_runtime.JSX.Element;

interface VirtualBackgroundProps {
    className?: string;
    style?: React$1.CSSProperties;
    asChild?: boolean;
    children?: React$1.ReactElement | ((config: VirtualBackgroundConfig | null, set: (config: VirtualBackgroundConfig | null) => Promise<void>, remove: () => Promise<void>) => React$1.ReactNode);
}
/**
 * Virtual background toggle/control.
 *
 * This component provides the interface only. You must provide a
 * `TrackEffect` implementation via `setVirtualBackground({ type: 'custom', customEffect })`.
 *
 * @example
 * ```tsx
 * <VirtualBackground>
 *   {(config, set, remove) => (
 *     <div>
 *       <button onClick={() => set({ type: 'custom', customEffect: myBlurEffect })}>Blur</button>
 *       <button onClick={remove}>None</button>
 *     </div>
 *   )}
 * </VirtualBackground>
 * ```
 */
declare function VirtualBackground({ className, style, asChild, children }: VirtualBackgroundProps): react_jsx_runtime.JSX.Element;

interface VirtualBackgroundSelectorProps {
    className?: string;
    style?: React$1.CSSProperties;
    /** Component/Render prop for custom item rendering */
    children?: (effects: VirtualBackgroundEffect[], current: VirtualBackgroundConfig | null, set: (config: VirtualBackgroundConfig | null) => Promise<void>) => React$1.ReactNode;
}
/**
 * A component that renders the registered virtual background options.
 * It uses the `virtualBackgroundOptions` registered in the `JitsiProvider`.
 */
declare function VirtualBackgroundSelector({ className, style, children }: VirtualBackgroundSelectorProps): react_jsx_runtime.JSX.Element | null;

interface ToggleNoiseSuppressionProps {
    className?: string;
    style?: React$1.CSSProperties;
    asChild?: boolean;
    children?: React$1.ReactElement | ((enabled: boolean, setEffect: (effect: TrackEffect | null) => Promise<void>) => React$1.ReactNode);
}
/**
 * Toggle noise suppression on/off.
 *
 * This component provides the interface only. You must provide a
 * `TrackEffect` implementation via `setNoiseSuppression(effect)`.
 *
 * @example
 * ```tsx
 * <ToggleNoiseSuppression>
 *   {(enabled, setEffect) => (
 *     <button onClick={() => setEffect(enabled ? null : myNoiseEffect)}>
 *       {enabled ? '🔇 NS On' : '🔊 NS Off'}
 *     </button>
 *   )}
 * </ToggleNoiseSuppression>
 * ```
 */
declare function ToggleNoiseSuppression({ className, style, asChild, children }: ToggleNoiseSuppressionProps): react_jsx_runtime.JSX.Element;

interface ChatPanelProps {
    className?: string;
    style?: React$1.CSSProperties;
    /** Placeholder for the input (default: "Type a message...") */
    placeholder?: string;
    children?: (messages: ChatMessage[], send: (text: string) => void, unread: number) => React$1.ReactNode;
}
/**
 * Full chat panel with message list and input.
 */
declare function ChatPanel({ className, style, placeholder, children }: ChatPanelProps): react_jsx_runtime.JSX.Element;

interface ChatInputProps {
    className?: string;
    style?: React$1.CSSProperties;
    placeholder?: string;
    /** If set, sends private messages to this participant */
    privateTo?: string;
    children?: (text: string, setText: (v: string) => void, send: () => void) => React$1.ReactNode;
}
/**
 * Standalone chat input. Use alongside ChatMessages for custom layouts.
 */
declare function ChatInput({ className, style, placeholder, privateTo, children }: ChatInputProps): react_jsx_runtime.JSX.Element;

interface ChatMessagesProps {
    className?: string;
    style?: React$1.CSSProperties;
    renderMessage?: (message: ChatMessage) => React$1.ReactNode;
    children?: (messages: ChatMessage[]) => React$1.ReactNode;
}
/**
 * Standalone chat messages list. Use alongside ChatInput for custom layouts.
 */
declare function ChatMessages({ className, style, renderMessage, children }: ChatMessagesProps): react_jsx_runtime.JSX.Element;

interface ToggleChatProps {
    className?: string;
    style?: React$1.CSSProperties;
    asChild?: boolean;
    children?: React$1.ReactElement | ((isOpen: boolean, toggle: () => void, unread: number) => React$1.ReactNode);
}
/**
 * Toggle button for chat panel visibility. Manages open/close state internally.
 */
declare function ToggleChat({ className, style, asChild, children }: ToggleChatProps): react_jsx_runtime.JSX.Element;

interface CaptionsProps {
    className?: string;
    style?: React$1.CSSProperties;
    /** Max number of visible captions (default: 3) */
    maxVisible?: number;
    children?: (captions: CaptionEntry[], enabled: boolean) => React$1.ReactNode;
}
/**
 * Displays live captions/subtitles.
 * Requires Jigasi on the server.
 */
declare function Captions({ className, style, maxVisible, children }: CaptionsProps): react_jsx_runtime.JSX.Element | null;

interface ToggleCaptionsProps {
    className?: string;
    style?: React$1.CSSProperties;
    asChild?: boolean;
    children?: React$1.ReactElement | ((enabled: boolean, toggle: () => void) => React$1.ReactNode);
}
declare function ToggleCaptions({ className, style, asChild, children }: ToggleCaptionsProps): react_jsx_runtime.JSX.Element;

interface ToggleRecordingProps {
    className?: string;
    style?: React$1.CSSProperties;
    /** Recording mode (default: 'file') */
    mode?: 'file' | 'stream';
    /** Additional recording options */
    recordingOptions?: Omit<RecordingOptions, 'mode'>;
    asChild?: boolean;
    children?: React$1.ReactElement | ((isRecording: boolean, toggle: () => Promise<void>) => React$1.ReactNode);
}
/**
 * Toggle recording start/stop.
 * Requires moderator privilege and Jibri on the server.
 */
declare function ToggleRecording({ className, style, mode, recordingOptions, asChild, children }: ToggleRecordingProps): react_jsx_runtime.JSX.Element;

interface RecordingIndicatorProps {
    className?: string;
    style?: React$1.CSSProperties;
    children?: (isRecording: boolean) => React$1.ReactNode;
}
/**
 * Visual indicator when recording is active.
 * Renders nothing when not recording.
 */
declare function RecordingIndicator({ className, style, children }: RecordingIndicatorProps): react_jsx_runtime.JSX.Element | null;

interface WhiteboardProps {
    className?: string;
    style?: React$1.CSSProperties;
    /**
     * Callback fired when whiteboard data is received from other participants.
     * Use this to feed data into your external whiteboard library (e.g., Excalidraw, tldraw).
     */
    onDataReceived?: (data: WhiteboardData) => void;
    /**
     * Render prop giving full control.
     */
    children?: (isActive: boolean, getWhiteboardData: () => WhiteboardData | null, sendData: (data: WhiteboardData) => void, toggle: () => void) => React$1.ReactNode;
}
/**
 * Whiteboard component - provides the data synchronization layer via Jitsi data channels.
 *
 * This is an interface/hook only. Integrate with your preferred whiteboard library
 * (Excalidraw, tldraw, etc.) using the `sendData` and `onDataReceived` APIs.
 *
 * @example
 * ```tsx
 * <Whiteboard onDataReceived={(data) => {
 *     // Inform Excalidraw that the updateScene is from remote data, so the data will not be sent back.
 *     isRemoteUpdate.current = true;
 *
 *     excalidrawAPI?.updateScene({ elements: data.payload as any });
 *   }}>
 *   {(isActive, getData, sendData, toggle) => {
 *     if (!isActive) return null;
 *     return (
 *       <Excalidraw
 *         initialData={{ elements: getData()?.payload as any }}
 *         excalidrawAPI={(api) => setExcalidrawAPI(api)}
 *         onChange={(elements) => {
 *           // If the change was made remotely, we don't want to send it back.
 *           // This prevent Synchronization Feedback Loop.
 *           if (isRemoteUpdate.current) {
 *             isRemoteUpdate.current = false;
 *             return;
 *           }
 *           // Send your local drawings to the Jitsi room.
 *           sendData({ type: 'update', payload: elements });
 *         }}
 *       />
 *     );
 *   }}
 * </Whiteboard>
 * ```
 */
declare function Whiteboard({ className, style, onDataReceived, children }: WhiteboardProps): react_jsx_runtime.JSX.Element | null;

interface ToggleWhiteboardProps {
    className?: string;
    style?: React$1.CSSProperties;
    asChild?: boolean;
    children?: React$1.ReactElement | ((isActive: boolean, toggle: () => void) => React$1.ReactNode);
}
declare function ToggleWhiteboard({ className, style, asChild, children }: ToggleWhiteboardProps): react_jsx_runtime.JSX.Element;

interface PollCreatorProps {
    className?: string;
    style?: React$1.CSSProperties;
    /** Min options (default: 2) */
    minOptions?: number;
    /** Max options (default: 10) */
    maxOptions?: number;
    /** Called after poll is created */
    onCreated?: (poll: Poll) => void;
    children?: (create: (question: string, options: string[]) => void) => React$1.ReactNode;
}
/**
 * Form to create a new poll/voting.
 */
declare function PollCreator({ className, style, minOptions, maxOptions, onCreated, children }: PollCreatorProps): react_jsx_runtime.JSX.Element;

interface PollDisplayProps {
    className?: string;
    style?: React$1.CSSProperties;
    /** Specific poll to display. If omitted, all polls are shown. */
    poll?: Poll;
    children?: (poll: Poll | null, vote: (pollId: string, idx: number) => void, close: (pollId: string) => void) => React$1.ReactNode;
}
/**
 * Displays poll(s) with voting options and results.
 * Shows a specific poll if provided via `poll` prop, otherwise shows all polls.
 */
declare function PollDisplay({ className, style, poll: pollProp, children }: PollDisplayProps): react_jsx_runtime.JSX.Element;

interface TogglePollsProps {
    className?: string;
    style?: React$1.CSSProperties;
    asChild?: boolean;
    children?: React$1.ReactElement | ((isOpen: boolean, toggle: () => void, polls: Poll[]) => React$1.ReactNode);
}
declare function TogglePolls({ className, style, asChild, children }: TogglePollsProps): react_jsx_runtime.JSX.Element;

interface PerformanceSettingsProps {
    className?: string;
    style?: React$1.CSSProperties;
    children?: (setVideoQuality: (h: number) => void, setSenderQuality: (h: number) => Promise<void>, setMaxVisible: (n: number) => void) => React$1.ReactNode;
}
/**
 * Performance settings panel for video quality and visible participant limits.
 */
declare function PerformanceSettings({ className, style, children }: PerformanceSettingsProps): react_jsx_runtime.JSX.Element;

interface ConnectionStatusProps {
    /** CSS class name */
    className?: string;
    /** Inline styles */
    style?: React$1.CSSProperties;
    /**
     * Custom render function.
     */
    children?: (connectionStatus: ConnectionStatus$1, conferenceStatus: ConferenceStatus, participantCount: number) => React$1.ReactNode;
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
declare function ConnectionStatus({ className, style, children }: ConnectionStatusProps): react_jsx_runtime.JSX.Element;

interface ParticipantListProps {
    /** CSS class name */
    className?: string;
    /** Inline styles */
    style?: React$1.CSSProperties;
    /** Whether to include the local participant in the list (default: true) */
    includeLocal?: boolean;
    /**
     * Custom render function for each participant.
     */
    renderParticipant?: (participant: Participant) => React$1.ReactNode;
    /**
     * Custom render for the entire list.
     */
    children?: (participants: Participant[]) => React$1.ReactNode;
}
/**
 * Displays a list of all participants in the conference.
 *
 * @example
 * ```tsx
 * // Default list
 * <ParticipantList />
 *
 * // Custom participant rendering
 * <ParticipantList
 *   renderParticipant={(p) => (
 *     <div key={p.id}>{p.displayName} {p.audioMuted && '🔇'}</div>
 *   )}
 * />
 *
 * // Full custom render
 * <ParticipantList>
 *   {(participants) => (
 *     <ul>{participants.map(p => <li key={p.id}>{p.displayName}</li>)}</ul>
 *   )}
 * </ParticipantList>
 * ```
 */
declare function ParticipantList({ className, style, includeLocal, renderParticipant, children, }: ParticipantListProps): react_jsx_runtime.JSX.Element;

interface ConnectionIndicatorProps {
    participant: Participant;
    stats?: ParticipantStats;
    className?: string;
    style?: React$1.CSSProperties;
    /** Custom render function */
    children?: (status: string, bars: number, color: string, displayStats: ParticipantStats) => React$1.ReactNode;
}
/**
 * Displays an indicator of the participant's connection status (active, inactive, interrupted).
 * Shows detailed stats on hover.
 */
declare function ConnectionIndicator({ participant, stats, className, style, children }: ConnectionIndicatorProps): react_jsx_runtime.JSX.Element;

interface AdminControlsProps {
    /** The participant to control */
    participantId: string;
    className?: string;
    style?: React$1.CSSProperties;
    children?: (participant: Participant | undefined, actions: {
        kick: () => void;
        muteAudio: () => void;
        muteVideo: () => void;
        grantModerator: () => void;
    }) => React$1.ReactNode;
}
/**
 * Admin/moderator controls for a specific participant.
 * Only visible when the local user is a moderator.
 */
declare function AdminControls({ participantId, className, style, children }: AdminControlsProps): react_jsx_runtime.JSX.Element | null;

interface MuteAllButtonProps {
    className?: string;
    style?: React$1.CSSProperties;
    /** Media type to mute (default: 'audio') */
    mediaType?: 'audio' | 'video';
    asChild?: boolean;
    children?: React$1.ReactElement | ((muteAll: () => void) => React$1.ReactNode);
}
/**
 * Button to mute all participants. Only available for moderators.
 */
declare function MuteAllButton({ className, style, mediaType, asChild, children }: MuteAllButtonProps): react_jsx_runtime.JSX.Element | null;

declare const MicOnIcon: () => react_jsx_runtime.JSX.Element;
declare const MicOffIcon: () => react_jsx_runtime.JSX.Element;
/** Smaller variant for participant lists and overlays */
declare const MicMutedSmallIcon: ({ size }: {
    size?: number;
}) => react_jsx_runtime.JSX.Element;
declare const VideoOnIcon: () => react_jsx_runtime.JSX.Element;
declare const VideoOffIcon: () => react_jsx_runtime.JSX.Element;
/** Smaller variant for participant lists and overlays */
declare const VideoMutedSmallIcon: ({ size }: {
    size?: number;
}) => react_jsx_runtime.JSX.Element;
/** Mute overlay icon used on remote video tiles */
declare const MicMutedOverlayIcon: () => react_jsx_runtime.JSX.Element;
declare const ScreenShareIcon: () => react_jsx_runtime.JSX.Element;
declare const StopShareIcon: () => react_jsx_runtime.JSX.Element;
declare const PhoneOffIcon: () => react_jsx_runtime.JSX.Element;
declare const ChatIcon: () => react_jsx_runtime.JSX.Element;
declare const MirrorIcon: () => react_jsx_runtime.JSX.Element;
declare const RecordIcon: () => react_jsx_runtime.JSX.Element;
declare const StopRecordIcon: () => react_jsx_runtime.JSX.Element;
declare const CaptionsIcon: () => react_jsx_runtime.JSX.Element;
declare const PollIcon: () => react_jsx_runtime.JSX.Element;
declare const NoiseIcon: () => react_jsx_runtime.JSX.Element;
declare const WhiteboardIcon: () => react_jsx_runtime.JSX.Element;
declare const BackgroundIcon: () => react_jsx_runtime.JSX.Element;
declare const EmptyRoomIcon: () => react_jsx_runtime.JSX.Element;
declare const Pin: () => react_jsx_runtime.JSX.Element;
declare const PinOverlay: () => react_jsx_runtime.JSX.Element;
declare const PinOff: () => react_jsx_runtime.JSX.Element;
declare const Grid: () => react_jsx_runtime.JSX.Element;
declare const GridOff: () => react_jsx_runtime.JSX.Element;
declare const Fullscreen: () => react_jsx_runtime.JSX.Element;
declare const FullscreenExit: () => react_jsx_runtime.JSX.Element;
declare const MoreHorizontal: () => react_jsx_runtime.JSX.Element;
declare const MoreVertical: () => react_jsx_runtime.JSX.Element;
declare const Settings: () => react_jsx_runtime.JSX.Element;

export { AdminControls, AudioOutputSelector, AudioTrack, BackgroundIcon, type CaptionEntry, Captions, CaptionsIcon, ChatIcon, ChatInput, type ChatMessage, ChatMessages, ChatPanel, type ConferenceOptions, type ConferenceStatus, ConnectionIndicator, type ConnectionOptions, ConnectionStatus, type ConnectionStatus$1 as ConnectionStatusType, DeviceSelector, EmptyRoomIcon, Fullscreen, FullscreenExit, Grid, GridOff, type JitsiConference, type JitsiConnection, type JitsiContextValue, type JitsiLocalTrack, JitsiMeeting, JitsiProvider, type JitsiProviderProps, type JitsiRemoteTrack, type JitsiTrack, LeaveButton, LocalVideo, MicMutedOverlayIcon, MicMutedSmallIcon, MicOffIcon, MicOnIcon, MirrorIcon, MoreHorizontal, MoreVertical, MuteAllButton, NoiseIcon, type Participant, ParticipantList, type ParticipantStats, ParticipantStatsPanel, type ParticipantStatsPanelProps, PerformanceSettings, PhoneOffIcon, Pin, PinOff, PinOverlay, type Poll, PollCreator, PollDisplay, PollIcon, type PollOption, RecordIcon, RecordingIndicator, type RecordingOptions, type RecordingSession, RemoteVideos, ScreenShareButton, ScreenShareIcon, type ScreenShareOptions, Settings, Slot, StopRecordIcon, StopShareIcon, ToggleAudio, ToggleCaptions, ToggleChat, ToggleMirror, ToggleNoiseSuppression, TogglePolls, ToggleRecording, ToggleVideo, ToggleWhiteboard, type TrackEffect, type TrackInfo, type UserInfo, VideoLayout, VideoMutedSmallIcon, VideoOffIcon, VideoOnIcon, VirtualBackground, type VirtualBackgroundConfig, VirtualBackgroundSelector, type VirtualBackgroundType, Whiteboard, type WhiteboardData, WhiteboardIcon, useJitsi };
