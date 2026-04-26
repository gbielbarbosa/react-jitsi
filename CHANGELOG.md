# Changelog

All notable changes to `stdnum-php` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), 
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-04-25

### ADDED

- The `stats` property has been added to the `Participant` object, containing some connection statistics.
- <ConnectionIndicator> Participant connection status indicator
- <ParticipantStatsPanel> Participant connection statistics panel

### MODIFIED

- Improvements to the standard design

### FIXED

- Mismatches in some components classes
- List of participants not showing admin controls
- Empty room label shown even with participants present


## [0.1.1] - 2026-04-18

### ADDED

- **Compound Components** - <JitsiProvider> manages the connection, child components plug in freely
- **30+ Components** - Video, audio, chat, recording, polls, screen share, admin, performance, and more
- **Pre-built UI** - <JitsiMeeting> component for instant, zero-config meetings
- **Full Customization** - Default dark theme, `className`/`style` overrides, render props, or `asChild`