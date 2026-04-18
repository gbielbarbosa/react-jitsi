// ---------------------------------------------------------------------------
// jitsi-react — Composable React SDK for Jitsi Meet
// ---------------------------------------------------------------------------

// Styles (consumers must import this for default component styling)
import './styles.css';

// Core
export { JitsiProvider } from './JitsiProvider';
export { useJitsi } from './useJitsi';

// Pre-built meeting UI
export { JitsiMeeting } from './components/JitsiMeeting';

// Utility
export { Slot } from './utils/Slot';

// Media components
export { LocalVideo } from './components/LocalVideo';
export { RemoteVideos } from './components/RemoteVideos';
export { AudioTrack } from './components/AudioTrack';

// Control components
export { ToggleAudio } from './components/ToggleAudio';
export { ToggleVideo } from './components/ToggleVideo';
export { LeaveButton } from './components/LeaveButton';
export { ScreenShareButton } from './components/ScreenShareButton';
export { DeviceSelector } from './components/DeviceSelector';
export { AudioOutputSelector } from './components/AudioOutputSelector';
export { ToggleMirror } from './components/ToggleMirror';

// Virtual background & effects
export { VirtualBackground } from './components/VirtualBackground';
export { ToggleNoiseSuppression } from './components/ToggleNoiseSuppression';

// Chat
export { ChatPanel } from './components/ChatPanel';
export { ChatInput } from './components/ChatInput';
export { ChatMessages } from './components/ChatMessages';
export { ToggleChat } from './components/ToggleChat';

// Captions
export { Captions } from './components/Captions';
export { ToggleCaptions } from './components/ToggleCaptions';

// Recording
export { ToggleRecording } from './components/ToggleRecording';
export { RecordingIndicator } from './components/RecordingIndicator';

// Whiteboard
export { Whiteboard } from './components/Whiteboard';
export { ToggleWhiteboard } from './components/ToggleWhiteboard';

// Polls
export { PollCreator } from './components/PollCreator';
export { PollDisplay } from './components/PollDisplay';
export { TogglePolls } from './components/TogglePolls';

// Performance
export { PerformanceSettings } from './components/PerformanceSettings';

// Status components
export { ConnectionStatus } from './components/ConnectionStatus';
export { ParticipantList } from './components/ParticipantList';

// Admin
export { AdminControls } from './components/AdminControls';
export { MuteAllButton } from './components/MuteAllButton';
// Icons (re-exported for consumers building custom UIs)
export * from './icons';

// Types
export type {
  JitsiProviderProps,
  JitsiContextValue,
  Participant,
  TrackInfo,
  UserInfo,
  ConnectionStatus as ConnectionStatusType,
  ConferenceStatus,
  ConnectionOptions,
  ConferenceOptions,
  JitsiLocalTrack,
  JitsiRemoteTrack,
  JitsiTrack,
  JitsiConference,
  JitsiConnection,
  TrackEffect,
  ChatMessage,
  CaptionEntry,
  Poll,
  PollOption,
  RecordingOptions,
  RecordingSession,
  VirtualBackgroundType,
  VirtualBackgroundConfig,
  WhiteboardData,
  ScreenShareOptions,
} from './types';
