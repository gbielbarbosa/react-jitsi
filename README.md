<div align="center">

# react-jitsi

**A composable React SDK for Jitsi Meet with full UI customization**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

Build custom video conferencing interfaces with composable React components.  
Every component is independent, stylable, and supports the **`asChild`** pattern.

</div>

---

## Features

- **Compound Components** — `<JitsiProvider>` manages the connection, child components plug in freely
- **Full Customization** — Default dark theme, `className`/`style` overrides, render props, or `asChild`
- **30+ Components** — Video, audio, chat, recording, polls, screen share, admin, performance, and more
- **`asChild` Pattern** — Transfer behavior to your own elements (Radix UI-inspired)
- **`useJitsi()` Hook** — Full access to state & actions for headless implementations
- **Pre-built UI** — `<JitsiMeeting>` component for instant, zero-config meetings
- **TypeScript** — Full type definitions with generics and JSDoc
- **Dual Output** — CJS + ESM + `.d.ts` declarations

---

## Installation

```bash
npm install @gbielbarbosa/react-jitsi
```

These examples use JaaS domain, if you are self-hosting Jitsi, you should replace 8x8.vc with your domain.

Add the lib-jitsi-meet script to your HTML:

```html
<script src="https://8x8.vc/libs/lib-jitsi-meet.min.js"></script>
```

> **Peer dependencies:** `react` ≥ 18, `react-dom` ≥ 18

---

## Quick Start

JaaS always requires a JWT when using lib-jitsi-meet directly. The "allow anonymous guests" feature only works with the IFrame API.

### Option 1: Pre-built Meeting UI

Zero-config, full-featured meeting interface:

```tsx
import { JitsiMeeting } from '@gbielbarbosa/react-jitsi';

function App() {
  return (
    <JitsiMeeting
      domain="8x8.vc"
      tenant="meeting" // App ID
      roomName="my-room"
      jwt="token"
      userInfo={{ displayName: 'Alice' }}
      title="Team Standup"
    />
  );
}
```

### Option 2: Composable Components

Build your own layout with individual components:

```tsx
import {
  JitsiProvider,
  LocalVideo,
  RemoteVideos,
  ToggleAudio,
  ToggleVideo,
  ScreenShareButton,
  LeaveButton,
  ConnectionStatus,
  ParticipantList,
  ChatPanel,
} from '@gbielbarbosa/react-jitsi';

function MyMeeting() {
  return (
    <JitsiProvider
      domain="8x8.vc"
      tenant="meeting" // App ID
      roomName="my-room"
      jwt="token"
      userInfo={{ displayName: 'Alice' }}
    >
      <header>
        <ConnectionStatus />
      </header>

      <main style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <RemoteVideos />
          <LocalVideo style={{ width: 240 }} />
        </div>
        <aside style={{ width: 300 }}>
          <ParticipantList />
          <ChatPanel />
        </aside>
      </main>

      <footer style={{ display: 'flex', gap: 8 }}>
        <ToggleAudio />
        <ToggleVideo />
        <ScreenShareButton />
        <LeaveButton label="Leave" />
      </footer>
    </JitsiProvider>
  );
}
```

### Option 3: Headless with `useJitsi()`

Full control with the hook:

```tsx
import { JitsiProvider, useJitsi } from '@gbielbarbosa/react-jitsi';

function CustomControls() {
  const {
    audioMuted, videoMuted, participants,
    toggleAudio, toggleVideo, sendMessage,
  } = useJitsi();

  return (
    <div>
      <button onClick={toggleAudio}>
        {audioMuted ? '🔇' : '🔊'} ({participants.size} in room)
      </button>
      <button onClick={toggleVideo}>
        {videoMuted ? '📷 Off' : '📷 On'}
      </button>
      <button onClick={() => sendMessage('Hello!')}>
        Say Hello
      </button>
    </div>
  );
}
```

---

## `asChild` Pattern

All button components support `asChild`. When enabled, the component transfers its behavior (click handlers, aria attributes, data-state) to your child element:

```tsx
// Default SDK button
<ToggleAudio />

// Your button, SDK behavior
<ToggleAudio asChild>
  <button className="my-custom-btn">
    <MyMicIcon /> Microphone
  </button>
</ToggleAudio>

// data-state can be used for CSS styling
<ToggleAudio asChild>
  <button className="toolbar-btn" />
</ToggleAudio>
```

```css
.toolbar-btn[data-state="muted"] {
  background: red;
}
.toolbar-btn[data-state="active"] {
  background: green;
}
```

**Components with `asChild`:** `ToggleAudio`, `ToggleVideo`, `LeaveButton`, `ScreenShareButton`, `ToggleMirror`, `ToggleCaptions`, `ToggleChat`, `ToggleRecording`, `ToggleWhiteboard`, `TogglePolls`, `ToggleNoiseSuppression`, `MuteAllButton`, `VirtualBackground`

---

## API Reference

### Core

| Export | Description |
|---|---|
| `<JitsiProvider>` | Root component — manages connection, conference, tracks, and all state |
| `<JitsiMeeting>` | Pre-built, full-featured meeting UI (wraps JitsiProvider) |
| `useJitsi()` | Hook to access all state and actions |
| `<Slot>` | Utility for the `asChild` pattern |

### Media Components

| Component | Description |
|---|---|
| `<LocalVideo>` | Local camera video with mirror support and avatar placeholder |
| `<RemoteVideos>` | Grid of remote participant videos with render props |
| `<AudioTrack>` | Invisible component managing remote audio playback |

### Control Components

| Component | `asChild` | Description |
|---|---|---|
| `<ToggleAudio>` | ✅ | Mute/unmute microphone |
| `<ToggleVideo>` | ✅ | Toggle camera on/off |
| `<LeaveButton>` | ✅ | Leave the meeting (with optional confirmation) |
| `<ScreenShareButton>` | ✅ | Start/stop screen sharing (with `frameRate` prop) |
| `<ToggleMirror>` | ✅ | Toggle local video mirroring |
| `<DeviceSelector>` | — | Dropdown for camera/microphone selection |
| `<AudioOutputSelector>` | — | Dropdown for speaker/headphone selection |

### Chat

| Component | `asChild` | Description |
|---|---|---|
| `<ChatPanel>` | — | Full chat UI with messages and input |
| `<ChatInput>` | — | Standalone chat input (for custom layouts) |
| `<ChatMessages>` | — | Standalone message list (for custom layouts) |
| `<ToggleChat>` | ✅ | Toggle button with unread badge |

### Captions

| Component | `asChild` | Description |
|---|---|---|
| `<Captions>` | — | Live subtitle overlay (requires Jigasi) |
| `<ToggleCaptions>` | ✅ | Toggle captions on/off |

### Recording

| Component | `asChild` | Description |
|---|---|---|
| `<ToggleRecording>` | ✅ | Start/stop recording (requires Jibri + moderator) |
| `<RecordingIndicator>` | — | Pulsing "REC" indicator (auto-hides) |

### Effects (Interface Only)

| Component | `asChild` | Description |
|---|---|---|
| `<VirtualBackground>` | ✅ | Interface for custom `TrackEffect` virtual backgrounds |
| `<ToggleNoiseSuppression>` | ✅ | Interface for custom `TrackEffect` noise suppression |

### Whiteboard (Interface Only)

| Component | `asChild` | Description |
|---|---|---|
| `<Whiteboard>` | — | Data sync layer for external whiteboard libs (Excalidraw, tldraw) |
| `<ToggleWhiteboard>` | ✅ | Toggle whiteboard visibility |

### Polls

| Component | `asChild` | Description |
|---|---|---|
| `<PollCreator>` | — | Form to create new polls |
| `<PollDisplay>` | — | Poll results with voting |
| `<TogglePolls>` | ✅ | Toggle button with active poll badge |

### Performance & Admin

| Component | `asChild` | Description |
|---|---|---|
| `<PerformanceSettings>` | — | Video quality and lastN controls |
| `<ConnectionStatus>` | — | Connection status indicator with dot |
| `<ParticipantList>` | — | Full participant list with avatars and status |
| `<AdminControls>` | — | Moderator controls for a participant (kick, mute, promote) |
| `<MuteAllButton>` | ✅ | Mute all participants (moderator only) |

---

## `useJitsi()` Hook

The hook provides access to the complete conference state and all actions:

```tsx
const {
  // State
  connectionStatus,   // 'disconnected' | 'connecting' | 'connected' | 'failed'
  conferenceStatus,   // 'none' | 'joining' | 'joined' | 'left' | 'error'
  localTracks,        // JitsiLocalTrack[]
  remoteTracks,       // Map<string, JitsiRemoteTrack[]>
  participants,       // Map<string, Participant>
  localParticipantId, // string | null
  localRole,          // 'moderator' | 'participant' | 'none'
  audioMuted,         // boolean
  videoMuted,         // boolean
  isScreenSharing,    // boolean
  isMirrored,         // boolean
  messages,           // ChatMessage[]
  unreadCount,        // number
  captionsEnabled,    // boolean
  captions,           // CaptionEntry[]
  isRecording,        // boolean
  polls,              // Poll[]
  activePoll,         // Poll | null
  virtualBackground,  // VirtualBackgroundConfig
  noiseSuppressionEnabled, // boolean
  whiteboardActive,   // boolean

  // Raw references
  connection,         // JitsiConnection | null
  conference,         // JitsiConference | null

  // Audio/Video Actions
  toggleAudio,
  toggleVideo,
  leave,
  startScreenShare,   // (options?: { frameRate?: number }) => Promise<void>
  stopScreenShare,
  setDisplayName,
  getDevices,
  switchCamera,
  switchMicrophone,
  setAudioOutput,
  toggleMirror,

  // Effects
  setVirtualBackground,
  removeVirtualBackground,
  setNoiseSuppression,

  // Chat
  sendMessage,        // (text, to?) => void
  sendPrivateMessage,
  clearMessages,
  markMessagesRead,

  // Captions
  toggleCaptions,
  clearCaptions,

  // Recording
  startRecording,     // (options: RecordingOptions) => Promise<void>
  stopRecording,

  // Whiteboard
  toggleWhiteboard,
  sendWhiteboardData,
  onWhiteboardData,   // (handler) => unsubscribe

  // Polls
  createPoll,         // (question, options[]) => void
  votePoll,           // (pollId, optionIndex) => void
  closePoll,

  // Performance
  setVideoQuality,    // (maxHeight) => void
  setSenderQuality,
  setMaxVisibleParticipants,

  // Admin (moderator only)
  kickParticipant,
  muteParticipant,
  grantModerator,
  muteAll,
} = useJitsi();
```

---

## Customization Examples

### Custom Video Layout

```tsx
<RemoteVideos
  renderParticipant={(participant, videoRef, audioRef, tracks) => (
    <div className="my-tile">
      <video ref={videoRef} autoPlay playsInline />
      <audio ref={audioRef} autoPlay />
      <span>{participant.displayName}</span>
      <AdminControls participantId={participant.id} />
    </div>
  )}
/>
```

### Virtual Background (with custom implementation)

```tsx
<VirtualBackground>
  {(config, set, remove) => (
    <div>
      <button onClick={() => set({
        type: 'custom',
        customEffect: myBlurEffect // Your TrackEffect implementation
      })}>
        Blur Background
      </button>
      <button onClick={remove}>Remove</button>
      <span>Current: {config.type}</span>
    </div>
  )}
</VirtualBackground>
```

### Whiteboard Integration (e.g., Excalidraw)

```tsx
<Whiteboard onDataReceived={(data) => excalidrawAPI.updateScene(data.payload)}>
  {(isActive, sendData, toggle) => (
    <>
      <button onClick={toggle}>
        {isActive ? 'Close' : 'Open'} Whiteboard
      </button>
      {isActive && (
        <Excalidraw
          onChange={(elements) => sendData({
            type: 'scene-update',
            payload: elements,
            senderId: '',
            timestamp: Date.now(),
          })}
        />
      )}
    </>
  )}
</Whiteboard>
```

---

## ⚙️ `<JitsiProvider>` Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `domain` | `string` | *required* | Jitsi server domain |
| `roomName` | `string` | *required* | Conference room name |
| `userInfo` | `{ displayName?, email?, avatarUrl? }` | — | User information |
| `token` | `string \| null` | `null` | JWT authentication token |
| `configOverwrite` | `ConferenceOptions` | — | Override conference config |
| `autoJoin` | `boolean` | `true` | Auto-join on mount |
| `devices` | `('audio' \| 'video')[]` | `['audio', 'video']` | Devices to request |
| `onConferenceJoined` | `() => void` | — | Called when joined |
| `onConferenceLeft` | `() => void` | — | Called when left |
| `onParticipantJoined` | `(p: Participant) => void` | — | Called when someone joins |
| `onParticipantLeft` | `(id: string) => void` | — | Called when someone leaves |
| `onMessageReceived` | `(msg: ChatMessage) => void` | — | Called on new chat message |
| `onError` | `(err: Error) => void` | — | Error handler |
| `onConnectionStatusChanged` | `(status) => void` | — | Connection status change |

---

## Architecture

```
JitsiProvider (Context + State Management)
  ├── useReducer → Predictable state with typed actions
  ├── JitsiConnection → WebSocket to Jitsi server
  ├── JitsiConference → XMPP room management
  ├── Local Tracks → Camera, microphone, screen share
  └── Event Listeners → Track, participant, chat, recording events

Components (Consumer Layer)
  ├── Media → LocalVideo, RemoteVideos, AudioTrack
  ├── Controls → Toggle*, LeaveButton, DeviceSelector, ScreenShare
  ├── Chat → ChatPanel, ChatInput, ChatMessages
  ├── Status → ConnectionStatus, ParticipantList, RecordingIndicator
  ├── Collaboration → Whiteboard, PollCreator, PollDisplay, Captions
  └── Admin → AdminControls, MuteAllButton
```

---

## Server Requirements

| Feature | Server Component | Notes |
|---|---|---|
| Basic conferencing | Jitsi Meet | Works with `meet.jit.si` |
| Recording | Jibri | Self-hosted only |
| Captions/Transcription | Jigasi | + Speech-to-text service |
| Noise Suppression | — | Client-side only |
| Virtual Backgrounds | — | Client-side only |

---

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
