# Changelog

All notable changes to `react-jitsi` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), 
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.2] - 2026-04-27

### ADDED

- Added `<VirtualBackgroundSelector>` component to render the available effects
- Added `VirtualBackgroundEffect` type

### MODIFIED

- `<JitsiMeeting>` and `<JitsiProvider>` now have the `virtualBackgroundEffects` property to allow the addition of default effects
- `VirtualBackgroundType` no longer has the `none` option, to remove the effect, simply call the `removeVirtualBackground` or `setVirtualBackground` function with the null parameter.
- Renamed `customEffect` to `effect` in `VirtualBackgroundConfig` type, and now is required property

## [0.3.1] - 2026-04-27

### FIXED

- Fixed `<VideoControlsOverlay>` overlay issue on the Whiteboard canvas. If the participant is the fake one created for the whiteboard, it only returns the action buttons. The overlay is rendered using the HoverCard in the VideoLayout on top of the whiteboard tile
- Fixed an issue with the positioning of the `<LocalVideo>` floating tile when the container is resized
- Fixed an issue when opening `<Whiteboard>` in a room with only yourself
- Fixed an issue that occurred when creating a poll in a room with only yourself
- Fixed an issue where `<Whiteboard>` was not persisting the payload between renders, it now has a handshake to synchronize existing data with new participants

## [0.3.0] - 2026-04-26

### ADDED

- New `<VideoLayout>` component to manage Remote and Local video layout
- `calculateGridSettings` calculates the optimal grid layout
- Allow multiple video pinning
- Cut or show the original video resolution
- Whiteboard tile on `<VideoLayout>`

### MODIFIED

- `<JitsiMeeting>` sidebar is now closed by default
- `<ToggleMirror>` is no longer a button by default, it's now a checkbox
- `<JitsiMeeting>` and `<VideoLayout>` now have the `whiteboardComponent` property for implementation Whiteboard in the layout
- `<Whiteboard>` example improvements
- Improvements to the standard design

### FIXED

- Chat and poll buttons not closing the sidebar on `<JitshMeeting>`
- Fixed issues with Whiteboard synchronization

## [0.2.0] - 2026-04-25

### ADDED

- The `stats` property has been added to the `Participant` object, containing some connection statistics
- `<ConnectionIndicator>` Participant connection status indicator
- `<ParticipantStatsPanel>` Participant connection statistics panel

### MODIFIED

- Improvements to the standard design

### FIXED

- Mismatches in some components classes
- List of participants not showing admin controls
- Empty room label shown even with participants present


## [0.1.1] - 2026-04-18

### ADDED

- **Compound Components** - `<JitsiProvider>` manages the connection, child components plug in freely
- **30+ Components** - Video, audio, chat, recording, polls, screen share, admin, performance, and more
- **Pre-built UI** - `<JitsiMeeting>` component for instant, zero-config meetings
- **Full Customization** - Default dark theme, `className`/`style` overrides, render props, or `asChild`