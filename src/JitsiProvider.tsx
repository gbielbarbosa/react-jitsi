import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { JitsiContext } from './JitsiContext';
import type {
  JitsiMeetJSStatic,
  JitsiConnection,
  JitsiConference,
  JitsiLocalTrack,
  JitsiRemoteTrack,
  JitsiTrack,
  JitsiProviderProps,
  JitsiContextValue,
  ConnectionStatus,
  ConferenceStatus,
  Participant,
  ConnectionOptions,
  ConferenceOptions,
  ChatMessage,
  CaptionEntry,
  Poll,
  PollOption,
  RecordingOptions,
  RecordingSession,
  VirtualBackgroundConfig,
  ScreenShareOptions,
  TrackEffect,
  WhiteboardData,
  JitsiRoom,
} from './types';

// ---------------------------------------------------------------------------
// Retrieve the global JitsiMeetJS object
// ---------------------------------------------------------------------------

function getJitsiMeetJS(): JitsiMeetJSStatic {
  const g = typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : undefined;
  if (!g || !g['JitsiMeetJS']) {
    // Check if the user loaded the IFrame API instead of lib-jitsi-meet
    if (g && g['JitsiMeetExternalAPI']) {
      throw new Error(
        '[react-jitsi] Found JitsiMeetExternalAPI (IFrame API), but this SDK requires lib-jitsi-meet.\n' +
        'Please replace the external_api.js script with lib-jitsi-meet:\n\n' +
        '  <script src="https://8x8.vc/libs/lib-jitsi-meet.min.js"></script>\n\n'
      );
    }
    throw new Error(
      '[react-jitsi] JitsiMeetJS is not available. ' +
      'Please load lib-jitsi-meet via a <script> tag before using <JitsiProvider>.\n\n' +
      '  <script src="https://8x8.vc/libs/lib-jitsi-meet.min.js"></script>\n\n'
    );
  }
  return g['JitsiMeetJS'] as JitsiMeetJSStatic;
}

let msgIdCounter = 0;
function nextMsgId() {
  return `msg-${Date.now()}-${++msgIdCounter}`;
}

let pollIdCounter = 0;
function nextPollId() {
  return `poll-${Date.now()}-${++pollIdCounter}`;
}

// ---------------------------------------------------------------------------
// State management
// ---------------------------------------------------------------------------

interface JitsiState {
  connectionStatus: ConnectionStatus;
  conferenceStatus: ConferenceStatus;
  conferenceStart: number | null;
  breakoutRooms: JitsiRoom[] | null;
  localTracks: JitsiLocalTrack[];
  remoteTracks: Map<string, JitsiRemoteTrack[]>;
  participants: Map<string, Participant>;
  localParticipantId: string | null;
  localRole: 'moderator' | 'participant' | 'none';
  audioMuted: boolean;
  videoMuted: boolean;
  isScreenSharing: boolean;
  localScreenTrack: JitsiLocalTrack | null;
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
  noiseSuppressionEffect: TrackEffect | null;
  // Virtual background
  virtualBackground: VirtualBackgroundConfig | null;
  // Whiteboard
  whiteboardActive: boolean;
  whiteboardData: WhiteboardData | null;
  // Polls
  polls: Poll[];
  activePoll: Poll | null;
}

type JitsiAction =
  | { type: 'SET_CONNECTION_STATUS'; status: ConnectionStatus }
  | { type: 'SET_CONFERENCE_STATUS'; status: ConferenceStatus }
  | { type: 'SET_CONFERENCE_START'; start: number }
  | { type: 'SET_BREAKOUT_ROOMS'; rooms: JitsiRoom[] }
  | { type: 'SET_LOCAL_TRACKS'; tracks: JitsiLocalTrack[] }
  | { type: 'ADD_LOCAL_TRACK'; track: JitsiLocalTrack }
  | { type: 'REMOVE_LOCAL_TRACK'; track: JitsiLocalTrack }
  | { type: 'ADD_REMOTE_TRACK'; participantId: string; track: JitsiRemoteTrack }
  | { type: 'REMOVE_REMOTE_TRACK'; participantId: string; track: JitsiRemoteTrack }
  | { type: 'ADD_PARTICIPANT'; participant: Participant }
  | { type: 'REMOVE_PARTICIPANT'; participantId: string }
  | { type: 'UPDATE_PARTICIPANT'; participantId: string; changes: Partial<Participant> }
  | { type: 'SET_LOCAL_PARTICIPANT_ID'; id: string }
  | { type: 'SET_LOCAL_ROLE'; role: 'moderator' | 'participant' | 'none' }
  | { type: 'SET_AUDIO_MUTED'; muted: boolean }
  | { type: 'SET_VIDEO_MUTED'; muted: boolean }
  | { type: 'SET_SCREEN_SHARING'; sharing: boolean; screenTrack: JitsiLocalTrack | null }
  | { type: 'SET_MIRRORED'; mirrored: boolean }
  | { type: 'CLEAR_REMOTE_PARTICIPANT'; participantId: string }
  // Chat
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'MARK_MESSAGES_READ' }
  // Captions
  | { type: 'SET_CAPTIONS_ENABLED'; enabled: boolean }
  | { type: 'ADD_CAPTION'; caption: CaptionEntry }
  | { type: 'CLEAR_CAPTIONS' }
  // Recording
  | { type: 'SET_RECORDING'; recording: boolean; session: RecordingSession | null }
  // Noise suppression
  | { type: 'SET_NOISE_SUPPRESSION'; enabled: boolean; effect: TrackEffect | null }
  // Virtual background
  | { type: 'SET_VIRTUAL_BACKGROUND'; config: VirtualBackgroundConfig | null }
  // Whiteboard
  | { type: 'SET_WHITEBOARD_ACTIVE'; active: boolean }
  | { type: 'SET_WHITEBOARD_DATA'; data: WhiteboardData | null }
  // Polls
  | { type: 'ADD_POLL'; poll: Poll }
  | { type: 'UPDATE_POLL'; poll: Poll }
  | { type: 'SET_ACTIVE_POLL'; poll: Poll | null }
  | { type: 'RESET' };

const initialState: JitsiState = {
  connectionStatus: 'disconnected',
  conferenceStatus: 'none',
  conferenceStart: null,
  breakoutRooms: null,
  localTracks: [],
  remoteTracks: new Map(),
  participants: new Map(),
  localParticipantId: null,
  localRole: 'none',
  audioMuted: false,
  videoMuted: false,
  isScreenSharing: false,
  localScreenTrack: null,
  isMirrored: true,
  messages: [],
  unreadCount: 0,
  captionsEnabled: false,
  captions: [],
  isRecording: false,
  recordingSession: null,
  noiseSuppressionEnabled: false,
  noiseSuppressionEffect: null,
  virtualBackground: null,
  whiteboardActive: false,
  whiteboardData: null,
  polls: [],
  activePoll: null,
};

function jitsiReducer(state: JitsiState, action: JitsiAction): JitsiState {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.status };
    case 'SET_CONFERENCE_STATUS':
      return { ...state, conferenceStatus: action.status };
    case 'SET_CONFERENCE_START':
      return { ...state, conferenceStart: action.start };
    case 'SET_BREAKOUT_ROOMS':
      return { ...state, breakoutRooms: action.rooms };
    case 'SET_LOCAL_TRACKS':
      return { ...state, localTracks: action.tracks };
    case 'ADD_LOCAL_TRACK':
      return { ...state, localTracks: [...state.localTracks, action.track] };
    case 'REMOVE_LOCAL_TRACK':
      return { ...state, localTracks: state.localTracks.filter((t) => t.getId() !== action.track.getId()) };
    case 'ADD_REMOTE_TRACK': {
      const m = new Map(state.remoteTracks);
      const ex = m.get(action.participantId) || [];
      if (!ex.some((t) => t.getId() === action.track.getId())) {
        m.set(action.participantId, [...ex, action.track]);
      }
      return { ...state, remoteTracks: m };
    }
    case 'REMOVE_REMOTE_TRACK': {
      const m = new Map(state.remoteTracks);
      const ex = m.get(action.participantId) || [];
      const f = ex.filter((t) => t.getId() !== action.track.getId());
      f.length === 0 ? m.delete(action.participantId) : m.set(action.participantId, f);
      return { ...state, remoteTracks: m };
    }
    case 'ADD_PARTICIPANT': {
      const m = new Map(state.participants);
      m.set(action.participant.id, action.participant);
      return { ...state, participants: m };
    }
    case 'REMOVE_PARTICIPANT': {
      const m = new Map(state.participants);
      m.delete(action.participantId);
      return { ...state, participants: m };
    }
    case 'UPDATE_PARTICIPANT': {
      const m = new Map(state.participants);
      const p = m.get(action.participantId);
      if (p) {
        const changes = { ...action.changes };
        // Deep merge stats so LOCAL_STATS_UPDATED and REMOTE_STATS_UPDATED don't overwrite each other
        if (changes.stats && p.stats) {
          const cleanNewStats = Object.fromEntries(
            Object.entries(changes.stats).filter(([_, v]) => v !== undefined)
          );
          changes.stats = { ...p.stats, ...cleanNewStats };
        }
        m.set(action.participantId, { ...p, ...changes });
      }
      return { ...state, participants: m };
    }
    case 'SET_LOCAL_PARTICIPANT_ID':
      return { ...state, localParticipantId: action.id };
    case 'SET_LOCAL_ROLE':
      return { ...state, localRole: action.role };
    case 'SET_AUDIO_MUTED':
      return { ...state, audioMuted: action.muted };
    case 'SET_VIDEO_MUTED':
      return { ...state, videoMuted: action.muted };
    case 'SET_SCREEN_SHARING':
      return { ...state, isScreenSharing: action.sharing, localScreenTrack: action.screenTrack };
    case 'SET_MIRRORED':
      return { ...state, isMirrored: action.mirrored };
    case 'CLEAR_REMOTE_PARTICIPANT': {
      const rt = new Map(state.remoteTracks);
      rt.delete(action.participantId);
      const pp = new Map(state.participants);
      pp.delete(action.participantId);
      return { ...state, remoteTracks: rt, participants: pp };
    }
    // Chat
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message], unreadCount: state.unreadCount + 1 };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [], unreadCount: 0 };
    case 'MARK_MESSAGES_READ':
      return { ...state, unreadCount: 0 };
    // Captions
    case 'SET_CAPTIONS_ENABLED':
      return { ...state, captionsEnabled: action.enabled };
    case 'ADD_CAPTION': {
      const MAX_CAPTIONS = 50;
      const next = [...state.captions, action.caption];
      return { ...state, captions: next.length > MAX_CAPTIONS ? next.slice(-MAX_CAPTIONS) : next };
    }
    case 'CLEAR_CAPTIONS':
      return { ...state, captions: [] };
    // Recording
    case 'SET_RECORDING':
      return { ...state, isRecording: action.recording, recordingSession: action.session };
    // Noise suppression
    case 'SET_NOISE_SUPPRESSION':
      return { ...state, noiseSuppressionEnabled: action.enabled, noiseSuppressionEffect: action.effect };
    // Virtual background
    case 'SET_VIRTUAL_BACKGROUND':
      return { ...state, virtualBackground: action.config };
    // Whiteboard
    case 'SET_WHITEBOARD_ACTIVE':
      return { ...state, whiteboardActive: action.active };
    case 'SET_WHITEBOARD_DATA':
      return { ...state, whiteboardData: action.data };
    // Polls
    case 'ADD_POLL':
      return { ...state, polls: [...state.polls, action.poll] };
    case 'UPDATE_POLL':
      return { ...state, polls: state.polls.map((p) => (p.id === action.poll.id ? action.poll : p)) };
    case 'SET_ACTIVE_POLL':
      return { ...state, activePoll: action.poll };
    // Reset
    case 'RESET':
      return { ...initialState, remoteTracks: new Map(), participants: new Map() };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// JitsiProvider component
// ---------------------------------------------------------------------------

export function JitsiProvider({
  domain,
  roomName,
  userInfo,
  token = null,
  tenant,
  serviceUrl: serviceUrlProp,
  connectionOptions: connectionOptionsProp,
  configOverwrite,
  autoJoin = true,
  devices = ['audio', 'video'],
  onConferenceJoined,
  onConferenceLeft,
  onParticipantJoined,
  onParticipantLeft,
  onMessageReceived,
  onError,
  onConnectionStatusChanged,
  virtualBackgroundEffects,
  noiseSuppressionEffect,
  children,
}: JitsiProviderProps) {
  const [state, dispatch] = useReducer(jitsiReducer, initialState);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  const connectionRef = useRef<JitsiConnection | null>(null);
  const conferenceRef = useRef<JitsiConference | null>(null);
  const confStartRef = useRef<number | null>(null);
  const localTracksRef = useRef<JitsiLocalTrack[]>([]);
  const screenTrackRef = useRef<JitsiLocalTrack | null>(null);
  const remoteTracksRef = useRef<Map<string, JitsiRemoteTrack[]>>(new Map());
  // Keep ref in sync so TRACK_REMOVED handler can search by track ID
  remoteTracksRef.current = state.remoteTracks;
  const noiseEffectRef = useRef<TrackEffect | null>(noiseSuppressionEffect || null);
  const vbEffectRef = useRef<TrackEffect | null>(null);
  const whiteboardHandlerRef = useRef<(data: WhiteboardData | null) => void>(null);
  const whiteboardData = useRef<WhiteboardData>(null);
  const isLeavingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(true);
  const recordingSessionIdRef = useRef<string | null>(null);

  // Store unstable props in refs so they don't trigger the main effect
  const devicesRef = useRef(devices);
  devicesRef.current = devices;
  const configOverwriteRef = useRef(configOverwrite);
  configOverwriteRef.current = configOverwrite;
  const userInfoRef = useRef(userInfo);
  userInfoRef.current = userInfo;
  const serviceUrlRef = useRef(serviceUrlProp);
  serviceUrlRef.current = serviceUrlProp;
  const connectionOptionsRef = useRef(connectionOptionsProp);
  connectionOptionsRef.current = connectionOptionsProp;
  const tenantRef = useRef(tenant);
  tenantRef.current = tenant;

  const callbacksRef = useRef({
    onConferenceJoined, onConferenceLeft, onParticipantJoined, onParticipantLeft,
    onMessageReceived, onError, onConnectionStatusChanged,
  });
  callbacksRef.current = {
    onConferenceJoined, onConferenceLeft, onParticipantJoined, onParticipantLeft,
    onMessageReceived, onError, onConnectionStatusChanged,
  };

  // Safe dispatch that skips if component is unmounted
  const safeDispatch = useCallback((action: JitsiAction) => {
    if (isMountedRef.current) dispatch(action);
  }, []);

  // ----- Cleanup -----
  const cleanup = useCallback(async () => {
    isLeavingRef.current = true;
    if (screenTrackRef.current) { try { await screenTrackRef.current.dispose(); } catch { /* */ } screenTrackRef.current = null; }
    for (const track of localTracksRef.current) { try { await track.dispose(); } catch { /* */ } }
    localTracksRef.current = [];
    if (conferenceRef.current) { try { await conferenceRef.current.leave(); } catch { /* */ } conferenceRef.current = null; }
    if (connectionRef.current) { try { connectionRef.current.disconnect(); } catch { /* */ } connectionRef.current = null; }
    safeDispatch({ type: 'RESET' });
    isLeavingRef.current = false;
  }, [safeDispatch]);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const joinConference = useCallback(() => {
    if (!isMountedRef.current) return;
    const connection = connectionRef.current;
    if (!connection) return;

    const JitsiMeetJS = getJitsiMeetJS();

    const roomParts = currentRoom?.split("@");
    const roomDomain = roomParts?.[roomParts?.length - 1];
    const roomId = currentRoom?.replace(`@${roomDomain}`, "");

    const confOptions: ConferenceOptions = {
      openBridgeChannel: true,
      // P2P is disabled by default because it only supports one video track
      // per peer connection. Screen sharing adds a second video track which
      // requires JVB (Jitsi Videobridge) mode. Users can re-enable P2P via
      // configOverwrite if they don't need simultaneous camera + screen share.
      p2p: { enabled: false },
      customDomain: roomId && roomId !== roomName ? `breakout.${domain}` : undefined,
      ...configOverwriteRef.current,
    };

    const roomToJoin = roomId || roomName;
    const conference = connection.initJitsiConference(roomToJoin, confOptions);
    conferenceRef.current = conference;
    safeDispatch({ type: 'SET_CONFERENCE_STATUS', status: 'joining' });

    // --- Conference events ---
    conference.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, () => {
      if (!isMountedRef.current) return;
      const myId = conference.myUserId();
      safeDispatch({ type: 'SET_LOCAL_PARTICIPANT_ID', id: myId });
      safeDispatch({ type: 'SET_CONFERENCE_STATUS', status: 'joined' });
      const role = conference.isModerator() ? 'moderator' : 'participant';
      safeDispatch({ type: 'SET_LOCAL_ROLE', role });
      const displayName = userInfoRef.current?.displayName || 'Me';
      safeDispatch({
        type: 'ADD_PARTICIPANT', participant: {
          id: myId, displayName, role,
          isLocal: true, audioMuted: false, videoMuted: false,
        }
      });
      if (userInfoRef.current?.displayName) conference.setDisplayName(userInfoRef.current.displayName);

      if (conference.getParticipants().length === 0 && !confStartRef.current) {
        const d = Date.now();
        confStartRef.current = d;
        safeDispatch({ type: "SET_CONFERENCE_START", start: d });
      }

      callbacksRef.current.onConferenceJoined?.();
    });

    conference.on(JitsiMeetJS.events.conference.CONFERENCE_LEFT, () => {
      safeDispatch({ type: 'SET_CONFERENCE_STATUS', status: 'left' });
      callbacksRef.current.onConferenceLeft?.();
    });

    conference.on(JitsiMeetJS.events.conference.CONFERENCE_ERROR, (err: unknown) => {
      safeDispatch({ type: 'SET_CONFERENCE_STATUS', status: 'error' });
      callbacksRef.current.onError?.(new Error(String(err)));
    });

    conference.on(JitsiMeetJS.events.conference.DATA_CHANNEL_OPENED, () => {
      setTimeout(() => conference.broadcastEndpointMessage({ type: 'handshake', participant: { id: conference.myUserId() } }), 500);
    });

    conference.on(JitsiMeetJS.events.conference.BREAKOUT_ROOMS_UPDATED, (payload: { roomCounter: number, rooms: { [key: string]: JitsiRoom } }) => {
      safeDispatch({
        type: "SET_BREAKOUT_ROOMS", rooms: Object.values(payload.rooms).sort((a, b) => a.isMainRoom || (a?.name || 0) > (b?.name || 0) ? 1 : ((a?.name || 0) < (b?.name || 0) ? -1 : 0))
      });
    });

    conference.on(JitsiMeetJS.events.conference.BREAKOUT_ROOMS_MOVE_TO_ROOM, (roomJid: string) => {
      joinBreakoutRoom(roomJid);
    });

    conference.on(JitsiMeetJS.events.conference.TRACK_ADDED, (track: JitsiTrack) => {
      if (isLeavingRef.current) return;
      // Never add local tracks to remoteTracks - this would cause echo
      if (track.isLocal()) return;
      const pid = track.getParticipantId();
      // Double-check: skip if participant ID matches our own
      const myId = conference.myUserId();
      if (pid === myId) return;
      safeDispatch({ type: 'ADD_REMOTE_TRACK', participantId: pid, track: track as JitsiRemoteTrack });

      // Fallback cleanup: listen for the underlying MediaStreamTrack 'ended' event.
      // This handles cases where TRACK_REMOVED doesn't fire (e.g. screen share in JVB mode).
      try {
        const remoteTrack = track as JitsiRemoteTrack;
        const mediaTrack = (remoteTrack as unknown as Record<string, unknown>)['getTrack']
          ? ((remoteTrack as unknown as { getTrack: () => MediaStreamTrack }).getTrack())
          : null;
        if (mediaTrack) {
          const handleEnded = () => {
            safeDispatch({ type: 'REMOVE_REMOTE_TRACK', participantId: pid, track: track as JitsiRemoteTrack });
            mediaTrack.removeEventListener('ended', handleEnded);
          };
          mediaTrack.addEventListener('ended', handleEnded);
        }
      } catch { /* getTrack may not exist */ }
    });

    conference.on(JitsiMeetJS.events.conference.TRACK_REMOVED, (track: JitsiTrack) => {
      // Use participantId comparison instead of isLocal()
      let pid = track.getParticipantId();
      const myId = conference.myUserId();
      if (!pid) {
        const rt = remoteTracksRef.current;
        for (const [participantId, tracks] of rt.entries()) {
          if (tracks.some((t: JitsiRemoteTrack) => t.getId() === (track as JitsiRemoteTrack).getId())) {
            pid = participantId;
            break;
          }
        }
      }
      if (pid === myId) return;
      if (!pid) return;
      safeDispatch({ type: 'REMOVE_REMOTE_TRACK', participantId: pid, track: track as JitsiRemoteTrack });
    });

    // Listen for custom screen-share-stopped endpoint messages
    // This is the reliable fallback for JVB mode where TRACK_REMOVED may not fire
    conference.on(
      JitsiMeetJS.events.conference.ENDPOINT_MESSAGE_RECEIVED as string,
      (participant: { getId: () => string }, msg: Record<string, unknown>) => {
        if (msg && msg.type === 'screen-share-stopped') {
          const pid = participant.getId();
          const tracks = remoteTracksRef.current.get(pid) || [];
          const desktopTracks = tracks.filter((t: JitsiRemoteTrack) => t.getVideoType?.() === 'desktop');
          for (const dt of desktopTracks) {
            safeDispatch({ type: 'REMOVE_REMOTE_TRACK', participantId: pid, track: dt });
          }
        }
      }
    );

    conference.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, (track: JitsiTrack) => {
      if (track.isLocal()) {
        // Ignore screen share track mute events - they should not affect camera state
        if (screenTrackRef.current && track.getId?.() === screenTrackRef.current.getId?.()) return;
        safeDispatch({ type: track.getType() === 'audio' ? 'SET_AUDIO_MUTED' : 'SET_VIDEO_MUTED', muted: track.isMuted() });
      } else {
        // For remote screen share tracks, don't update participant's videoMuted
        if (track.getVideoType?.() === 'desktop') return;
        safeDispatch({
          type: 'UPDATE_PARTICIPANT', participantId: track.getParticipantId(),
          changes: track.getType() === 'audio' ? { audioMuted: track.isMuted() } : { videoMuted: track.isMuted() }
        });
      }
    });

    conference.on(JitsiMeetJS.events.conference.USER_JOINED, (id: string, p: { getDisplayName: () => string; getRole: () => string }) => {
      const np: Participant = { id, displayName: p.getDisplayName() || `Participant ${id.substring(0, 6)}`, role: p.getRole() || 'participant', isLocal: false, audioMuted: false, videoMuted: false };
      safeDispatch({ type: 'ADD_PARTICIPANT', participant: np });
      callbacksRef.current.onParticipantJoined?.(np);
    });

    conference.on(JitsiMeetJS.events.conference.USER_LEFT, (id: string) => {
      safeDispatch({ type: 'CLEAR_REMOTE_PARTICIPANT', participantId: id });
      callbacksRef.current.onParticipantLeft?.(id);
    });

    conference.on(JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, (id: string, displayName: string) => {
      safeDispatch({ type: 'UPDATE_PARTICIPANT', participantId: id, changes: { displayName } });
    });

    conference.on(JitsiMeetJS.events.conference.USER_ROLE_CHANGED, (id: string, role: string) => {
      safeDispatch({ type: 'UPDATE_PARTICIPANT', participantId: id, changes: { role } });
      const myId = conference.myUserId();
      if (id === myId) {
        safeDispatch({ type: 'SET_LOCAL_ROLE', role: role === 'moderator' ? 'moderator' : 'participant' });
      }
    });

    conference.on(JitsiMeetJS.events.conference.PARTICIPANT_CONN_STATUS_CHANGED, (id: string, status: string) => {
      safeDispatch({ type: 'UPDATE_PARTICIPANT', participantId: id, changes: { connectionStatus: status } });
    });

    // In lib-jitsi-meet, detailed stats are emitted via connectionQuality events.
    // We fall back to standard string if the object is missing in some versions.
    const localStatsEvent = JitsiMeetJS.events.connectionQuality?.LOCAL_STATS_UPDATED || 'cq.local_stats_updated';
    const remoteStatsEvent = JitsiMeetJS.events.connectionQuality?.REMOTE_STATS_UPDATED || 'cq.remote_stats_updated';

    conference.on(localStatsEvent, (stats: any) => {
      if (!stats || !isMountedRef.current) return;
      const myId = conference.myUserId();

      // Parse global/local connection info
      const transport = stats.transport?.[0];
      let remoteAddress: string | undefined;
      let remotePort: number | undefined;
      let localAddress: string | undefined;
      let localPort: number | undefined;
      if (transport) {
        const remoteParts = transport.ip?.split(':') || [];
        remoteAddress = remoteParts[0];
        remotePort = remoteParts[1] ? parseInt(remoteParts[1], 10) : undefined;
        const localParts = transport.localip?.split(':') || [];
        localAddress = localParts[0];
        localPort = localParts[1] ? parseInt(localParts[1], 10) : undefined;
      }

      // The stats object contains properties mapped by Participant ID -> SSRC -> Value
      const allParticipantIds = new Set([
        ...Object.keys(stats.resolution || {}),
        ...Object.keys(stats.framerate || {}),
        ...Object.keys(stats.codec || {}),
        myId // Always process local
      ]);

      allParticipantIds.forEach(pid => {
        const ssrcMapRes = stats.resolution?.[pid];
        const resObj = ssrcMapRes ? Object.values(ssrcMapRes)[0] as any : undefined;

        const ssrcMapFr = stats.framerate?.[pid];
        const frameRate = ssrcMapFr ? Object.values(ssrcMapFr)[0] as number : undefined;

        const ssrcMapCodec = stats.codec?.[pid];
        let codecName: string | undefined;
        let audioSsrc: string | undefined;
        let videoSsrc: string | undefined;

        if (ssrcMapCodec) {
          for (const [ssrc, codecData] of Object.entries(ssrcMapCodec)) {
            if ((codecData as any).audio) {
              audioSsrc = ssrc;
              if (!codecName) codecName = (codecData as any).audio;
            }
            if ((codecData as any).video) {
              videoSsrc = ssrc;
              codecName = (codecData as any).video; // Prefer video codec name if available
            }
          }
        }

        const isLocal = pid === myId;
        const participantStats: any = {
          isLocal,
          participantId: pid,
          resolution: resObj ? `${resObj.width}x${resObj.height}` : undefined,
          frameRate,
          codec: codecName,
          audioSsrc,
          videoSsrc,
          connectedTo: 'Jitsi Videobridge'
        };

        if (isLocal) {
          participantStats.bitrate = stats.bitrate ? Math.round((stats.bitrate.download || 0) + (stats.bitrate.upload || 0)) : undefined;
          participantStats.packetLoss = stats.packetLoss?.total !== undefined ? stats.packetLoss.total : 0;
          participantStats.estimatedBandwidth = stats.bandwidth ? Math.round(stats.bandwidth.download || 0) : undefined;
          participantStats.localAddress = localAddress;
          participantStats.localPort = localPort;
          participantStats.remoteAddress = remoteAddress;
          participantStats.remotePort = remotePort;
          participantStats.transport = transport?.type;
          participantStats.servers = stats.serverRegion || 'Jitsi Server';
        }

        safeDispatch({ type: 'UPDATE_PARTICIPANT', participantId: pid, changes: { stats: participantStats } });
      });
    });

    conference.on(remoteStatsEvent, (id: string, stats: any) => {
      if (!stats || !isMountedRef.current) return;

      // Remote stats are usually less detailed but we can still parse what's available
      const parsedRemoteStats = {
        isLocal: false,
        participantId: id,
        bitrate: stats.bitrate ? Math.round((stats.bitrate.download || 0) + (stats.bitrate.upload || 0)) : undefined,
        packetLoss: stats.packetLoss?.total || 0,
        connectedTo: 'Jitsi Videobridge',
      };

      safeDispatch({ type: 'UPDATE_PARTICIPANT', participantId: id, changes: { stats: parsedRemoteStats } });
    });

    // Chat - filter out own messages (sendMessage already adds them locally)
    conference.on(JitsiMeetJS.events.conference.MESSAGE_RECEIVED, (id: string, text: string, ts: number) => {
      if (id === conference.myUserId()) return; // Skip own messages - already added by sendMessage
      const p = conference.getParticipantById(id);
      const msg: ChatMessage = {
        id: nextMsgId(), participantId: id, displayName: p?.getDisplayName() || id,
        text, timestamp: ts || Date.now(), isPrivate: false, isLocal: false,
      };
      safeDispatch({ type: 'ADD_MESSAGE', message: msg });
      callbacksRef.current.onMessageReceived?.(msg);
    });

    conference.on(JitsiMeetJS.events.conference.PRIVATE_MESSAGE_RECEIVED, (id: string, text: string, ts: number) => {
      const p = conference.getParticipantById(id);
      const msg: ChatMessage = {
        id: nextMsgId(), participantId: id, displayName: p?.getDisplayName() || id,
        text, timestamp: ts || Date.now(), isPrivate: true, isLocal: false,
      };
      safeDispatch({ type: 'ADD_MESSAGE', message: msg });
      callbacksRef.current.onMessageReceived?.(msg);
    });

    // Recording
    conference.on(JitsiMeetJS.events.conference.RECORDER_STATE_CHANGED, (status: { id?: string; mode?: string; status?: string; error?: string }) => {
      const isOn = status.status === 'on' || status.status === 'pending';
      const session: RecordingSession | null = status.id ? {
        id: status.id, mode: (status.mode as 'file' | 'stream') || 'file',
        status: (status.status as RecordingSession['status']) || 'off', error: status.error,
      } : null;
      if (session?.id) recordingSessionIdRef.current = session.id;
      safeDispatch({ type: 'SET_RECORDING', recording: isOn, session });
    });

    // Captions / Transcription
    conference.on(JitsiMeetJS.events.conference.TRANSCRIPTION_STATUS_CHANGED, (status: string) => {
      safeDispatch({ type: 'SET_CAPTIONS_ENABLED', enabled: status === 'ON' });
    });

    conference.on(JitsiMeetJS.events.conference.ENDPOINT_MESSAGE_RECEIVED, (_: unknown, payload: { type?: string; text?: string; language?: string; participant?: { id?: string; name?: string }; final?: boolean }) => {
      if (payload.type === 'transcription-result' && payload.text) {
        const caption: CaptionEntry = {
          participantId: payload.participant?.id || '',
          displayName: payload.participant?.name || '',
          text: payload.text, timestamp: Date.now(),
          language: payload.language, isFinal: payload.final ?? true,
        };
        safeDispatch({ type: 'ADD_CAPTION', caption });
      }

      console.log(payload);

      if (payload.type === 'handshake') {
        if (payload.participant?.id === conference.myUserId()) return;
        const ids = [conference.myUserId(), ...conference.getParticipants().map(p => p.getId())]
          .sort()
          .filter(id => id !== payload.participant?.id);
        if (ids[0] !== conference.myUserId() || !confStartRef.current) return;

        conference.broadcastEndpointMessage({
          type: "handshake-data",
          data: {
            whiteboardData: whiteboardData.current,
            confStartAt: Date.now() - confStartRef.current
          }
        });
      }

      // Handshake data
      if (payload.type === 'handshake-data') {
        const wd = (payload as { data: { whiteboardData: WhiteboardData | null, confStartAt: number } }).data;

        whiteboardHandlerRef.current?.(wd.whiteboardData);
        whiteboardData.current = wd.whiteboardData;
        safeDispatch({ type: "SET_WHITEBOARD_DATA", data: wd.whiteboardData });

        const d = Date.now() - wd.confStartAt;
        confStartRef.current = d;
        safeDispatch({ type: "SET_CONFERENCE_START", start: d });
      }

      // Whiteboard data
      if (payload.type === 'whiteboard-data') {
        const wd = (payload as { data: WhiteboardData }).data;
        if (wd.senderId === conference.myUserId()) return;

        whiteboardHandlerRef.current?.(wd);
        whiteboardData.current = wd;
        safeDispatch({ type: "SET_WHITEBOARD_DATA", data: wd });
      }
      // Poll data
      if (payload.type === 'poll-data') {
        const pd = payload as { action: string; poll: Poll };
        if (pd.action === 'create') {
          safeDispatch({ type: 'ADD_POLL', poll: pd.poll });
          safeDispatch({ type: 'SET_ACTIVE_POLL', poll: pd.poll });
        } else if (pd.action === 'vote' || pd.action === 'close') {
          safeDispatch({ type: 'UPDATE_POLL', poll: pd.poll });
          if (pd.action === 'close') {
            safeDispatch({ type: 'SET_ACTIVE_POLL', poll: null });
          }
        }
      }
    });

    // Join the conference first - Jicofo needs the MUC presence before
    // it allocates a Jitsi Videobridge. Tracks are added after.
    conference.join();

    // Create local tracks in parallel and add them when ready
    if (localTracksRef.current.length === 0) {
      JitsiMeetJS.createLocalTracks({ devices: devicesRef.current })
        .then((tracks) => {
          if (!isMountedRef.current) { tracks.forEach((t) => t.dispose()); return; }
          localTracksRef.current = tracks;
          safeDispatch({ type: 'SET_LOCAL_TRACKS', tracks });
          for (const t of tracks) {
            safeDispatch({ type: t.getType() === 'audio' ? 'SET_AUDIO_MUTED' : 'SET_VIDEO_MUTED', muted: t.isMuted() });
          }
          return Promise.all(tracks.map((t) => conference.addTrack(t)));
        })
        .catch((err: Error) => {
          console.error('[react-jitsi] Error creating local tracks:', err);
          callbacksRef.current.onError?.(err);
        });
    } else {
      localTracksRef.current.forEach((t) => conference.addTrack(t));
    }
  }, [roomName, currentRoom]);

  // ----- Initialize and connect -----
  // Only re-run when domain or roomName truly change (primitives).
  // devices, configOverwrite, and userInfo are read from refs.
  useEffect(() => {
    if (isInitializedRef.current || !autoJoin) return;
    isInitializedRef.current = true;

    const JitsiMeetJS = getJitsiMeetJS();
    // Defensive: some bundled versions may not expose logLevels
    if (JitsiMeetJS.logLevels) {
      JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
    }
    try { JitsiMeetJS.init({ disableAudioLevels: false }); } catch { /* may already be initialized */ }

    // Build connection options with sensible defaults, allowing full override
    // For multi-tenant (JaaS), MUC domain includes tenant: conference.{tenant}.{domain}
    // NOTE: JaaS (8x8.vc) always requires a JWT token - even for guest access.
    // The "allow anonymous guests" setting in JaaS only works with the IFrame API.
    const t = tenantRef.current;
    const mucDomain = t ? `conference.${t}.${domain}` : `conference.${domain}`;
    const defaultHosts: ConnectionOptions['hosts'] = {
      domain,
      muc: mucDomain,
      focus: `focus.${domain}`,
    };
    const userHosts = connectionOptionsRef.current?.hosts;
    const mergedHosts = userHosts
      ? { ...defaultHosts, ...userHosts }
      : defaultHosts;

    // Build service URL.
    // For multi-tenant (JaaS): tenant goes in the URL path so Prosody routes
    // to the correct virtual host and validates JWT: wss://domain/{tenant}/xmpp-websocket
    // The ?room= query param ensures the load balancer routes to the correct shard.
    let serviceUrl = serviceUrlRef.current;
    if (!serviceUrl) {
      serviceUrl = t
        ? `wss://${domain}/${t}/xmpp-websocket`
        : `wss://${domain}/xmpp-websocket`;
    }
    if (!serviceUrl.includes('room=')) {
      const separator = serviceUrl.includes('?') ? '&' : '?';
      serviceUrl = `${serviceUrl}${separator}room=${roomName}`;
    }

    const connOptions: ConnectionOptions = {
      hosts: mergedHosts,
      serviceUrl,
    };
    // Apply any additional connection options (bosh, clientNode, etc.)
    if (connectionOptionsRef.current?.bosh) connOptions.bosh = connectionOptionsRef.current.bosh;
    if (connectionOptionsRef.current?.clientNode) connOptions.clientNode = connectionOptionsRef.current.clientNode;

    const connection = new JitsiMeetJS.JitsiConnection(null, token, connOptions);
    connectionRef.current = connection;
    safeDispatch({ type: 'SET_CONNECTION_STATUS', status: 'connecting' });
    callbacksRef.current.onConnectionStatusChanged?.('connecting');

    const onConnectionSuccess = () => {
      safeDispatch({ type: 'SET_CONNECTION_STATUS', status: 'connected' });
      callbacksRef.current.onConnectionStatusChanged?.('connected');
    };

    const onConnectionFailed = (err: unknown) => {
      safeDispatch({ type: 'SET_CONNECTION_STATUS', status: 'failed' });
      callbacksRef.current.onConnectionStatusChanged?.('failed');
      callbacksRef.current.onError?.(new Error(`Connection failed: ${err}`));
    };

    const onDisconnected = () => {
      // Ignore disconnect events triggered by our own cleanup
      if (isLeavingRef.current) return;
      safeDispatch({ type: 'SET_CONNECTION_STATUS', status: 'disconnected' });
      callbacksRef.current.onConnectionStatusChanged?.('disconnected');
    };

    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, onDisconnected);
    connection.connect();

    return () => { isInitializedRef.current = false; cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, token, autoJoin, safeDispatch, cleanup]);

  useEffect(() => {
    const connection = connectionRef.current;
    if (
      state.connectionStatus !== 'connected' ||
      !connection ||
      state.conferenceStatus === "joining" ||
      state.conferenceStatus === "joined"
    ) return;

    if (state.conferenceStatus === "switching") {
      conferenceRef.current?.leave();
      return;
    }

    whiteboardHandlerRef.current?.(null);
    whiteboardData.current = null;
    safeDispatch({ type: "SET_WHITEBOARD_DATA", data: null });

    joinConference();
  }, [state.connectionStatus, state.conferenceStatus, roomName, currentRoom]);

  // ===================== BREAKOUTROOMS =====================

  const createBreakoutRoom = useCallback((subject: string) => {
    if (!conferenceRef.current) return

    let count = 0;
    let name = subject;
    while (state.breakoutRooms?.find(room => room.name === name)) {
      count++;
      name = `${subject} #${count}`;
    }

    conferenceRef.current.getBreakoutRooms()?.createBreakoutRoom(name);
  }, [state.breakoutRooms]);

  const joinBreakoutRoom = useCallback((roomJid: string) => {
    if (!conferenceRef.current) return;
    safeDispatch({ type: "SET_CONFERENCE_STATUS", status: "switching" });
    setCurrentRoom(roomJid);
  }, []);

  const leaveBreakoutRoom = useCallback(() => {
    if (!conferenceRef.current) return;
    safeDispatch({ type: "SET_CONFERENCE_STATUS", status: "switching" });
    setCurrentRoom(null);
  }, []);

  const removeBreakoutRoom = useCallback((roomJid: string) => {
    if (!conferenceRef.current) return;
    conferenceRef.current.getBreakoutRooms()?.removeBreakoutRoom(roomJid);
  }, []);

  const renameBreakoutRoom = useCallback((roomJid: string, subject: string) => {
    if (!conferenceRef.current) return;
    conferenceRef.current.getBreakoutRooms()?.renameBreakoutRoom(roomJid, subject);
  }, []);

  const sendToBreakoutRoom = useCallback((participantId: string, roomJid: string) => {
    if (!conferenceRef.current) return;
    conferenceRef.current.getBreakoutRooms()?.sendParticipantToRoom(participantId, roomJid);
  }, []);

  // ===================== ACTIONS =====================

  const toggleAudio = useCallback(async () => {
    const t = localTracksRef.current.find((t) => t.getType() === 'audio');
    if (!t) return;
    t.isMuted() ? await t.unmute() : await t.mute();
    dispatch({ type: 'SET_AUDIO_MUTED', muted: t.isMuted() });
  }, []);

  const toggleVideo = useCallback(async () => {
    const t = localTracksRef.current.find((t) => t.getType() === 'video' && t.getVideoType?.() !== 'desktop');
    if (!t) return;
    if (t.isMuted()) {
      await t.unmute();
    } else {
      await t.mute();
    }
    dispatch({ type: 'SET_VIDEO_MUTED', muted: t.isMuted() });
  }, []);

  const leave = useCallback(async () => { await cleanup(); }, [cleanup]);

  const startScreenShare = useCallback(async (options?: ScreenShareOptions) => {
    if (!conferenceRef.current) return;
    try {
      const JitsiMeetJS = getJitsiMeetJS();
      const constraints: Record<string, unknown> = {};
      if (options?.frameRate) {
        constraints.video = { frameRate: { max: options.frameRate } };
      }
      const tracks = await JitsiMeetJS.createLocalTracks({
        devices: ['desktop'],
        ...(Object.keys(constraints).length > 0 ? { constraints } : {}),
      });
      // Desktop capture may return both video + audio tracks.
      // Only use the video track; dispose any extra audio tracks.
      const screenTrack = tracks.find((t) => t.getType() === 'video');
      const extraTracks = tracks.filter((t) => t !== screenTrack);
      for (const extra of extraTracks) { try { await extra.dispose(); } catch { /* */ } }
      if (!screenTrack) return;

      screenTrackRef.current = screenTrack;

      // Add screen track alongside camera (separate track, not a replacement)
      await conferenceRef.current.addTrack(screenTrack);

      dispatch({ type: 'SET_SCREEN_SHARING', sharing: true, screenTrack });
      screenTrack.addEventListener('local_track_stopped' as string, () => { stopScreenShare(); });
    } catch (err) {
      if ((err as Error)?.name !== 'gum.screensharing_user_canceled') callbacksRef.current.onError?.(err as Error);
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    if (!conferenceRef.current || !screenTrackRef.current) return;
    try {
      // Notify remote participants via data channel (reliable fallback)
      try {
        (conferenceRef.current as unknown as { broadcastEndpointMessage: (msg: Record<string, unknown>) => void })
          .broadcastEndpointMessage({ type: 'screen-share-stopped' });
      } catch { /* broadcastEndpointMessage may not exist */ }

      await conferenceRef.current.removeTrack(screenTrackRef.current);
      await screenTrackRef.current.dispose();
      screenTrackRef.current = null;
      dispatch({ type: 'SET_SCREEN_SHARING', sharing: false, screenTrack: null });
    } catch (err) { callbacksRef.current.onError?.(err as Error); }
  }, []);

  const setDisplayName = useCallback((name: string) => { conferenceRef.current?.setDisplayName(name); }, []);

  const getDevices = useCallback((): Promise<MediaDeviceInfo[]> => {
    return new Promise((resolve) => {
      try { getJitsiMeetJS().mediaDevices.enumerateDevices((d) => resolve(d)); }
      catch { resolve([]); }
    });
  }, []);

  const switchCamera = useCallback(async (deviceId: string) => {
    if (!conferenceRef.current) return;
    try {
      const newTracks = await getJitsiMeetJS().createLocalTracks({ devices: ['video'], cameraDeviceId: deviceId });
      const nv = newTracks[0]; if (!nv) return;
      const ov = localTracksRef.current.find((t) => t.getType() === 'video' && t.getVideoType?.() !== 'desktop');
      if (ov) { await conferenceRef.current.replaceTrack(ov, nv); await ov.dispose(); localTracksRef.current = localTracksRef.current.map((t) => t.getId() === ov.getId() ? nv : t); }
      else { await conferenceRef.current.addTrack(nv); localTracksRef.current.push(nv); }
      dispatch({ type: 'SET_LOCAL_TRACKS', tracks: [...localTracksRef.current] });
    } catch (err) { callbacksRef.current.onError?.(err as Error); }
  }, []);

  const switchMicrophone = useCallback(async (deviceId: string) => {
    if (!conferenceRef.current) return;
    try {
      const oa = localTracksRef.current.find((t) => t.getType() === 'audio');
      const wasMuted = oa ? oa.isMuted() : false;
      const newTracks = await getJitsiMeetJS().createLocalTracks({ devices: ['audio'], micDeviceId: deviceId });
      const na = newTracks[0]; if (!na) return;
      if (oa) { await conferenceRef.current.replaceTrack(oa, na); await oa.dispose(); localTracksRef.current = localTracksRef.current.map((t) => t.getId() === oa.getId() ? na : t); }
      else { await conferenceRef.current.addTrack(na); localTracksRef.current.push(na); }
      // Preserve muted state
      if (wasMuted) { await na.mute(); }
      dispatch({ type: 'SET_LOCAL_TRACKS', tracks: [...localTracksRef.current] });
      dispatch({ type: 'SET_AUDIO_MUTED', muted: wasMuted });
    } catch (err) { callbacksRef.current.onError?.(err as Error); }
  }, []);

  const setAudioOutput = useCallback(async (deviceId: string) => {
    try { await getJitsiMeetJS().mediaDevices.setAudioOutputDevice(deviceId); }
    catch (err) { callbacksRef.current.onError?.(err as Error); }
  }, []);

  const toggleMirror = useCallback(() => {
    dispatch({ type: 'SET_MIRRORED', mirrored: !state.isMirrored });
  }, [state.isMirrored]);

  // Virtual background
  const setVirtualBackground = useCallback(async (config: VirtualBackgroundConfig | null) => {
    const videoTrack = localTracksRef.current.find((t) => t.getType() === 'video' && t.getVideoType?.() !== 'desktop');
    if (!videoTrack) return;
    try {
      await videoTrack.setEffect(config?.effect);
      vbEffectRef.current = config?.effect || null;
      dispatch({ type: 'SET_VIRTUAL_BACKGROUND', config });
    } catch (err) { callbacksRef.current.onError?.(err as Error); }
  }, []);

  const removeVirtualBackground = useCallback(async () => {
    await setVirtualBackground(null);
  }, [setVirtualBackground]);

  // Noise suppression
  const setNoiseSuppression = useCallback(async (effect: TrackEffect | null) => {
    const audioTrack = localTracksRef.current.find((t) => t.getType() === 'audio');
    if (!audioTrack) return;
    try {
      if (effect) {
        await audioTrack.setEffect(effect);
        noiseEffectRef.current = effect;
        dispatch({ type: 'SET_NOISE_SUPPRESSION', enabled: true, effect });
      } else {
        await audioTrack.setEffect(undefined);
        dispatch({ type: 'SET_NOISE_SUPPRESSION', enabled: false, effect: noiseEffectRef.current });
      }
    } catch (err) { callbacksRef.current.onError?.(err as Error); }
  }, []);

  const toggleNoiseSuppression = useCallback(async () => {
    await setNoiseSuppression(noiseEffectRef.current);
  }, [setNoiseSuppression]);

  // Chat
  const sendMessage = useCallback((text: string, to?: string) => {
    if (!conferenceRef.current) return;
    if (to) { conferenceRef.current.sendMessage(text, to, false); }
    else { conferenceRef.current.sendTextMessage(text); }
    const myId = conferenceRef.current.myUserId();
    dispatch({
      type: 'ADD_MESSAGE', message: {
        id: nextMsgId(), participantId: myId, displayName: userInfo?.displayName || 'Me',
        text, timestamp: Date.now(), isPrivate: !!to, isLocal: true,
      }
    });
  }, [userInfo?.displayName]);

  const sendPrivateMessage = useCallback((text: string, participantId: string) => {
    sendMessage(text, participantId);
  }, [sendMessage]);

  const clearMessages = useCallback(() => { dispatch({ type: 'CLEAR_MESSAGES' }); }, []);
  const markMessagesRead = useCallback(() => { dispatch({ type: 'MARK_MESSAGES_READ' }); }, []);

  // Captions
  const toggleCaptions = useCallback(() => {
    dispatch({ type: 'SET_CAPTIONS_ENABLED', enabled: !state.captionsEnabled });
  }, [state.captionsEnabled]);

  const clearCaptions = useCallback(() => { dispatch({ type: 'CLEAR_CAPTIONS' }); }, []);

  // Recording
  const startRecording = useCallback(async (options: RecordingOptions) => {
    if (!conferenceRef.current) return;
    try { await conferenceRef.current.startRecording(options); }
    catch (err) { callbacksRef.current.onError?.(err as Error); }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!conferenceRef.current || !recordingSessionIdRef.current) return;
    try { await conferenceRef.current.stopRecording(recordingSessionIdRef.current); }
    catch (err) { callbacksRef.current.onError?.(err as Error); }
  }, []);

  // Whiteboard
  const toggleWhiteboard = useCallback(() => {
    dispatch({ type: 'SET_WHITEBOARD_ACTIVE', active: !state.whiteboardActive });
  }, [state.whiteboardActive]);

  const getWhiteboardData = useCallback(() => {
    console.log("Get Data");
    console.log(whiteboardData.current);
    return whiteboardData.current;
  }, []);

  const sendWhiteboardData = useCallback((data: WhiteboardData) => {
    whiteboardData.current = data;
    if (!conferenceRef.current) return;

    // TODO: add RTC type declaration
    if (!(conferenceRef.current as any).rtc?._channel?.isOpen?.()) return;
    conferenceRef.current.broadcastEndpointMessage({ type: 'whiteboard-data', data });
  }, []);

  const onWhiteboardData = useCallback((handler: (data: WhiteboardData | null) => void) => {
    whiteboardHandlerRef.current = handler;
    return () => { whiteboardHandlerRef.current = null };
  }, []);

  // Polls
  const createPoll = useCallback((question: string, options: string[]) => {
    if (!conferenceRef.current) return;
    if (!(conferenceRef.current as any).rtc?._channel?.isOpen?.()) return;

    const poll: Poll = {
      id: nextPollId(), creatorId: conferenceRef.current.myUserId(),
      creatorName: userInfo?.displayName || 'Me', question,
      options: options.map((text): PollOption => ({ text, voters: [] })),
      isOpen: true, timestamp: Date.now(),
    };
    dispatch({ type: 'ADD_POLL', poll });
    dispatch({ type: 'SET_ACTIVE_POLL', poll });
    conferenceRef.current.broadcastEndpointMessage({ type: 'poll-data', action: 'create', poll } as unknown as object);
  }, [userInfo?.displayName]);

  // Use a ref for polls so votePoll doesn't go stale
  const pollsRef = useRef(state.polls);
  pollsRef.current = state.polls;

  const votePoll = useCallback((pollId: string, optionIndex: number) => {
    if (!conferenceRef.current) return;
    const myId = conferenceRef.current.myUserId();
    const poll = pollsRef.current.find((p) => p.id === pollId);
    if (!poll || !poll.isOpen) return;
    const updatedOptions = poll.options.map((opt, idx) => {
      const withoutMe = opt.voters.filter((v) => v !== myId);
      return idx === optionIndex ? { ...opt, voters: [...withoutMe, myId] } : { ...opt, voters: withoutMe };
    });
    const updatedPoll = { ...poll, options: updatedOptions };
    dispatch({ type: 'UPDATE_POLL', poll: updatedPoll });
    conferenceRef.current.broadcastEndpointMessage({ type: 'poll-data', action: 'vote', poll: updatedPoll } as unknown as object);
  }, []);

  const closePoll = useCallback((pollId: string) => {
    if (!conferenceRef.current) return;
    const poll = pollsRef.current.find((p) => p.id === pollId);
    if (!poll) return;
    const closed = { ...poll, isOpen: false };
    dispatch({ type: 'UPDATE_POLL', poll: closed });
    dispatch({ type: 'SET_ACTIVE_POLL', poll: null });
    conferenceRef.current.broadcastEndpointMessage({ type: 'poll-data', action: 'close', poll: closed } as unknown as object);
  }, []);

  // Performance
  const setVideoQuality = useCallback((maxHeight: number) => {
    conferenceRef.current?.setReceiverConstraints({ defaultConstraints: { maxHeight } });
  }, []);

  const setSenderQuality = useCallback(async (maxHeight: number) => {
    try { await conferenceRef.current?.setSenderVideoConstraint(maxHeight); }
    catch (err) { callbacksRef.current.onError?.(err as Error); }
  }, []);

  const setMaxVisibleParticipants = useCallback((n: number) => {
    conferenceRef.current?.setReceiverConstraints({ lastN: n });
  }, []);

  // Admin
  const kickParticipant = useCallback((id: string, reason?: string) => {
    conferenceRef.current?.kickParticipant(id, reason);
  }, []);

  const muteParticipant = useCallback((id: string, mediaType?: 'audio' | 'video') => {
    conferenceRef.current?.muteParticipant(id, mediaType || 'audio');
  }, []);

  const grantModerator = useCallback((id: string) => {
    conferenceRef.current?.grantOwner(id);
  }, []);

  const muteAll = useCallback((mediaType?: 'audio' | 'video') => {
    if (!conferenceRef.current) return;
    const mt = mediaType || 'audio';
    conferenceRef.current.getParticipants().forEach((p) => {
      conferenceRef.current?.muteParticipant(p.getId(), mt);
    });
  }, []);

  // ----- Context value -----
  const contextValue: JitsiContextValue = {
    connectionStatus: state.connectionStatus, conferenceStatus: state.conferenceStatus,
    conferenceStart: state.conferenceStart,
    localTracks: state.localTracks, localScreenTrack: state.localScreenTrack,
    remoteTracks: state.remoteTracks,
    participants: state.participants, localParticipantId: state.localParticipantId,
    localRole: state.localRole, audioMuted: state.audioMuted, videoMuted: state.videoMuted,
    isScreenSharing: state.isScreenSharing, isMirrored: state.isMirrored,
    messages: state.messages, unreadCount: state.unreadCount,
    captionsEnabled: state.captionsEnabled, captions: state.captions,
    isRecording: state.isRecording, recordingSession: state.recordingSession,
    noiseSuppressionEnabled: state.noiseSuppressionEnabled,
    noiseSuppressionEffect: state.noiseSuppressionEffect,
    virtualBackground: state.virtualBackground,
    virtualBackgroundEffects: virtualBackgroundEffects || [],
    whiteboardActive: state.whiteboardActive,
    whiteboardData: state.whiteboardData, polls: state.polls, activePoll: state.activePoll,
    connection: connectionRef.current, conference: conferenceRef.current,
    breakoutRooms: state.breakoutRooms,
    toggleAudio, toggleVideo, leave, startScreenShare, stopScreenShare,
    setDisplayName, getDevices, switchCamera, switchMicrophone, setAudioOutput, toggleMirror,
    setVirtualBackground, removeVirtualBackground, setNoiseSuppression, toggleNoiseSuppression,
    sendMessage, sendPrivateMessage, clearMessages, markMessagesRead,
    toggleCaptions, clearCaptions, startRecording, stopRecording,
    toggleWhiteboard, getWhiteboardData, sendWhiteboardData, onWhiteboardData,
    createPoll, votePoll, closePoll,
    setVideoQuality, setSenderQuality, setMaxVisibleParticipants,
    kickParticipant, muteParticipant, grantModerator, muteAll,
    createBreakoutRoom, joinBreakoutRoom, leaveBreakoutRoom,
    removeBreakoutRoom, renameBreakoutRoom, sendToBreakoutRoom
  };

  return <JitsiContext.Provider value={contextValue}>{children}</JitsiContext.Provider>;
}
