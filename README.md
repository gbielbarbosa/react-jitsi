# react-jitsi

**A composable React SDK for Jitsi Meet with full UI customization**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

Build custom video conferencing interfaces with composable React components.  
Every component is independent, stylable, and supports the **`asChild`** or Render Prop pattern.

---

## Features

- **Compound Components** - `<JitsiProvider>` manages the connection, child components plug in freely
- **Full Customization** - Default dark theme, `className`/`style` overrides, render props, or `asChild`
- **30+ Components** - Video, audio, chat, recording, polls, screen share, admin, performance, and more
- **`asChild` Pattern** - Transfer behavior to your own elements (Radix UI-inspired)
- **`useJitsi()` Hook** - Full access to state & actions for headless implementations
- **Pre-built UI** - `<JitsiMeeting>` component for instant, zero-config meetings

---

## Installation

```bash
npm install @gbielbarbosa/react-jitsi
```

If you want to use the default UI styles, import the CSS file in your app's entry point:

```tsx
import '@gbielbarbosa/react-jitsi/styles.css';
```

These examples use JaaS domain, if you are self-hosting Jitsi, you should replace "8x8.vc" with your domain.

Add the lib-jitsi-meet script to your HTML:

```html
<script src="https://8x8.vc/libs/lib-jitsi-meet.min.js"></script>
```

> **Peer dependencies:** `react` => 18, `react-dom` => 18

---

## Quick Start

JaaS always requires a JWT when using lib-jitsi-meet directly. The "allow anonymous guests" feature only works with the IFrame API.

### Option 1: Pre-built Meeting UI

Zero-config, full-featured meeting interface:

```tsx
import { JitsiMeeting } from '@gbielbarbosa/react-jitsi';
import '@gbielbarbosa/react-jitsi/styles.css';

function App() {
  return (
    <JitsiMeeting
      domain="8x8.vc"
      tenant="meet" // App ID
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
import '@gbielbarbosa/react-jitsi/styles.css';

function MyMeeting() {
  return (
    <JitsiProvider
      domain="8x8.vc"
      tenant="meet" // App ID
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

## Customization: `asChild` and Render Props

### `asChild` Pattern (Buttons)

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

### Render Props (Complex Components)

For more complex components that do not support `asChild` (such as lists, panels, and selectors), you can fully customize their rendering by passing a function as `children` (render prop pattern). The function will receive the necessary state and handlers.

```tsx
<DeviceSelector kind="audioinput">
  {(devices, selectDevice, selectedId) => (
    <div className="my-custom-dropdown">
      {devices.map(d => (
        <button 
          key={d.deviceId} 
          onClick={() => selectDevice(d.deviceId)}
          className={selectedId === d.deviceId ? 'active' : ''}
        >
          {d.label}
        </button>
      ))}
    </div>
  )}
</DeviceSelector>
```


---

## API Reference

### Core

| Export | Description |
|---|---|
| `<JitsiProvider>` | Root component - manages connection, conference, tracks, and all state |
| `<JitsiMeeting>` | Pre-built, full-featured meeting UI (wraps JitsiProvider) |
| `useJitsi()` | Hook to access all state and actions |
| `<Slot>` | Utility for the `asChild` pattern |

### Media Components

| Component | Description |
|---|---|
| `<LocalVideo>` | Local camera video with mirror support and avatar placeholder |
| `<RemoteVideos>` | Grid of remote participant videos with render props |
| `<AudioTrack>` | Invisible component managing remote audio playback |
| `<VideoLayout>` | Component to manage Remote and Local video layout |

### Control Components

| Component | Customization | Description |
|---|---|---|
| `<ToggleAudio>` | `asChild`, Render Prop | Mute/unmute microphone |
| `<ToggleVideo>` | `asChild`, Render Prop | Toggle camera on/off |
| `<LeaveButton>` | `asChild`, Render Prop | Leave the meeting (with optional confirmation) |
| `<ScreenShareButton>` | `asChild`, Render Prop | Start/stop screen sharing (with `frameRate` prop) |
| `<ToggleMirror>` | `asChild`, Render Prop | Toggle local video mirroring |
| `<DeviceSelector>` | Render Prop | Dropdown for camera/microphone selection |
| `<AudioOutputSelector>` | Render Prop | Dropdown for speaker/headphone selection |

### Chat

| Component | Customization | Description |
|---|---|---|
| `<ChatPanel>` | Render Prop | Full chat UI with messages and input |
| `<ChatInput>` | Render Prop | Standalone chat input (for custom layouts) |
| `<ChatMessages>` | Render Prop | Standalone message list (for custom layouts) |
| `<ToggleChat>` | `asChild`, Render Prop | Toggle button with unread badge |

### Captions

| Component | Customization | Description |
|---|---|---|
| `<Captions>` | Render Prop | Live subtitle overlay (requires Jigasi) |
| `<ToggleCaptions>` | `asChild`, Render Prop | Toggle captions on/off |

### Recording

| Component | Customization | Description |
|---|---|---|
| `<ToggleRecording>` | `asChild`, Render Prop | Start/stop recording (requires Jibri + moderator) |
| `<RecordingIndicator>` | Render Prop | Pulsing "REC" indicator (auto-hides) |

### Effects (Interface Only)

| Component | Customization | Description |
|---|---|---|
| `<VirtualBackground>` | `asChild`, Render Prop | Interface for custom `TrackEffect` virtual backgrounds |
| `<ToggleNoiseSuppression>` | `asChild`, Render Prop | Interface for custom `TrackEffect` noise suppression |

### Whiteboard (Interface Only)

| Component | Customization | Description |
|---|---|---|
| `<Whiteboard>` | Render Prop | Data sync layer for external whiteboard libs (Excalidraw, tldraw) |
| `<ToggleWhiteboard>` | `asChild`, Render Prop | Toggle whiteboard visibility |

### Polls

| Component | Customization | Description |
|---|---|---|
| `<PollCreator>` | Render Prop | Form to create new polls |
| `<PollDisplay>` | Render Prop | Poll results with voting |
| `<TogglePolls>` | `asChild`, Render Prop | Toggle button with active poll badge |

### Performance & Admin

| Component | Customization | Description |
|---|---|---|
| `<PerformanceSettings>` | Render Prop | Video quality and lastN controls |
| `<ConnectionStatus>` | Render Prop | Connection status indicator with dot |
| `<ConnectionIndicator>` | Render Prop | Signal bars indicator (active, inactive, interrupted) |
| `<ParticipantStatsPanel>` | Render Prop | Detailed network, resolution and framerate statistics panel |
| `<ParticipantList>` | Render Prop | Full participant list with avatars and status |
| `<AdminControls>` | Render Prop | Moderator controls for a participant (kick, mute, promote) |
| `<MuteAllButton>` | `asChild`, Render Prop | Mute all participants (moderator only) |

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
  whiteboardData,     // WhiteboardData | null

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
  getWhiteboardData,
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

Create a wrapper to integrate the Excalidraw with the Whiteboard component, then pass that wrapper component to the `<JitsiMeeting>` or `<VideoLayout>` using the `whiteboardComponent` property, or render it anywhere in your UI.

```tsx
function ExcalidrawWrapper() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
  const isRemoteUpdate = useRef(false);

  return (
    <Whiteboard onDataReceived={(data) => {
      isRemoteUpdate.current = true;
      excalidrawAPI?.updateScene({ elements: data.payload as any });
    }}>
      {(isActive, getData, sendData, toggle) => {
        if (!isActive) return null;
        return (
          <Excalidraw
            initialData={{ elements: getData()?.payload as any }}
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            onChange={(elements) => {
              // Send your new drawings to the Jitsi room.
              if (isRemoteUpdate.current) {
                isRemoteUpdate.current = false;
                return;
              }

              sendData({ type: 'update', payload: elements });
            }}
          />
        );
      }}
    </Whiteboard>
  );
}
```

---

## `<JitsiProvider>` Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `domain` | `string` | required | Jitsi server domain |
| `roomName` | `string` | required | Conference room name |
| `userInfo` | `{ displayName?, email?, avatarUrl? }` | - | User information |
| `token` | `string \| null` | `null` | JWT authentication token |
| `configOverwrite` | `ConferenceOptions` | - | Override conference config |
| `autoJoin` | `boolean` | `true` | Auto-join on mount |
| `devices` | `('audio' \| 'video')[]` | `['audio', 'video']` | Devices to request |
| `onConferenceJoined` | `() => void` | - | Called when joined |
| `onConferenceLeft` | `() => void` | - | Called when left |
| `onParticipantJoined` | `(p: Participant) => void` | - | Called when someone joins |
| `onParticipantLeft` | `(id: string) => void` | - | Called when someone leaves |
| `onMessageReceived` | `(msg: ChatMessage) => void` | - | Called on new chat message |
| `onError` | `(err: Error) => void` | - | Error handler |
| `onConnectionStatusChanged` | `(status) => void` | - | Connection status change |

---

## Architecture

```
JitsiProvider (Context + State Management)
  ├── useReducer - Predictable state with typed actions
  ├── JitsiConnection - WebSocket to Jitsi server
  ├── JitsiConference - XMPP room management
  ├── Local Tracks - Camera, microphone, screen share
  └── Event Listeners - Track, participant, chat, recording events

Components (Consumer Layer)
  ├── Media - LocalVideo, RemoteVideos, AudioTrack, VideoLayout, VideoControlsOverlay
  ├── Controls - Toggle, LeaveButton, DeviceSelector, ScreenShare
  ├── Chat - ChatPanel, ChatInput, ChatMessages
  ├── Status - ConnectionStatus, ConnectionIndicator, ParticipantStatsPanel, ParticipantList, RecordingIndicator
  ├── Collaboration - Whiteboard, PollCreator, PollDisplay, Captions
  └── Admin - AdminControls, MuteAllButton
```

---

## Server Requirements

| Feature | Server Component | Notes |
|---|---|---|
| Basic conferencing | Jitsi Meet | It doesn't work with `meet.jit.si` |
| Recording | Jibri | Self-hosted only |
| Captions/Transcription | Jigasi | + Speech-to-text service |
| Noise Suppression | - | Client-side only |
| Virtual Backgrounds | - | Client-side only |

---

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
