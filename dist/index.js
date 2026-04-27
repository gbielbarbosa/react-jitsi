import React5, { createContext, useReducer, useRef, useCallback, useEffect, useState, useContext } from 'react';
import { jsx, Fragment, jsxs } from 'react/jsx-runtime';
import { Rnd } from 'react-rnd';
import * as HoverCard2 from '@radix-ui/react-hover-card';
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover';

// src/JitsiProvider.tsx
var JitsiContext = createContext(null);
function useJitsiContext() {
  const ctx = useContext(JitsiContext);
  if (!ctx) {
    throw new Error(
      '[react-jitsi] useJitsi() must be used within a <JitsiProvider>. Wrap your component tree with <JitsiProvider domain="..." roomName="...">.'
    );
  }
  return ctx;
}
function getJitsiMeetJS() {
  const g = typeof window !== "undefined" ? window : void 0;
  if (!g || !g["JitsiMeetJS"]) {
    if (g && g["JitsiMeetExternalAPI"]) {
      throw new Error(
        '[react-jitsi] Found JitsiMeetExternalAPI (IFrame API), but this SDK requires lib-jitsi-meet.\nPlease replace the external_api.js script with lib-jitsi-meet:\n\n  <script src="https://8x8.vc/libs/lib-jitsi-meet.min.js"></script>\n\n'
      );
    }
    throw new Error(
      '[react-jitsi] JitsiMeetJS is not available. Please load lib-jitsi-meet via a <script> tag before using <JitsiProvider>.\n\n  <script src="https://8x8.vc/libs/lib-jitsi-meet.min.js"></script>\n\n'
    );
  }
  return g["JitsiMeetJS"];
}
var msgIdCounter = 0;
function nextMsgId() {
  return `msg-${Date.now()}-${++msgIdCounter}`;
}
var pollIdCounter = 0;
function nextPollId() {
  return `poll-${Date.now()}-${++pollIdCounter}`;
}
var initialState = {
  connectionStatus: "disconnected",
  conferenceStatus: "none",
  localTracks: [],
  remoteTracks: /* @__PURE__ */ new Map(),
  participants: /* @__PURE__ */ new Map(),
  localParticipantId: null,
  localRole: "none",
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
  virtualBackground: null,
  whiteboardActive: false,
  whiteboardData: null,
  polls: [],
  activePoll: null
};
function jitsiReducer(state, action) {
  switch (action.type) {
    case "SET_CONNECTION_STATUS":
      return { ...state, connectionStatus: action.status };
    case "SET_CONFERENCE_STATUS":
      return { ...state, conferenceStatus: action.status };
    case "SET_LOCAL_TRACKS":
      return { ...state, localTracks: action.tracks };
    case "ADD_LOCAL_TRACK":
      return { ...state, localTracks: [...state.localTracks, action.track] };
    case "REMOVE_LOCAL_TRACK":
      return { ...state, localTracks: state.localTracks.filter((t) => t.getId() !== action.track.getId()) };
    case "ADD_REMOTE_TRACK": {
      const m = new Map(state.remoteTracks);
      const ex = m.get(action.participantId) || [];
      if (!ex.some((t) => t.getId() === action.track.getId())) {
        m.set(action.participantId, [...ex, action.track]);
      }
      return { ...state, remoteTracks: m };
    }
    case "REMOVE_REMOTE_TRACK": {
      const m = new Map(state.remoteTracks);
      const ex = m.get(action.participantId) || [];
      const f = ex.filter((t) => t.getId() !== action.track.getId());
      f.length === 0 ? m.delete(action.participantId) : m.set(action.participantId, f);
      return { ...state, remoteTracks: m };
    }
    case "ADD_PARTICIPANT": {
      const m = new Map(state.participants);
      m.set(action.participant.id, action.participant);
      return { ...state, participants: m };
    }
    case "REMOVE_PARTICIPANT": {
      const m = new Map(state.participants);
      m.delete(action.participantId);
      return { ...state, participants: m };
    }
    case "UPDATE_PARTICIPANT": {
      const m = new Map(state.participants);
      const p = m.get(action.participantId);
      if (p) {
        const changes = { ...action.changes };
        if (changes.stats && p.stats) {
          const cleanNewStats = Object.fromEntries(
            Object.entries(changes.stats).filter(([_, v]) => v !== void 0)
          );
          changes.stats = { ...p.stats, ...cleanNewStats };
        }
        m.set(action.participantId, { ...p, ...changes });
      }
      return { ...state, participants: m };
    }
    case "SET_LOCAL_PARTICIPANT_ID":
      return { ...state, localParticipantId: action.id };
    case "SET_LOCAL_ROLE":
      return { ...state, localRole: action.role };
    case "SET_AUDIO_MUTED":
      return { ...state, audioMuted: action.muted };
    case "SET_VIDEO_MUTED":
      return { ...state, videoMuted: action.muted };
    case "SET_SCREEN_SHARING":
      return { ...state, isScreenSharing: action.sharing, localScreenTrack: action.screenTrack };
    case "SET_MIRRORED":
      return { ...state, isMirrored: action.mirrored };
    case "CLEAR_REMOTE_PARTICIPANT": {
      const rt = new Map(state.remoteTracks);
      rt.delete(action.participantId);
      const pp = new Map(state.participants);
      pp.delete(action.participantId);
      return { ...state, remoteTracks: rt, participants: pp };
    }
    // Chat
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message], unreadCount: state.unreadCount + 1 };
    case "CLEAR_MESSAGES":
      return { ...state, messages: [], unreadCount: 0 };
    case "MARK_MESSAGES_READ":
      return { ...state, unreadCount: 0 };
    // Captions
    case "SET_CAPTIONS_ENABLED":
      return { ...state, captionsEnabled: action.enabled };
    case "ADD_CAPTION": {
      const MAX_CAPTIONS = 50;
      const next = [...state.captions, action.caption];
      return { ...state, captions: next.length > MAX_CAPTIONS ? next.slice(-MAX_CAPTIONS) : next };
    }
    case "CLEAR_CAPTIONS":
      return { ...state, captions: [] };
    // Recording
    case "SET_RECORDING":
      return { ...state, isRecording: action.recording, recordingSession: action.session };
    // Noise suppression
    case "SET_NOISE_SUPPRESSION":
      return { ...state, noiseSuppressionEnabled: action.enabled };
    // Virtual background
    case "SET_VIRTUAL_BACKGROUND":
      return { ...state, virtualBackground: action.config };
    // Whiteboard
    case "SET_WHITEBOARD_ACTIVE":
      return { ...state, whiteboardActive: action.active };
    // Polls
    case "ADD_POLL":
      return { ...state, polls: [...state.polls, action.poll] };
    case "UPDATE_POLL":
      return { ...state, polls: state.polls.map((p) => p.id === action.poll.id ? action.poll : p) };
    case "SET_ACTIVE_POLL":
      return { ...state, activePoll: action.poll };
    // Reset
    case "RESET":
      return { ...initialState, remoteTracks: /* @__PURE__ */ new Map(), participants: /* @__PURE__ */ new Map() };
    default:
      return state;
  }
}
function JitsiProvider({
  domain,
  roomName,
  userInfo,
  token = null,
  tenant,
  serviceUrl: serviceUrlProp,
  connectionOptions: connectionOptionsProp,
  configOverwrite,
  autoJoin = true,
  devices = ["audio", "video"],
  onConferenceJoined,
  onConferenceLeft,
  onParticipantJoined,
  onParticipantLeft,
  onMessageReceived,
  onError,
  onConnectionStatusChanged,
  virtualBackgroundEffects,
  children
}) {
  const [state, dispatch] = useReducer(jitsiReducer, initialState);
  const connectionRef = useRef(null);
  const conferenceRef = useRef(null);
  const localTracksRef = useRef([]);
  const screenTrackRef = useRef(null);
  const remoteTracksRef = useRef(/* @__PURE__ */ new Map());
  remoteTracksRef.current = state.remoteTracks;
  const noiseEffectRef = useRef(null);
  const vbEffectRef = useRef(null);
  const whiteboardHandlerRef = useRef(null);
  const whiteboardData = useRef(null);
  const isLeavingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(true);
  const recordingSessionIdRef = useRef(null);
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
    onConferenceJoined,
    onConferenceLeft,
    onParticipantJoined,
    onParticipantLeft,
    onMessageReceived,
    onError,
    onConnectionStatusChanged
  });
  callbacksRef.current = {
    onConferenceJoined,
    onConferenceLeft,
    onParticipantJoined,
    onParticipantLeft,
    onMessageReceived,
    onError,
    onConnectionStatusChanged
  };
  const safeDispatch = useCallback((action) => {
    if (isMountedRef.current) dispatch(action);
  }, []);
  const cleanup = useCallback(async () => {
    isLeavingRef.current = true;
    if (screenTrackRef.current) {
      try {
        await screenTrackRef.current.dispose();
      } catch {
      }
      screenTrackRef.current = null;
    }
    for (const track of localTracksRef.current) {
      try {
        await track.dispose();
      } catch {
      }
    }
    localTracksRef.current = [];
    if (conferenceRef.current) {
      try {
        await conferenceRef.current.leave();
      } catch {
      }
      conferenceRef.current = null;
    }
    if (connectionRef.current) {
      try {
        connectionRef.current.disconnect();
      } catch {
      }
      connectionRef.current = null;
    }
    safeDispatch({ type: "RESET" });
    isLeavingRef.current = false;
  }, [safeDispatch]);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  useEffect(() => {
    if (isInitializedRef.current || !autoJoin) return;
    isInitializedRef.current = true;
    const JitsiMeetJS = getJitsiMeetJS();
    if (JitsiMeetJS.logLevels) {
      JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
    }
    try {
      JitsiMeetJS.init({ disableAudioLevels: false });
    } catch {
    }
    const t = tenantRef.current;
    const mucDomain = t ? `conference.${t}.${domain}` : `conference.${domain}`;
    const defaultHosts = {
      domain,
      muc: mucDomain,
      focus: `focus.${domain}`
    };
    const userHosts = connectionOptionsRef.current?.hosts;
    const mergedHosts = userHosts ? { ...defaultHosts, ...userHosts } : defaultHosts;
    let serviceUrl = serviceUrlRef.current;
    if (!serviceUrl) {
      serviceUrl = t ? `wss://${domain}/${t}/xmpp-websocket` : `wss://${domain}/xmpp-websocket`;
    }
    if (!serviceUrl.includes("room=")) {
      const separator = serviceUrl.includes("?") ? "&" : "?";
      serviceUrl = `${serviceUrl}${separator}room=${roomName}`;
    }
    const connOptions = {
      hosts: mergedHosts,
      serviceUrl
    };
    if (connectionOptionsRef.current?.bosh) connOptions.bosh = connectionOptionsRef.current.bosh;
    if (connectionOptionsRef.current?.clientNode) connOptions.clientNode = connectionOptionsRef.current.clientNode;
    const connection = new JitsiMeetJS.JitsiConnection(null, token, connOptions);
    connectionRef.current = connection;
    safeDispatch({ type: "SET_CONNECTION_STATUS", status: "connecting" });
    callbacksRef.current.onConnectionStatusChanged?.("connecting");
    const onConnectionSuccess = () => {
      if (!isMountedRef.current) return;
      safeDispatch({ type: "SET_CONNECTION_STATUS", status: "connected" });
      callbacksRef.current.onConnectionStatusChanged?.("connected");
      const confOptions = {
        openBridgeChannel: true,
        // P2P is disabled by default because it only supports one video track
        // per peer connection. Screen sharing adds a second video track which
        // requires JVB (Jitsi Videobridge) mode. Users can re-enable P2P via
        // configOverwrite if they don't need simultaneous camera + screen share.
        p2p: { enabled: false },
        ...configOverwriteRef.current
      };
      const conference = connection.initJitsiConference(roomName, confOptions);
      conferenceRef.current = conference;
      safeDispatch({ type: "SET_CONFERENCE_STATUS", status: "joining" });
      conference.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, () => {
        if (!isMountedRef.current) return;
        const myId = conference.myUserId();
        safeDispatch({ type: "SET_LOCAL_PARTICIPANT_ID", id: myId });
        safeDispatch({ type: "SET_CONFERENCE_STATUS", status: "joined" });
        const role = conference.isModerator() ? "moderator" : "participant";
        safeDispatch({ type: "SET_LOCAL_ROLE", role });
        const displayName = userInfoRef.current?.displayName || "Me";
        safeDispatch({
          type: "ADD_PARTICIPANT",
          participant: {
            id: myId,
            displayName,
            role,
            isLocal: true,
            audioMuted: false,
            videoMuted: false
          }
        });
        if (userInfoRef.current?.displayName) conference.setDisplayName(userInfoRef.current.displayName);
        if (conferenceRef.current.rtc?._channel?.isOpen?.())
          conference.broadcastEndpointMessage({ type: "request-whiteboard" });
        callbacksRef.current.onConferenceJoined?.();
      });
      conference.on(JitsiMeetJS.events.conference.CONFERENCE_LEFT, () => {
        safeDispatch({ type: "SET_CONFERENCE_STATUS", status: "left" });
        callbacksRef.current.onConferenceLeft?.();
      });
      conference.on(JitsiMeetJS.events.conference.CONFERENCE_ERROR, (err) => {
        safeDispatch({ type: "SET_CONFERENCE_STATUS", status: "error" });
        callbacksRef.current.onError?.(new Error(String(err)));
      });
      conference.on(JitsiMeetJS.events.conference.TRACK_ADDED, (track) => {
        if (isLeavingRef.current) return;
        if (track.isLocal()) return;
        const pid = track.getParticipantId();
        const myId = conference.myUserId();
        if (pid === myId) return;
        safeDispatch({ type: "ADD_REMOTE_TRACK", participantId: pid, track });
        try {
          const remoteTrack = track;
          const mediaTrack = remoteTrack["getTrack"] ? remoteTrack.getTrack() : null;
          if (mediaTrack) {
            const handleEnded = () => {
              safeDispatch({ type: "REMOVE_REMOTE_TRACK", participantId: pid, track });
              mediaTrack.removeEventListener("ended", handleEnded);
            };
            mediaTrack.addEventListener("ended", handleEnded);
          }
        } catch {
        }
      });
      conference.on(JitsiMeetJS.events.conference.TRACK_REMOVED, (track) => {
        let pid = track.getParticipantId();
        const myId = conference.myUserId();
        if (!pid) {
          const rt = remoteTracksRef.current;
          for (const [participantId, tracks] of rt.entries()) {
            if (tracks.some((t2) => t2.getId() === track.getId())) {
              pid = participantId;
              break;
            }
          }
        }
        if (pid === myId) return;
        if (!pid) return;
        safeDispatch({ type: "REMOVE_REMOTE_TRACK", participantId: pid, track });
      });
      conference.on(
        JitsiMeetJS.events.conference.ENDPOINT_MESSAGE_RECEIVED,
        (participant, msg) => {
          if (msg && msg.type === "screen-share-stopped") {
            const pid = participant.getId();
            const tracks = remoteTracksRef.current.get(pid) || [];
            const desktopTracks = tracks.filter((t2) => t2.getVideoType?.() === "desktop");
            for (const dt of desktopTracks) {
              safeDispatch({ type: "REMOVE_REMOTE_TRACK", participantId: pid, track: dt });
            }
          }
        }
      );
      conference.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, (track) => {
        if (track.isLocal()) {
          if (screenTrackRef.current && track.getId?.() === screenTrackRef.current.getId?.()) return;
          safeDispatch({ type: track.getType() === "audio" ? "SET_AUDIO_MUTED" : "SET_VIDEO_MUTED", muted: track.isMuted() });
        } else {
          if (track.getVideoType?.() === "desktop") return;
          safeDispatch({
            type: "UPDATE_PARTICIPANT",
            participantId: track.getParticipantId(),
            changes: track.getType() === "audio" ? { audioMuted: track.isMuted() } : { videoMuted: track.isMuted() }
          });
        }
      });
      conference.on(JitsiMeetJS.events.conference.USER_JOINED, (id, p) => {
        const np = { id, displayName: p.getDisplayName() || `Participant ${id.substring(0, 6)}`, role: p.getRole() || "participant", isLocal: false, audioMuted: false, videoMuted: false };
        safeDispatch({ type: "ADD_PARTICIPANT", participant: np });
        callbacksRef.current.onParticipantJoined?.(np);
      });
      conference.on(JitsiMeetJS.events.conference.USER_LEFT, (id) => {
        safeDispatch({ type: "CLEAR_REMOTE_PARTICIPANT", participantId: id });
        callbacksRef.current.onParticipantLeft?.(id);
      });
      conference.on(JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, (id, displayName) => {
        safeDispatch({ type: "UPDATE_PARTICIPANT", participantId: id, changes: { displayName } });
      });
      conference.on(JitsiMeetJS.events.conference.USER_ROLE_CHANGED, (id, role) => {
        safeDispatch({ type: "UPDATE_PARTICIPANT", participantId: id, changes: { role } });
        const myId = conference.myUserId();
        if (id === myId) {
          safeDispatch({ type: "SET_LOCAL_ROLE", role: role === "moderator" ? "moderator" : "participant" });
        }
      });
      conference.on(JitsiMeetJS.events.conference.PARTICIPANT_CONN_STATUS_CHANGED, (id, status) => {
        safeDispatch({ type: "UPDATE_PARTICIPANT", participantId: id, changes: { connectionStatus: status } });
      });
      const localStatsEvent = JitsiMeetJS.events.connectionQuality?.LOCAL_STATS_UPDATED || "cq.local_stats_updated";
      const remoteStatsEvent = JitsiMeetJS.events.connectionQuality?.REMOTE_STATS_UPDATED || "cq.remote_stats_updated";
      conference.on(localStatsEvent, (stats) => {
        if (!stats || !isMountedRef.current) return;
        const myId = conference.myUserId();
        const transport = stats.transport?.[0];
        let remoteAddress;
        let remotePort;
        let localAddress;
        let localPort;
        if (transport) {
          const remoteParts = transport.ip?.split(":") || [];
          remoteAddress = remoteParts[0];
          remotePort = remoteParts[1] ? parseInt(remoteParts[1], 10) : void 0;
          const localParts = transport.localip?.split(":") || [];
          localAddress = localParts[0];
          localPort = localParts[1] ? parseInt(localParts[1], 10) : void 0;
        }
        const allParticipantIds = /* @__PURE__ */ new Set([
          ...Object.keys(stats.resolution || {}),
          ...Object.keys(stats.framerate || {}),
          ...Object.keys(stats.codec || {}),
          myId
          // Always process local
        ]);
        allParticipantIds.forEach((pid) => {
          const ssrcMapRes = stats.resolution?.[pid];
          const resObj = ssrcMapRes ? Object.values(ssrcMapRes)[0] : void 0;
          const ssrcMapFr = stats.framerate?.[pid];
          const frameRate = ssrcMapFr ? Object.values(ssrcMapFr)[0] : void 0;
          const ssrcMapCodec = stats.codec?.[pid];
          let codecName;
          let audioSsrc;
          let videoSsrc;
          if (ssrcMapCodec) {
            for (const [ssrc, codecData] of Object.entries(ssrcMapCodec)) {
              if (codecData.audio) {
                audioSsrc = ssrc;
                if (!codecName) codecName = codecData.audio;
              }
              if (codecData.video) {
                videoSsrc = ssrc;
                codecName = codecData.video;
              }
            }
          }
          const isLocal = pid === myId;
          const participantStats = {
            isLocal,
            participantId: pid,
            resolution: resObj ? `${resObj.width}x${resObj.height}` : void 0,
            frameRate,
            codec: codecName,
            audioSsrc,
            videoSsrc,
            connectedTo: "Jitsi Videobridge"
          };
          if (isLocal) {
            participantStats.bitrate = stats.bitrate ? Math.round((stats.bitrate.download || 0) + (stats.bitrate.upload || 0)) : void 0;
            participantStats.packetLoss = stats.packetLoss?.total !== void 0 ? stats.packetLoss.total : 0;
            participantStats.estimatedBandwidth = stats.bandwidth ? Math.round(stats.bandwidth.download || 0) : void 0;
            participantStats.localAddress = localAddress;
            participantStats.localPort = localPort;
            participantStats.remoteAddress = remoteAddress;
            participantStats.remotePort = remotePort;
            participantStats.transport = transport?.type;
            participantStats.servers = stats.serverRegion || "Jitsi Server";
          }
          safeDispatch({ type: "UPDATE_PARTICIPANT", participantId: pid, changes: { stats: participantStats } });
        });
      });
      conference.on(remoteStatsEvent, (id, stats) => {
        if (!stats || !isMountedRef.current) return;
        const parsedRemoteStats = {
          isLocal: false,
          participantId: id,
          bitrate: stats.bitrate ? Math.round((stats.bitrate.download || 0) + (stats.bitrate.upload || 0)) : void 0,
          packetLoss: stats.packetLoss?.total || 0,
          connectedTo: "Jitsi Videobridge"
        };
        safeDispatch({ type: "UPDATE_PARTICIPANT", participantId: id, changes: { stats: parsedRemoteStats } });
      });
      conference.on(JitsiMeetJS.events.conference.MESSAGE_RECEIVED, (id, text, ts) => {
        if (id === conference.myUserId()) return;
        const p = conference.getParticipantById(id);
        const msg = {
          id: nextMsgId(),
          participantId: id,
          displayName: p?.getDisplayName() || id,
          text,
          timestamp: ts || Date.now(),
          isPrivate: false,
          isLocal: false
        };
        safeDispatch({ type: "ADD_MESSAGE", message: msg });
        callbacksRef.current.onMessageReceived?.(msg);
      });
      conference.on(JitsiMeetJS.events.conference.PRIVATE_MESSAGE_RECEIVED, (id, text, ts) => {
        const p = conference.getParticipantById(id);
        const msg = {
          id: nextMsgId(),
          participantId: id,
          displayName: p?.getDisplayName() || id,
          text,
          timestamp: ts || Date.now(),
          isPrivate: true,
          isLocal: false
        };
        safeDispatch({ type: "ADD_MESSAGE", message: msg });
        callbacksRef.current.onMessageReceived?.(msg);
      });
      conference.on(JitsiMeetJS.events.conference.RECORDER_STATE_CHANGED, (status) => {
        const isOn = status.status === "on" || status.status === "pending";
        const session = status.id ? {
          id: status.id,
          mode: status.mode || "file",
          status: status.status || "off",
          error: status.error
        } : null;
        if (session?.id) recordingSessionIdRef.current = session.id;
        safeDispatch({ type: "SET_RECORDING", recording: isOn, session });
      });
      conference.on(JitsiMeetJS.events.conference.TRANSCRIPTION_STATUS_CHANGED, (status) => {
        safeDispatch({ type: "SET_CAPTIONS_ENABLED", enabled: status === "ON" });
      });
      conference.on(JitsiMeetJS.events.conference.ENDPOINT_MESSAGE_RECEIVED, (_, payload) => {
        if (payload.type === "transcription-result" && payload.text) {
          const caption = {
            participantId: payload.participant?.id || "",
            displayName: payload.participant?.name || "",
            text: payload.text,
            timestamp: Date.now(),
            language: payload.language,
            isFinal: payload.final ?? true
          };
          safeDispatch({ type: "ADD_CAPTION", caption });
        }
        if (payload.type === "request-whiteboard") {
          const ids = [conference.myUserId(), ...conference.getParticipants().map((p) => p.getId())].sort();
          if (ids[0] !== conference.myUserId()) return;
          if (state.whiteboardData) conference.broadcastEndpointMessage({ type: "whiteboard-data", data: state.whiteboardData });
        }
        if (payload.type === "whiteboard-data") {
          const wd = payload.data;
          if (wd.senderId === conference.myUserId()) return;
          whiteboardHandlerRef.current?.(wd);
          whiteboardData.current = wd;
        }
        if (payload.type === "poll-data") {
          const pd = payload;
          if (pd.action === "create") {
            safeDispatch({ type: "ADD_POLL", poll: pd.poll });
            safeDispatch({ type: "SET_ACTIVE_POLL", poll: pd.poll });
          } else if (pd.action === "vote" || pd.action === "close") {
            safeDispatch({ type: "UPDATE_POLL", poll: pd.poll });
            if (pd.action === "close") {
              safeDispatch({ type: "SET_ACTIVE_POLL", poll: null });
            }
          }
        }
      });
      conference.join();
      JitsiMeetJS.createLocalTracks({ devices: devicesRef.current }).then((tracks) => {
        if (!isMountedRef.current) {
          tracks.forEach((t2) => t2.dispose());
          return;
        }
        localTracksRef.current = tracks;
        safeDispatch({ type: "SET_LOCAL_TRACKS", tracks });
        for (const t2 of tracks) {
          safeDispatch({ type: t2.getType() === "audio" ? "SET_AUDIO_MUTED" : "SET_VIDEO_MUTED", muted: t2.isMuted() });
        }
        return Promise.all(tracks.map((t2) => conference.addTrack(t2)));
      }).catch((err) => {
        console.error("[react-jitsi] Error creating local tracks:", err);
        callbacksRef.current.onError?.(err);
      });
    };
    const onConnectionFailed = (err) => {
      safeDispatch({ type: "SET_CONNECTION_STATUS", status: "failed" });
      callbacksRef.current.onConnectionStatusChanged?.("failed");
      callbacksRef.current.onError?.(new Error(`Connection failed: ${err}`));
    };
    const onDisconnected = () => {
      if (isLeavingRef.current) return;
      safeDispatch({ type: "SET_CONNECTION_STATUS", status: "disconnected" });
      callbacksRef.current.onConnectionStatusChanged?.("disconnected");
    };
    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, onDisconnected);
    connection.connect();
    return () => {
      isInitializedRef.current = false;
      cleanup();
    };
  }, [domain, roomName, token, autoJoin, safeDispatch, cleanup]);
  const toggleAudio = useCallback(async () => {
    const t = localTracksRef.current.find((t2) => t2.getType() === "audio");
    if (!t) return;
    t.isMuted() ? await t.unmute() : await t.mute();
    dispatch({ type: "SET_AUDIO_MUTED", muted: t.isMuted() });
  }, []);
  const toggleVideo = useCallback(async () => {
    const t = localTracksRef.current.find((t2) => t2.getType() === "video" && t2.getVideoType?.() !== "desktop");
    if (!t) return;
    if (t.isMuted()) {
      await t.unmute();
    } else {
      await t.mute();
    }
    dispatch({ type: "SET_VIDEO_MUTED", muted: t.isMuted() });
  }, []);
  const leave = useCallback(async () => {
    await cleanup();
  }, [cleanup]);
  const startScreenShare = useCallback(async (options) => {
    if (!conferenceRef.current) return;
    try {
      const JitsiMeetJS = getJitsiMeetJS();
      const constraints = {};
      if (options?.frameRate) {
        constraints.video = { frameRate: { max: options.frameRate } };
      }
      const tracks = await JitsiMeetJS.createLocalTracks({
        devices: ["desktop"],
        ...Object.keys(constraints).length > 0 ? { constraints } : {}
      });
      const screenTrack = tracks.find((t) => t.getType() === "video");
      const extraTracks = tracks.filter((t) => t !== screenTrack);
      for (const extra of extraTracks) {
        try {
          await extra.dispose();
        } catch {
        }
      }
      if (!screenTrack) return;
      screenTrackRef.current = screenTrack;
      await conferenceRef.current.addTrack(screenTrack);
      dispatch({ type: "SET_SCREEN_SHARING", sharing: true, screenTrack });
      screenTrack.addEventListener("local_track_stopped", () => {
        stopScreenShare();
      });
    } catch (err) {
      if (err?.name !== "gum.screensharing_user_canceled") callbacksRef.current.onError?.(err);
    }
  }, []);
  const stopScreenShare = useCallback(async () => {
    if (!conferenceRef.current || !screenTrackRef.current) return;
    try {
      try {
        conferenceRef.current.broadcastEndpointMessage({ type: "screen-share-stopped" });
      } catch {
      }
      await conferenceRef.current.removeTrack(screenTrackRef.current);
      await screenTrackRef.current.dispose();
      screenTrackRef.current = null;
      dispatch({ type: "SET_SCREEN_SHARING", sharing: false, screenTrack: null });
    } catch (err) {
      callbacksRef.current.onError?.(err);
    }
  }, []);
  const setDisplayName = useCallback((name) => {
    conferenceRef.current?.setDisplayName(name);
  }, []);
  const getDevices = useCallback(() => {
    return new Promise((resolve) => {
      try {
        getJitsiMeetJS().mediaDevices.enumerateDevices((d) => resolve(d));
      } catch {
        resolve([]);
      }
    });
  }, []);
  const switchCamera = useCallback(async (deviceId) => {
    if (!conferenceRef.current) return;
    try {
      const newTracks = await getJitsiMeetJS().createLocalTracks({ devices: ["video"], cameraDeviceId: deviceId });
      const nv = newTracks[0];
      if (!nv) return;
      const ov = localTracksRef.current.find((t) => t.getType() === "video" && t.getVideoType?.() !== "desktop");
      if (ov) {
        await conferenceRef.current.replaceTrack(ov, nv);
        await ov.dispose();
        localTracksRef.current = localTracksRef.current.map((t) => t.getId() === ov.getId() ? nv : t);
      } else {
        await conferenceRef.current.addTrack(nv);
        localTracksRef.current.push(nv);
      }
      dispatch({ type: "SET_LOCAL_TRACKS", tracks: [...localTracksRef.current] });
    } catch (err) {
      callbacksRef.current.onError?.(err);
    }
  }, []);
  const switchMicrophone = useCallback(async (deviceId) => {
    if (!conferenceRef.current) return;
    try {
      const oa = localTracksRef.current.find((t) => t.getType() === "audio");
      const wasMuted = oa ? oa.isMuted() : false;
      const newTracks = await getJitsiMeetJS().createLocalTracks({ devices: ["audio"], micDeviceId: deviceId });
      const na = newTracks[0];
      if (!na) return;
      if (oa) {
        await conferenceRef.current.replaceTrack(oa, na);
        await oa.dispose();
        localTracksRef.current = localTracksRef.current.map((t) => t.getId() === oa.getId() ? na : t);
      } else {
        await conferenceRef.current.addTrack(na);
        localTracksRef.current.push(na);
      }
      if (wasMuted) {
        await na.mute();
      }
      dispatch({ type: "SET_LOCAL_TRACKS", tracks: [...localTracksRef.current] });
      dispatch({ type: "SET_AUDIO_MUTED", muted: wasMuted });
    } catch (err) {
      callbacksRef.current.onError?.(err);
    }
  }, []);
  const setAudioOutput = useCallback(async (deviceId) => {
    try {
      await getJitsiMeetJS().mediaDevices.setAudioOutputDevice(deviceId);
    } catch (err) {
      callbacksRef.current.onError?.(err);
    }
  }, []);
  const toggleMirror = useCallback(() => {
    dispatch({ type: "SET_MIRRORED", mirrored: !state.isMirrored });
  }, [state.isMirrored]);
  const setVirtualBackground = useCallback(async (config) => {
    const videoTrack = localTracksRef.current.find((t) => t.getType() === "video" && t.getVideoType?.() !== "desktop");
    if (!videoTrack) return;
    try {
      await videoTrack.setEffect(config?.effect);
      vbEffectRef.current = config?.effect || null;
      dispatch({ type: "SET_VIRTUAL_BACKGROUND", config });
    } catch (err) {
      callbacksRef.current.onError?.(err);
    }
  }, []);
  const removeVirtualBackground = useCallback(async () => {
    await setVirtualBackground(null);
  }, [setVirtualBackground]);
  const setNoiseSuppression = useCallback(async (effect) => {
    const audioTrack = localTracksRef.current.find((t) => t.getType() === "audio");
    if (!audioTrack) return;
    try {
      if (effect) {
        await audioTrack.setEffect(effect);
        noiseEffectRef.current = effect;
        dispatch({ type: "SET_NOISE_SUPPRESSION", enabled: true });
      } else {
        await audioTrack.setEffect(void 0);
        noiseEffectRef.current = null;
        dispatch({ type: "SET_NOISE_SUPPRESSION", enabled: false });
      }
    } catch (err) {
      callbacksRef.current.onError?.(err);
    }
  }, []);
  const toggleNoiseSuppression = useCallback(async () => {
    if (noiseEffectRef.current) {
      await setNoiseSuppression(null);
    }
  }, [setNoiseSuppression]);
  const sendMessage = useCallback((text, to) => {
    if (!conferenceRef.current) return;
    if (to) {
      conferenceRef.current.sendMessage(text, to, false);
    } else {
      conferenceRef.current.sendTextMessage(text);
    }
    const myId = conferenceRef.current.myUserId();
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: nextMsgId(),
        participantId: myId,
        displayName: userInfo?.displayName || "Me",
        text,
        timestamp: Date.now(),
        isPrivate: !!to,
        isLocal: true
      }
    });
  }, [userInfo?.displayName]);
  const sendPrivateMessage = useCallback((text, participantId) => {
    sendMessage(text, participantId);
  }, [sendMessage]);
  const clearMessages = useCallback(() => {
    dispatch({ type: "CLEAR_MESSAGES" });
  }, []);
  const markMessagesRead = useCallback(() => {
    dispatch({ type: "MARK_MESSAGES_READ" });
  }, []);
  const toggleCaptions = useCallback(() => {
    dispatch({ type: "SET_CAPTIONS_ENABLED", enabled: !state.captionsEnabled });
  }, [state.captionsEnabled]);
  const clearCaptions = useCallback(() => {
    dispatch({ type: "CLEAR_CAPTIONS" });
  }, []);
  const startRecording = useCallback(async (options) => {
    if (!conferenceRef.current) return;
    try {
      await conferenceRef.current.startRecording(options);
    } catch (err) {
      callbacksRef.current.onError?.(err);
    }
  }, []);
  const stopRecording = useCallback(async () => {
    if (!conferenceRef.current || !recordingSessionIdRef.current) return;
    try {
      await conferenceRef.current.stopRecording(recordingSessionIdRef.current);
    } catch (err) {
      callbacksRef.current.onError?.(err);
    }
  }, []);
  const toggleWhiteboard = useCallback(() => {
    dispatch({ type: "SET_WHITEBOARD_ACTIVE", active: !state.whiteboardActive });
  }, [state.whiteboardActive]);
  const getWhiteboardData = useCallback(() => {
    return whiteboardData.current;
  }, []);
  const sendWhiteboardData = useCallback((data) => {
    whiteboardData.current = data;
    if (!conferenceRef.current) return;
    if (!conferenceRef.current.rtc?._channel?.isOpen?.()) return;
    conferenceRef.current.broadcastEndpointMessage({ type: "whiteboard-data", data });
  }, []);
  const onWhiteboardData = useCallback((handler) => {
    whiteboardHandlerRef.current = handler;
    return () => {
      whiteboardHandlerRef.current = null;
    };
  }, []);
  const createPoll = useCallback((question, options) => {
    if (!conferenceRef.current) return;
    if (!conferenceRef.current.rtc?._channel?.isOpen?.()) return;
    const poll = {
      id: nextPollId(),
      creatorId: conferenceRef.current.myUserId(),
      creatorName: userInfo?.displayName || "Me",
      question,
      options: options.map((text) => ({ text, voters: [] })),
      isOpen: true,
      timestamp: Date.now()
    };
    dispatch({ type: "ADD_POLL", poll });
    dispatch({ type: "SET_ACTIVE_POLL", poll });
    conferenceRef.current.broadcastEndpointMessage({ type: "poll-data", action: "create", poll });
  }, [userInfo?.displayName]);
  const pollsRef = useRef(state.polls);
  pollsRef.current = state.polls;
  const votePoll = useCallback((pollId, optionIndex) => {
    if (!conferenceRef.current) return;
    const myId = conferenceRef.current.myUserId();
    const poll = pollsRef.current.find((p) => p.id === pollId);
    if (!poll || !poll.isOpen) return;
    const updatedOptions = poll.options.map((opt, idx) => {
      const withoutMe = opt.voters.filter((v) => v !== myId);
      return idx === optionIndex ? { ...opt, voters: [...withoutMe, myId] } : { ...opt, voters: withoutMe };
    });
    const updatedPoll = { ...poll, options: updatedOptions };
    dispatch({ type: "UPDATE_POLL", poll: updatedPoll });
    conferenceRef.current.broadcastEndpointMessage({ type: "poll-data", action: "vote", poll: updatedPoll });
  }, []);
  const closePoll = useCallback((pollId) => {
    if (!conferenceRef.current) return;
    const poll = pollsRef.current.find((p) => p.id === pollId);
    if (!poll) return;
    const closed = { ...poll, isOpen: false };
    dispatch({ type: "UPDATE_POLL", poll: closed });
    dispatch({ type: "SET_ACTIVE_POLL", poll: null });
    conferenceRef.current.broadcastEndpointMessage({ type: "poll-data", action: "close", poll: closed });
  }, []);
  const setVideoQuality = useCallback((maxHeight) => {
    conferenceRef.current?.setReceiverConstraints({ defaultConstraints: { maxHeight } });
  }, []);
  const setSenderQuality = useCallback(async (maxHeight) => {
    try {
      await conferenceRef.current?.setSenderVideoConstraint(maxHeight);
    } catch (err) {
      callbacksRef.current.onError?.(err);
    }
  }, []);
  const setMaxVisibleParticipants = useCallback((n) => {
    conferenceRef.current?.setReceiverConstraints({ lastN: n });
  }, []);
  const kickParticipant = useCallback((id, reason) => {
    conferenceRef.current?.kickParticipant(id, reason);
  }, []);
  const muteParticipant = useCallback((id, mediaType) => {
    conferenceRef.current?.muteParticipant(id, mediaType || "audio");
  }, []);
  const grantModerator = useCallback((id) => {
    conferenceRef.current?.grantOwner(id);
  }, []);
  const muteAll = useCallback((mediaType) => {
    if (!conferenceRef.current) return;
    const mt = mediaType || "audio";
    conferenceRef.current.getParticipants().forEach((p) => {
      conferenceRef.current?.muteParticipant(p.getId(), mt);
    });
  }, []);
  const contextValue = {
    connectionStatus: state.connectionStatus,
    conferenceStatus: state.conferenceStatus,
    localTracks: state.localTracks,
    localScreenTrack: state.localScreenTrack,
    remoteTracks: state.remoteTracks,
    participants: state.participants,
    localParticipantId: state.localParticipantId,
    localRole: state.localRole,
    audioMuted: state.audioMuted,
    videoMuted: state.videoMuted,
    isScreenSharing: state.isScreenSharing,
    isMirrored: state.isMirrored,
    messages: state.messages,
    unreadCount: state.unreadCount,
    captionsEnabled: state.captionsEnabled,
    captions: state.captions,
    isRecording: state.isRecording,
    recordingSession: state.recordingSession,
    noiseSuppressionEnabled: state.noiseSuppressionEnabled,
    virtualBackground: state.virtualBackground,
    virtualBackgroundEffects: virtualBackgroundEffects || [],
    whiteboardActive: state.whiteboardActive,
    whiteboardData: state.whiteboardData,
    polls: state.polls,
    activePoll: state.activePoll,
    connection: connectionRef.current,
    conference: conferenceRef.current,
    toggleAudio,
    toggleVideo,
    leave,
    startScreenShare,
    stopScreenShare,
    setDisplayName,
    getDevices,
    switchCamera,
    switchMicrophone,
    setAudioOutput,
    toggleMirror,
    setVirtualBackground,
    removeVirtualBackground,
    setNoiseSuppression,
    toggleNoiseSuppression,
    sendMessage,
    sendPrivateMessage,
    clearMessages,
    markMessagesRead,
    toggleCaptions,
    clearCaptions,
    startRecording,
    stopRecording,
    toggleWhiteboard,
    getWhiteboardData,
    sendWhiteboardData,
    onWhiteboardData,
    createPoll,
    votePoll,
    closePoll,
    setVideoQuality,
    setSenderQuality,
    setMaxVisibleParticipants,
    kickParticipant,
    muteParticipant,
    grantModerator,
    muteAll
  };
  return /* @__PURE__ */ jsx(JitsiContext.Provider, { value: contextValue, children });
}

// src/useJitsi.ts
function useJitsi() {
  return useJitsiContext();
}

// src/utils/layout.ts
function calculateGridSettings(containerWidth, containerHeight, count, aspectRatio = 16 / 9, gap = 8) {
  if (count === 0 || containerWidth === 0 || containerHeight === 0) {
    return { cols: 1, rows: 1, width: 0, height: 0 };
  }
  let bestLayout = { cols: 1, rows: 1, width: 0, height: 0 };
  let maxArea = 0;
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);
    const availableWidth = containerWidth - (cols + 1) * gap;
    const availableHeight = containerHeight - (rows + 1) * gap;
    let itemWidth = availableWidth / cols;
    let itemHeight = itemWidth / aspectRatio;
    if (itemHeight * rows > availableHeight) {
      itemHeight = availableHeight / rows;
      itemWidth = itemHeight * aspectRatio;
    }
    if (itemWidth > 0 && itemHeight > 0) {
      const area = itemWidth * itemHeight;
      if (area > maxArea) {
        maxArea = area;
        bestLayout = {
          cols,
          rows,
          width: itemWidth,
          height: itemHeight
        };
      }
    }
  }
  return bestLayout;
}
function ParticipantStatsPanel({ stats, className, style, children }) {
  if (children) return /* @__PURE__ */ jsx(Fragment, { children: children(stats) });
  if (stats.isScreenShare) {
    return /* @__PURE__ */ jsxs("div", { className: `rj-stats-panel ${className || ""}`, style, children: [
      /* @__PURE__ */ jsx("div", { className: "rj-stats-panel__header", children: "Screen Share Statistics" }),
      /* @__PURE__ */ jsxs("div", { className: "rj-stats-panel__grid", children: [
        /* @__PURE__ */ jsx(StatItem, { label: "Resolution", value: stats.resolution }),
        /* @__PURE__ */ jsx(StatItem, { label: "Frame rate", value: stats.frameRate ? `${stats.frameRate} fps` : void 0 })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: `rj-stats-panel ${className || ""}`, style, children: [
    /* @__PURE__ */ jsx("div", { className: "rj-stats-panel__header", children: stats.isLocal ? "Local Statistics" : "Remote Statistics" }),
    /* @__PURE__ */ jsxs("div", { className: "rj-stats-panel__grid", children: [
      /* @__PURE__ */ jsx(StatItem, { label: "Connection", value: stats.connectionStatus }),
      /* @__PURE__ */ jsx(StatItem, { label: "Bitrate", value: stats.bitrate ? `${stats.bitrate} kbps` : void 0 }),
      /* @__PURE__ */ jsx(StatItem, { label: "Packet loss", value: stats.packetLoss !== void 0 ? `${stats.packetLoss}%` : void 0 }),
      /* @__PURE__ */ jsx(StatItem, { label: "Resolution", value: stats.resolution }),
      /* @__PURE__ */ jsx(StatItem, { label: "Frame rate", value: stats.frameRate ? `${stats.frameRate} fps` : void 0 }),
      /* @__PURE__ */ jsx(StatItem, { label: "Codecs", value: stats.codec }),
      stats.isLocal && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(StatItem, { label: "Estimated bandwidth", value: stats.estimatedBandwidth ? `${stats.estimatedBandwidth} kbps` : void 0 }),
        /* @__PURE__ */ jsx(StatItem, { label: "Remote address", value: stats.remoteAddress }),
        /* @__PURE__ */ jsx(StatItem, { label: "Remote port", value: stats.remotePort?.toString() }),
        /* @__PURE__ */ jsx(StatItem, { label: "Local address", value: stats.localAddress }),
        /* @__PURE__ */ jsx(StatItem, { label: "Local port", value: stats.localPort?.toString() }),
        /* @__PURE__ */ jsx(StatItem, { label: "Transport", value: stats.transport }),
        /* @__PURE__ */ jsx(StatItem, { label: "Servers", value: stats.servers })
      ] }),
      /* @__PURE__ */ jsx(StatItem, { label: "Connected to", value: stats.connectedTo }),
      /* @__PURE__ */ jsx(StatItem, { label: "SSRC Audio", value: stats.audioSsrc }),
      /* @__PURE__ */ jsx(StatItem, { label: "SSRC Video", value: stats.videoSsrc }),
      /* @__PURE__ */ jsx(StatItem, { label: "Participant ID", value: stats.participantId })
    ] })
  ] });
}
function StatItem({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "rj-stats-panel__item", children: [
    /* @__PURE__ */ jsxs("span", { className: "rj-stats-panel__label", children: [
      label,
      ":"
    ] }),
    /* @__PURE__ */ jsx("span", { className: "rj-stats-panel__value", children: value ?? "N/A" })
  ] });
}
function ConnectionIndicator({ participant, stats, className, style, children }) {
  const status = participant.connectionStatus || "active";
  let color = "#22c55e";
  let bars = 3;
  if (status === "inactive") {
    color = "#f59e0b";
    bars = 2;
  } else if (status === "interrupted") {
    color = "#ef4444";
    bars = 1;
  } else if (status === "restoring") {
    color = "#f97316";
    bars = 1;
  }
  const displayStats = {
    isLocal: participant.isLocal,
    connectionStatus: status,
    participantId: participant.id,
    ...participant.stats || {},
    ...stats || {}
  };
  if (children) return /* @__PURE__ */ jsx(Fragment, { children: children(status, bars, color, displayStats) });
  return /* @__PURE__ */ jsxs(HoverCard2.Root, { openDelay: 200, closeDelay: 300, children: [
    /* @__PURE__ */ jsx(HoverCard2.Trigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: `rj-connection-indicator ${className || ""}`,
        style: { position: "relative", display: "flex", alignItems: "flex-end", gap: "2px", height: "14px", cursor: "help", ...style },
        children: [
          /* @__PURE__ */ jsx("div", { style: { width: "3px", height: "6px", backgroundColor: color, borderRadius: "1px" } }),
          /* @__PURE__ */ jsx("div", { style: { width: "3px", height: "10px", backgroundColor: bars >= 2 ? color : "rgba(255,255,255,0.2)", borderRadius: "1px" } }),
          /* @__PURE__ */ jsx("div", { style: { width: "3px", height: "14px", backgroundColor: bars === 3 ? color : "rgba(255,255,255,0.2)", borderRadius: "1px" } })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(HoverCard2.Portal, { children: /* @__PURE__ */ jsxs(
      HoverCard2.Content,
      {
        side: "top",
        align: "center",
        sideOffset: 8,
        style: { zIndex: 1e3, filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))" },
        children: [
          /* @__PURE__ */ jsx(ParticipantStatsPanel, { stats: displayStats, style: { minWidth: "220px", marginTop: 0 } }),
          /* @__PURE__ */ jsx(HoverCard2.Arrow, { fill: "var(--rj-card, #1e1e1e)" })
        ]
      }
    ) })
  ] });
}
function LocalVideo({ className, style, mirror, muted = true, showPlaceholder = true, objectFit = "cover", children }) {
  const videoRef = useRef(null);
  const { localTracks, videoMuted, participants, localParticipantId, isMirrored } = useJitsiContext();
  const shouldMirror = mirror !== void 0 ? mirror : isMirrored;
  const videoTrack = localTracks.find(
    (t) => t.getType() === "video" && t.getVideoType?.() !== "desktop"
  );
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoTrack) return;
    videoTrack.attach(el);
    return () => {
      videoTrack.detach(el);
    };
  }, [videoTrack]);
  const isHidden = videoMuted || !videoTrack;
  const videoStyle = {
    transform: shouldMirror ? "scaleX(-1)" : void 0,
    // Hide but keep mounted when muted
    display: isHidden ? "none" : void 0,
    objectFit
  };
  const localParticipant = localParticipantId ? participants.get(localParticipantId) : null;
  const localName = localParticipant?.displayName || "Me";
  return /* @__PURE__ */ jsxs("div", { className: `rj-local-video ${className || ""}`, style, children: [
    localParticipant && /* @__PURE__ */ jsxs("div", { className: "rj-remote-tile__name", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
      /* @__PURE__ */ jsx("span", { children: "You" }),
      /* @__PURE__ */ jsx(ConnectionIndicator, { participant: localParticipant })
    ] }),
    /* @__PURE__ */ jsx("video", { className: "rj-local-video__video", ref: videoRef, autoPlay: true, playsInline: true, muted, style: videoStyle }),
    isHidden && showPlaceholder && /* @__PURE__ */ jsx("div", { className: "rj-local-video__placeholder", children: /* @__PURE__ */ jsx("div", { className: "rj-avatar", children: localName.charAt(0).toUpperCase() }) }),
    children
  ] });
}
var defaultProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
var MicOnIcon = () => /* @__PURE__ */ jsxs("svg", { ...defaultProps, children: [
  /* @__PURE__ */ jsx("path", { d: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" }),
  /* @__PURE__ */ jsx("path", { d: "M19 10v2a7 7 0 0 1-14 0v-2" }),
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "19", x2: "12", y2: "23" }),
  /* @__PURE__ */ jsx("line", { x1: "8", y1: "23", x2: "16", y2: "23" })
] });
var MicOffIcon = () => /* @__PURE__ */ jsxs("svg", { ...defaultProps, children: [
  /* @__PURE__ */ jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23" }),
  /* @__PURE__ */ jsx("path", { d: "M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" }),
  /* @__PURE__ */ jsx("path", { d: "M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.12 1.5-.34 2.18" }),
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "19", x2: "12", y2: "23" }),
  /* @__PURE__ */ jsx("line", { x1: "8", y1: "23", x2: "16", y2: "23" })
] });
var MicMutedSmallIcon = ({ size = 14 }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", children: [
  /* @__PURE__ */ jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23" }),
  /* @__PURE__ */ jsx("path", { d: "M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" })
] });
var VideoOnIcon = () => /* @__PURE__ */ jsxs("svg", { ...defaultProps, children: [
  /* @__PURE__ */ jsx("polygon", { points: "23 7 16 12 23 17 23 7" }),
  /* @__PURE__ */ jsx("rect", { x: "1", y: "5", width: "15", height: "14", rx: "2", ry: "2" })
] });
var VideoOffIcon = () => /* @__PURE__ */ jsxs("svg", { ...defaultProps, children: [
  /* @__PURE__ */ jsx("path", { d: "M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" }),
  /* @__PURE__ */ jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23" })
] });
var VideoMutedSmallIcon = ({ size = 14 }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", children: [
  /* @__PURE__ */ jsx("path", { d: "M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34" }),
  /* @__PURE__ */ jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23" })
] });
var MicMutedOverlayIcon = () => /* @__PURE__ */ jsxs("svg", { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: "#fff", strokeWidth: 2.5, children: [
  /* @__PURE__ */ jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23" }),
  /* @__PURE__ */ jsx("path", { d: "M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" }),
  /* @__PURE__ */ jsx("path", { d: "M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.12 1.5-.34 2.18" }),
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "19", x2: "12", y2: "23" }),
  /* @__PURE__ */ jsx("line", { x1: "8", y1: "23", x2: "16", y2: "23" })
] });
var ScreenShareIcon = () => /* @__PURE__ */ jsxs("svg", { ...defaultProps, children: [
  /* @__PURE__ */ jsx("rect", { x: "2", y: "3", width: "20", height: "14", rx: "2", ry: "2" }),
  /* @__PURE__ */ jsx("line", { x1: "8", y1: "21", x2: "16", y2: "21" }),
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "17", x2: "12", y2: "21" }),
  /* @__PURE__ */ jsx("polyline", { points: "8 10 12 6 16 10" }),
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "6", x2: "12", y2: "14" })
] });
var StopShareIcon = () => /* @__PURE__ */ jsxs("svg", { ...defaultProps, children: [
  /* @__PURE__ */ jsx("rect", { x: "2", y: "3", width: "20", height: "14", rx: "2", ry: "2" }),
  /* @__PURE__ */ jsx("line", { x1: "8", y1: "21", x2: "16", y2: "21" }),
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "17", x2: "12", y2: "21" }),
  /* @__PURE__ */ jsx("line", { x1: "2", y1: "3", x2: "22", y2: "17" })
] });
var PhoneOffIcon = () => /* @__PURE__ */ jsxs("svg", { ...defaultProps, children: [
  /* @__PURE__ */ jsx("path", { d: "M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" }),
  /* @__PURE__ */ jsx("line", { x1: "23", y1: "1", x2: "1", y2: "23" })
] });
var ChatIcon = () => /* @__PURE__ */ jsx("svg", { ...defaultProps, children: /* @__PURE__ */ jsx("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }) });
var MirrorIcon = () => /* @__PURE__ */ jsxs("svg", { ...defaultProps, children: [
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "2", x2: "12", y2: "22", strokeDasharray: "4 2" }),
  /* @__PURE__ */ jsx("path", { d: "M17 7l3 5-3 5" }),
  /* @__PURE__ */ jsx("path", { d: "M7 7l-3 5 3 5" })
] });
var RecordIcon = () => /* @__PURE__ */ jsxs("svg", { ...defaultProps, children: [
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "8" }),
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3", fill: "currentColor" })
] });
var StopRecordIcon = () => /* @__PURE__ */ jsxs("svg", { ...defaultProps, children: [
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "8" }),
  /* @__PURE__ */ jsx("rect", { x: "9", y: "9", width: "6", height: "6", fill: "currentColor" })
] });
var CaptionsIcon = () => /* @__PURE__ */ jsxs("svg", { ...defaultProps, children: [
  /* @__PURE__ */ jsx("rect", { x: "2", y: "4", width: "20", height: "16", rx: "2" }),
  /* @__PURE__ */ jsx("path", { d: "M7 12h2m4 0h4M7 16h10" })
] });
var PollIcon = () => /* @__PURE__ */ jsxs("svg", { ...defaultProps, children: [
  /* @__PURE__ */ jsx("line", { x1: "18", y1: "20", x2: "18", y2: "10" }),
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "20", x2: "12", y2: "4" }),
  /* @__PURE__ */ jsx("line", { x1: "6", y1: "20", x2: "6", y2: "14" })
] });
var NoiseIcon = () => /* @__PURE__ */ jsx("svg", { ...defaultProps, children: /* @__PURE__ */ jsx("path", { d: "M2 12h2l3-9 4 18 4-18 3 9h2" }) });
var WhiteboardIcon = () => /* @__PURE__ */ jsxs("svg", { ...defaultProps, children: [
  /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
  /* @__PURE__ */ jsx("path", { d: "M3 9h18M9 21V9" })
] });
var BackgroundIcon = () => /* @__PURE__ */ jsxs("svg", { ...defaultProps, children: [
  /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
  /* @__PURE__ */ jsx("circle", { cx: "8.5", cy: "8.5", r: "1.5" }),
  /* @__PURE__ */ jsx("polyline", { points: "21 15 16 10 5 21" })
] });
var EmptyRoomIcon = () => /* @__PURE__ */ jsxs(
  "svg",
  {
    width: "64",
    height: "64",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { opacity: 0.3 },
    children: [
      /* @__PURE__ */ jsx("path", { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }),
      /* @__PURE__ */ jsx("circle", { cx: "9", cy: "7", r: "4" }),
      /* @__PURE__ */ jsx("path", { d: "M23 21v-2a4 4 0 0 0-3-3.87" }),
      /* @__PURE__ */ jsx("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
    ]
  }
);
var Pin = () => /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", height: "24px", viewBox: "0 -960 960 960", width: "24px", fill: "#e3e3e3", children: /* @__PURE__ */ jsx("path", { d: "m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z" }) });
var PinOverlay = () => /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", height: "14px", viewBox: "0 -960 960 960", width: "14px", fill: "#e3e3e3", children: /* @__PURE__ */ jsx("path", { d: "m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z" }) });
var PinOff = () => /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", height: "24px", viewBox: "0 -960 960 960", width: "24px", fill: "#e3e3e3", children: /* @__PURE__ */ jsx("path", { d: "M680-840v80h-40v327l-80-80v-247H400v87l-87-87-33-33v-47h400ZM480-40l-40-40v-240H240v-80l80-80v-46L56-792l56-56 736 736-58 56-264-264h-6v240l-40 40ZM354-400h92l-44-44-2-2-46 46Zm126-193Zm-78 149Z" }) });
var Grid = () => /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", height: "24px", viewBox: "0 -960 960 960", width: "24px", fill: "#e3e3e3", children: /* @__PURE__ */ jsx("path", { d: "M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h133v-133H200v133Zm213 0h134v-133H413v133Zm214 0h133v-133H627v133ZM200-413h133v-134H200v134Zm213 0h134v-134H413v134Zm214 0h133v-134H627v134ZM200-627h133v-133H200v133Zm213 0h134v-133H413v133Zm214 0h133v-133H627v133Z" }) });
var GridOff = () => /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", height: "24px", viewBox: "0 -960 960 960", width: "24px", fill: "#e3e3e3", children: /* @__PURE__ */ jsx("path", { d: "M333-200v-133H200v133h133Zm214 0v-100l-33-33H413v133h134Zm80 0Zm116-133Zm-410-80v-101l-33-33H200v134h133Zm80 0Zm347 0v-134H627v99l35 35h98ZM529-547Zm-329-80Zm347 0v-133H413v98l35 35h99Zm213 0v-133H627v133h133ZM316-760Zm524 525L235-840h525q33 0 56.5 23.5T840-760v525ZM200-120q-33 0-56.5-23.5T120-200v-640l720 720H200Zm619 92L28-820l56-56L876-84l-57 56Z" }) });
var Fullscreen = () => /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", height: "24px", viewBox: "0 -960 960 960", width: "24px", fill: "#e3e3e3", children: /* @__PURE__ */ jsx("path", { d: "M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z" }) });
var FullscreenExit = () => /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", height: "24px", viewBox: "0 -960 960 960", width: "24px", fill: "#e3e3e3", children: /* @__PURE__ */ jsx("path", { d: "M240-120v-120H120v-80h200v200h-80Zm400 0v-200h200v80H720v120h-80ZM120-640v-80h120v-120h80v200H120Zm520 0v-200h80v120h120v80H640Z" }) });
var MoreHorizontal = () => /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", height: "24px", viewBox: "0 -960 960 960", width: "24px", fill: "#e3e3e3", children: /* @__PURE__ */ jsx("path", { d: "M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z" }) });
var MoreVertical = () => /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", height: "24px", viewBox: "0 -960 960 960", width: "24px", fill: "#e3e3e3", children: /* @__PURE__ */ jsx("path", { d: "M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" }) });
var Settings = () => /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", height: "20", viewBox: "0 -960 960 960", width: "20", fill: "#e3e3e3", children: /* @__PURE__ */ jsx("path", { d: "m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" }) });
function RemoteVideos({
  className,
  style,
  renderParticipant
}) {
  const { remoteTracks, participants } = useJitsiContext();
  const remoteParticipants = Array.from(participants.values()).filter((p) => !p.isLocal);
  if (remoteParticipants.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: `rj-remote-grid ${className || ""}`, style, children: remoteParticipants.map((participant) => {
    const tracks = remoteTracks.get(participant.id) || [];
    return /* @__PURE__ */ jsx(
      RemoteParticipantTile,
      {
        participant,
        tracks,
        renderParticipant
      },
      participant.id
    );
  }) });
}
function RemoteParticipantTile({
  participant,
  tracks,
  renderParticipant,
  objectFit = "cover",
  children,
  style
}) {
  const videoRef = useRef(null);
  const screenRef = useRef(null);
  const audioRef = useRef(null);
  const cameraTrack = tracks.find((t) => t.getType() === "video" && t.getVideoType?.() !== "desktop");
  const screenTrack = tracks.find((t) => t.getType() === "video" && t.getVideoType?.() === "desktop");
  const audioTrack = tracks.find((t) => t.getType() === "audio");
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !cameraTrack) return;
    cameraTrack.attach(el);
    return () => {
      cameraTrack.detach(el);
    };
  }, [cameraTrack]);
  useEffect(() => {
    const el = screenRef.current;
    if (!el || !screenTrack) return;
    screenTrack.attach(el);
    return () => {
      screenTrack.detach(el);
    };
  }, [screenTrack]);
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioTrack) return;
    audioTrack.attach(el);
    return () => {
      audioTrack.detach(el);
    };
  }, [audioTrack]);
  if (renderParticipant) {
    return /* @__PURE__ */ jsx(Fragment, { children: renderParticipant(participant, videoRef, audioRef, tracks) });
  }
  const hasVideo = cameraTrack && !participant.videoMuted;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    screenTrack && /* @__PURE__ */ jsxs("div", { className: "rj-remote-tile", children: [
      /* @__PURE__ */ jsx("video", { className: "rj-remote-tile__video", ref: screenRef, autoPlay: true, playsInline: true }),
      /* @__PURE__ */ jsxs("div", { className: "rj-remote-tile__name", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
        /* @__PURE__ */ jsxs("span", { children: [
          participant.displayName,
          "'s screen"
        ] }),
        /* @__PURE__ */ jsx(ConnectionIndicator, { participant, stats: { isScreenShare: true, participantId: participant.id } })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rj-remote-tile", style, children: [
      /* @__PURE__ */ jsx(
        "video",
        {
          className: "rj-remote-tile__video",
          ref: videoRef,
          autoPlay: true,
          playsInline: true,
          style: { display: hasVideo ? void 0 : "none", objectFit }
        }
      ),
      !hasVideo && /* @__PURE__ */ jsx("div", { className: "rj-remote-tile__avatar", children: participant.displayName.charAt(0).toUpperCase() }),
      /* @__PURE__ */ jsx("audio", { ref: audioRef, autoPlay: true }),
      /* @__PURE__ */ jsxs("div", { className: "rj-remote-tile__name", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
        /* @__PURE__ */ jsx("span", { children: participant.displayName }),
        /* @__PURE__ */ jsx(ConnectionIndicator, { participant })
      ] }),
      participant.audioMuted && /* @__PURE__ */ jsx("div", { className: "rj-remote-tile__mute-icon", children: /* @__PURE__ */ jsx(MicMutedOverlayIcon, {}) }),
      children
    ] })
  ] });
}
function AdminControls({ participantId, className, style, children }) {
  const { participants, localRole, kickParticipant, muteParticipant, grantModerator } = useJitsiContext();
  if (localRole !== "moderator") return null;
  const participant = participants.get(participantId);
  if (!participant || participant.isLocal) return null;
  const actions = {
    kick: () => kickParticipant(participantId),
    muteAudio: () => muteParticipant(participantId, "audio"),
    muteVideo: () => muteParticipant(participantId, "video"),
    grantModerator: () => grantModerator(participantId)
  };
  if (children) return /* @__PURE__ */ jsx(Fragment, { children: children(participant, actions) });
  return /* @__PURE__ */ jsxs("div", { className: `rj-admin-controls ${className || ""}`, style, children: [
    /* @__PURE__ */ jsx("button", { className: "rj-admin-btn rj-admin-btn--mute", onClick: actions.muteAudio, title: "Mute audio", type: "button", children: "Mute" }),
    /* @__PURE__ */ jsx("button", { className: "rj-admin-btn rj-admin-btn--mute", onClick: actions.muteVideo, title: "Mute video", type: "button", children: "No Video" }),
    participant.role !== "moderator" && /* @__PURE__ */ jsx("button", { className: "rj-admin-btn rj-admin-btn--promote", onClick: actions.grantModerator, title: "Make moderator", type: "button", children: "Promote" }),
    /* @__PURE__ */ jsx("button", { className: "rj-admin-btn rj-admin-btn--kick", onClick: actions.kick, title: "Kick participant", type: "button", children: "Kick" })
  ] });
}
function VideoControlsOverlay({
  participant,
  videoMode,
  setVideoMode,
  isPinned,
  onTogglePin,
  objectFit,
  onToggleFit
}) {
  const { localRole } = useJitsiContext();
  const isModerator = localRole === "moderator";
  if (participant.id !== "whiteboard-view") return /* @__PURE__ */ jsx("div", { className: "rj-video-overlay-controls", children: /* @__PURE__ */ jsxs("div", { className: "rj-video-overlay-actions", children: [
    videoMode && setVideoMode && /* @__PURE__ */ jsx(
      "button",
      {
        className: "rj-video-btn",
        onClick: () => setVideoMode(videoMode === "grid" ? "floating" : "grid"),
        children: videoMode === "grid" ? /* @__PURE__ */ jsx(GridOff, {}) : /* @__PURE__ */ jsx(Grid, {})
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: `rj-video-btn ${isPinned ? "rj-video-btn--active" : ""}`,
        onClick: onTogglePin,
        title: isPinned ? "Unpin" : "Pin",
        children: isPinned ? /* @__PURE__ */ jsx(PinOff, {}) : /* @__PURE__ */ jsx(Pin, {})
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "rj-video-btn",
        onClick: onToggleFit,
        title: objectFit === "cover" ? "Show whole video" : "Crop to fill",
        children: objectFit === "cover" ? /* @__PURE__ */ jsx(Fullscreen, {}) : /* @__PURE__ */ jsx(FullscreenExit, {})
      }
    ),
    !participant.isLocal && isModerator && /* @__PURE__ */ jsxs(Popover, { children: [
      /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsx("button", { className: "rj-video-btn", children: /* @__PURE__ */ jsx(MoreVertical, {}) }) }),
      /* @__PURE__ */ jsx(PopoverContent, { children: /* @__PURE__ */ jsx("div", { className: "rj-video-overlay-admin", children: /* @__PURE__ */ jsx(AdminControls, { participantId: participant.id }) }) })
    ] })
  ] }) });
  return /* @__PURE__ */ jsx("div", { className: "rj-video-overlay-actions", children: /* @__PURE__ */ jsx(
    "button",
    {
      className: `rj-video-btn ${isPinned ? "rj-video-btn--active" : ""}`,
      onClick: onTogglePin,
      title: isPinned ? "Unpin" : "Pin",
      children: isPinned ? /* @__PURE__ */ jsx(PinOff, {}) : /* @__PURE__ */ jsx(Pin, {})
    }
  ) });
}
function VideoLayout({ className, style, whiteboardComponent }) {
  const containerRef = useRef(null);
  const { participants, localParticipantId, remoteTracks, whiteboardActive } = useJitsiContext();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const prevContainerSize = useRef({ width: 0, height: 0 });
  const [pinnedIds, setPinnedIds] = useState(/* @__PURE__ */ new Set());
  const [objectFits, setObjectFits] = useState({});
  const [rndPosition, setRndPosition] = useState({ x: 0, y: 0 });
  const [rndSize, setRndSize] = useState({ width: 240, height: 180 });
  const hasInitializedRndPos = useRef(false);
  useEffect(() => {
    if (containerSize.width > 0 && !hasInitializedRndPos.current) {
      setRndPosition({
        x: containerSize.width - rndSize.width,
        y: 0
      });
      hasInitializedRndPos.current = true;
    }
  }, [containerSize.width, rndSize.width]);
  useEffect(() => {
    const { width: oldWidth, height: oldHeight } = prevContainerSize.current;
    const { width: newWidth, height: newHeight } = containerSize;
    if (newWidth === 0 || newHeight === 0) return;
    if (oldWidth === 0) {
      prevContainerSize.current = { width: newWidth, height: newHeight };
      return;
    }
    if (oldWidth !== newWidth || oldHeight !== newHeight) {
      setRndPosition((prev) => {
        const oldMaxX = oldWidth - rndSize.width;
        const oldMaxY = oldHeight - rndSize.height;
        const newMaxX = newWidth - rndSize.width;
        const newMaxY = newHeight - rndSize.height;
        let nextX = prev.x;
        if (newWidth > oldWidth) {
          if (prev.x > oldMaxX / 2) {
            const distFromRight = oldMaxX - prev.x;
            nextX = newMaxX - distFromRight;
          }
        }
        let nextY = prev.y;
        if (newHeight > oldHeight) {
          if (prev.y > oldMaxY / 2) {
            const distFromBottom = oldMaxY - prev.y;
            nextY = newMaxY - distFromBottom;
          }
        }
        return {
          x: Math.max(0, Math.min(nextX, newMaxX)),
          y: Math.max(0, Math.min(nextY, newMaxY))
        };
      });
      prevContainerSize.current = { width: newWidth, height: newHeight };
    }
  }, [containerSize, rndSize]);
  const remoteParticipants = Array.from(participants.values()).filter((p) => !p.isLocal);
  const hasRemotes = remoteParticipants.length > 0;
  const [localVideoMode, setLocalVideoMode] = useState(
    hasRemotes ? "floating" : "grid"
  );
  const prevHasRemotesRef = useRef(hasRemotes);
  useEffect(() => {
    if (!prevHasRemotesRef.current && hasRemotes) {
      setLocalVideoMode("floating");
    }
    prevHasRemotesRef.current = hasRemotes;
  }, [hasRemotes]);
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  const togglePin = (id) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleFit = (id) => {
    setObjectFits((prev) => ({
      ...prev,
      [id]: prev[id] === "contain" ? "cover" : "contain"
    }));
  };
  const localParticipant = localParticipantId ? participants.get(localParticipantId) : void 0;
  const allParticipants = Array.from(participants.values());
  const whiteboardId = "whiteboard-view";
  if (whiteboardActive && whiteboardComponent) {
    allParticipants.push({
      id: whiteboardId,
      displayName: "Whiteboard",
      isLocal: false,
      audioMuted: true,
      videoMuted: false,
      connectionStatus: "active",
      role: "none"
    });
  }
  const pinnedParticipantsList = allParticipants.filter((p) => pinnedIds.has(p.id));
  const hasPinned = pinnedParticipantsList.length > 0;
  let gridItems = [];
  let stripItems = [];
  if (hasPinned) {
    gridItems = pinnedParticipantsList;
    stripItems = allParticipants.filter(
      (p) => !pinnedIds.has(p.id) && (p.isLocal ? localVideoMode === "grid" : true)
    );
  } else {
    gridItems = allParticipants.filter(
      (p) => p.isLocal ? localVideoMode === "grid" : true
    );
  }
  const gridDimensions = calculateGridSettings(
    hasPinned ? containerSize.width - 256 : containerSize.width,
    // leave room for strip if pinned
    containerSize.height,
    gridItems.length,
    16 / 9,
    16
    // gap
  );
  return /* @__PURE__ */ jsxs("div", { className: `rj-video-layout ${className || ""}`, style, ref: containerRef, children: [
    localVideoMode === "floating" && localParticipant && !pinnedIds.has(localParticipant.id) && /* @__PURE__ */ jsx(
      Rnd,
      {
        position: rndPosition,
        size: rndSize,
        onDragStop: (_, d) => setRndPosition({ x: d.x, y: d.y }),
        onResizeStop: (_, __, ref, ___, position) => {
          setRndSize({
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height)
          });
          setRndPosition(position);
        },
        minWidth: 160,
        minHeight: 120,
        bounds: "parent",
        className: "rj-local-floating",
        children: /* @__PURE__ */ jsx(LocalVideo, { objectFit: objectFits[localParticipant.id] || "cover", showPlaceholder: true, children: /* @__PURE__ */ jsx(
          VideoControlsOverlay,
          {
            participant: localParticipant,
            videoMode: localVideoMode,
            setVideoMode: setLocalVideoMode,
            isPinned: pinnedIds.has(localParticipant.id),
            onTogglePin: () => togglePin(localParticipant.id),
            objectFit: objectFits[localParticipant.id] || "cover",
            onToggleFit: () => toggleFit(localParticipant.id)
          }
        ) })
      }
    ),
    hasPinned ? /* @__PURE__ */ jsxs("div", { className: "rj-video-layout__spotlight", children: [
      /* @__PURE__ */ jsx("div", { className: "rj-video-layout__spotlight-main", children: /* @__PURE__ */ jsx("div", { style: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignContent: "center",
        gap: 16,
        width: "100%",
        height: "100%"
      }, children: gridItems.map((p) => /* @__PURE__ */ jsx("div", { style: { width: gridDimensions.width, height: gridDimensions.height }, children: p.isLocal ? /* @__PURE__ */ jsxs(LocalVideo, { objectFit: objectFits[p.id] || "contain", children: [
        /* @__PURE__ */ jsx("div", { className: "rj-remote-tile__pin-icon", children: /* @__PURE__ */ jsx(PinOverlay, {}) }),
        /* @__PURE__ */ jsx(VideoControlsOverlay, { videoMode: localVideoMode, setVideoMode: setLocalVideoMode, participant: p, isPinned: true, onTogglePin: () => togglePin(p.id), objectFit: objectFits[p.id] || "contain", onToggleFit: () => toggleFit(p.id) })
      ] }) : p.id === whiteboardId ? /* @__PURE__ */ jsxs(HoverCard2.Root, { openDelay: 200, closeDelay: 300, children: [
        /* @__PURE__ */ jsx(HoverCard2.Trigger, { asChild: true, children: /* @__PURE__ */ jsxs("div", { className: "rj-remote-tile", style: { width: "100%", height: "100%", backgroundColor: "var(--rj-card)" }, children: [
          whiteboardComponent,
          /* @__PURE__ */ jsx("div", { className: "rj-remote-tile__pin-icon", children: /* @__PURE__ */ jsx(PinOverlay, {}) })
        ] }) }),
        /* @__PURE__ */ jsx(HoverCard2.Portal, { children: /* @__PURE__ */ jsx(HoverCard2.Content, { side: "left", sideOffset: 8, children: /* @__PURE__ */ jsx(VideoControlsOverlay, { participant: p, isPinned: true, onTogglePin: () => togglePin(p.id), objectFit: "contain", onToggleFit: () => {
        } }) }) })
      ] }) : /* @__PURE__ */ jsxs(RemoteParticipantTile, { participant: p, tracks: remoteTracks.get(p.id) || [], objectFit: objectFits[p.id] || "contain", style: { width: "100%", height: "100%" }, children: [
        /* @__PURE__ */ jsx("div", { className: "rj-remote-tile__pin-icon", children: /* @__PURE__ */ jsx(PinOverlay, {}) }),
        /* @__PURE__ */ jsx(VideoControlsOverlay, { participant: p, isPinned: true, onTogglePin: () => togglePin(p.id), objectFit: objectFits[p.id] || "contain", onToggleFit: () => toggleFit(p.id) })
      ] }) }, p.id)) }) }),
      stripItems.length > 0 && /* @__PURE__ */ jsx("div", { className: "rj-video-layout__spotlight-strip", children: stripItems.map((p) => /* @__PURE__ */ jsx("div", { style: { width: "100%", aspectRatio: "16/9" }, children: p.isLocal ? /* @__PURE__ */ jsx(LocalVideo, { objectFit: objectFits[p.id] || "cover", children: /* @__PURE__ */ jsx(VideoControlsOverlay, { videoMode: localVideoMode, setVideoMode: setLocalVideoMode, participant: p, isPinned: false, onTogglePin: () => togglePin(p.id), objectFit: objectFits[p.id] || "cover", onToggleFit: () => toggleFit(p.id) }) }) : p.id === whiteboardId ? /* @__PURE__ */ jsxs(HoverCard2.Root, { openDelay: 200, closeDelay: 300, children: [
        /* @__PURE__ */ jsx(HoverCard2.Trigger, { asChild: true, children: /* @__PURE__ */ jsx("div", { className: "rj-remote-tile", style: { width: "100%", height: "100%", backgroundColor: "var(--rj-card)" }, children: whiteboardComponent }) }),
        /* @__PURE__ */ jsx(HoverCard2.Portal, { children: /* @__PURE__ */ jsx(HoverCard2.Content, { side: "left", sideOffset: 8, children: /* @__PURE__ */ jsx(VideoControlsOverlay, { participant: p, isPinned: false, onTogglePin: () => togglePin(p.id), objectFit: "contain", onToggleFit: () => {
        } }) }) })
      ] }) : /* @__PURE__ */ jsx(RemoteParticipantTile, { participant: p, tracks: remoteTracks.get(p.id) || [], objectFit: objectFits[p.id] || "cover", style: { width: "100%", height: "100%" }, children: /* @__PURE__ */ jsx(VideoControlsOverlay, { participant: p, isPinned: false, onTogglePin: () => togglePin(p.id), objectFit: objectFits[p.id] || "cover", onToggleFit: () => toggleFit(p.id) }) }) }, p.id)) })
    ] }) : /* @__PURE__ */ jsx("div", { className: "rj-video-layout__grid", children: /* @__PURE__ */ jsx("div", { style: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      alignContent: "center",
      gap: 16,
      width: "100%",
      height: "100%"
    }, children: gridItems.map((p) => /* @__PURE__ */ jsx("div", { style: { width: gridDimensions.width, height: gridDimensions.height }, children: p.isLocal ? /* @__PURE__ */ jsx(LocalVideo, { objectFit: objectFits[p.id] || "cover", children: /* @__PURE__ */ jsx(VideoControlsOverlay, { videoMode: localVideoMode, setVideoMode: setLocalVideoMode, participant: p, isPinned: false, onTogglePin: () => togglePin(p.id), objectFit: objectFits[p.id] || "cover", onToggleFit: () => toggleFit(p.id) }) }) : p.id === whiteboardId ? /* @__PURE__ */ jsxs(HoverCard2.Root, { openDelay: 200, closeDelay: 300, children: [
      /* @__PURE__ */ jsx(HoverCard2.Trigger, { asChild: true, children: /* @__PURE__ */ jsx("div", { className: "rj-remote-tile", style: { width: "100%", height: "100%", backgroundColor: "var(--rj-card)" }, children: whiteboardComponent }) }),
      /* @__PURE__ */ jsx(HoverCard2.Portal, { children: /* @__PURE__ */ jsx(HoverCard2.Content, { side: "left", sideOffset: 8, children: /* @__PURE__ */ jsx(VideoControlsOverlay, { participant: p, isPinned: false, onTogglePin: () => togglePin(p.id), objectFit: "contain", onToggleFit: () => {
      } }) }) })
    ] }) : /* @__PURE__ */ jsx(RemoteParticipantTile, { participant: p, tracks: remoteTracks.get(p.id) || [], objectFit: objectFits[p.id] || "cover", style: { width: "100%", height: "100%" }, children: /* @__PURE__ */ jsx(VideoControlsOverlay, { participant: p, isPinned: false, onTogglePin: () => togglePin(p.id), objectFit: objectFits[p.id] || "cover", onToggleFit: () => toggleFit(p.id) }) }) }, p.id)) }) })
  ] });
}
function mergeProps(childProps, slotProps) {
  const merged = { ...childProps };
  for (const key of Object.keys(slotProps)) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];
    if (key === "style") {
      merged[key] = { ...slotValue, ...childValue };
    } else if (key === "className") {
      merged[key] = [slotValue, childValue].filter(Boolean).join(" ");
    } else if (key.startsWith("on") && typeof slotValue === "function") {
      if (typeof childValue === "function") {
        merged[key] = (...args) => {
          childValue(...args);
          slotValue(...args);
        };
      } else {
        merged[key] = slotValue;
      }
    } else if (slotValue !== void 0) {
      merged[key] = slotValue;
    }
  }
  return merged;
}
function Slot({ children, ...slotProps }) {
  if (!React5.isValidElement(children)) {
    console.warn("[react-jitsi] Slot requires a valid React element as children when using asChild.");
    return null;
  }
  const childProps = children.props;
  const merged = mergeProps(childProps, slotProps);
  return React5.cloneElement(children, merged);
}
function ToggleAudio({ className, style, asChild, children }) {
  const { audioMuted, toggleAudio } = useJitsiContext();
  const dataState = audioMuted ? "muted" : "active";
  const label = audioMuted ? "Unmute microphone" : "Mute microphone";
  if (typeof children === "function") {
    return /* @__PURE__ */ jsx(Fragment, { children: children(audioMuted, toggleAudio) });
  }
  if (asChild && React5.isValidElement(children)) {
    return /* @__PURE__ */ jsx(
      Slot,
      {
        onClick: toggleAudio,
        "data-state": dataState,
        "aria-label": label,
        title: label,
        className,
        style,
        children
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: `rj-btn ${audioMuted ? "rj-btn--muted" : "rj-btn--active"} ${className || ""}`,
      style,
      onClick: toggleAudio,
      "data-state": dataState,
      title: label,
      "aria-label": label,
      type: "button",
      children: audioMuted ? /* @__PURE__ */ jsx(MicOffIcon, {}) : /* @__PURE__ */ jsx(MicOnIcon, {})
    }
  );
}
function ToggleVideo({ className, style, asChild, children }) {
  const { videoMuted, toggleVideo } = useJitsiContext();
  const dataState = videoMuted ? "muted" : "active";
  const label = videoMuted ? "Turn on camera" : "Turn off camera";
  if (typeof children === "function") return /* @__PURE__ */ jsx(Fragment, { children: children(videoMuted, toggleVideo) });
  if (asChild && React5.isValidElement(children)) {
    return /* @__PURE__ */ jsx(Slot, { onClick: toggleVideo, "data-state": dataState, "aria-label": label, title: label, className, style, children });
  }
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: `rj-btn ${videoMuted ? "rj-btn--muted" : "rj-btn--active"} ${className || ""}`,
      style,
      onClick: toggleVideo,
      "data-state": dataState,
      title: label,
      "aria-label": label,
      type: "button",
      children: videoMuted ? /* @__PURE__ */ jsx(VideoOffIcon, {}) : /* @__PURE__ */ jsx(VideoOnIcon, {})
    }
  );
}
function ScreenShareButton({ className, style, frameRate, asChild, children }) {
  const { isScreenSharing, startScreenShare, stopScreenShare } = useJitsiContext();
  const toggle = useCallback(async () => {
    if (isScreenSharing) {
      await stopScreenShare();
    } else {
      const opts = {};
      if (frameRate) opts.frameRate = frameRate;
      await startScreenShare(opts);
    }
  }, [isScreenSharing, startScreenShare, stopScreenShare, frameRate]);
  const dataState = isScreenSharing ? "sharing" : "idle";
  const label = isScreenSharing ? "Stop sharing" : "Share screen";
  if (typeof children === "function") return /* @__PURE__ */ jsx(Fragment, { children: children(isScreenSharing, toggle) });
  if (asChild && React5.isValidElement(children)) {
    return /* @__PURE__ */ jsx(Slot, { onClick: toggle, "data-state": dataState, "aria-label": label, title: label, className, style, children });
  }
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: `rj-btn ${isScreenSharing ? "rj-btn--accent" : "rj-btn--active"} ${className || ""}`,
      style,
      onClick: toggle,
      "data-state": dataState,
      title: label,
      "aria-label": label,
      type: "button",
      children: isScreenSharing ? /* @__PURE__ */ jsx(StopShareIcon, {}) : /* @__PURE__ */ jsx(ScreenShareIcon, {})
    }
  );
}
function LeaveButton({ className, style, label, confirmBeforeLeave = false, confirmMessage = "Are you sure you want to leave the meeting?", onLeave, asChild, children }) {
  const { leave } = useJitsiContext();
  const handleLeave = useCallback(async () => {
    if (confirmBeforeLeave && !window.confirm(confirmMessage)) return;
    await leave();
    onLeave?.();
  }, [leave, confirmBeforeLeave, confirmMessage, onLeave]);
  if (typeof children === "function") return /* @__PURE__ */ jsx(Fragment, { children: children(handleLeave) });
  if (asChild && React5.isValidElement(children)) {
    return /* @__PURE__ */ jsx(Slot, { onClick: handleLeave, "data-state": "leave", "aria-label": "Leave meeting", title: "Leave meeting", className, style, children });
  }
  return /* @__PURE__ */ jsxs(
    "button",
    {
      className: `${label ? "rj-leave-btn" : "rj-leave-btn rj-leave-btn--icon-only"} ${className || ""}`,
      style,
      onClick: handleLeave,
      title: "Leave meeting",
      "aria-label": "Leave meeting",
      type: "button",
      children: [
        /* @__PURE__ */ jsx(PhoneOffIcon, {}),
        label && /* @__PURE__ */ jsx("span", { children: label })
      ]
    }
  );
}
function ToggleMirror({ className, style, asChild, children }) {
  const { isMirrored, toggleMirror } = useJitsiContext();
  const dataState = isMirrored ? "mirrored" : "normal";
  const label = isMirrored ? "Disable mirror" : "Enable mirror";
  if (typeof children === "function") return /* @__PURE__ */ jsx(Fragment, { children: children(isMirrored, toggleMirror) });
  if (asChild && React5.isValidElement(children)) {
    return /* @__PURE__ */ jsx(Slot, { onClick: toggleMirror, "data-state": dataState, "aria-label": label, title: label, className, style, children });
  }
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "5px" }, children: [
    /* @__PURE__ */ jsx("input", { id: "rj-toggle-mirror", type: "checkbox", style, "data-state": dataState, title: label, "aria-label": label, checked: isMirrored, onChange: toggleMirror }),
    /* @__PURE__ */ jsx("label", { className: "rj-label", htmlFor: "rj-toggle-mirror", children: "Mirror my video" })
  ] });
}
function ToggleChat({ className, style, asChild, children }) {
  const { unreadCount } = useJitsiContext();
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const dataState = isOpen ? "open" : "closed";
  const label = isOpen ? "Close chat" : "Open chat";
  if (typeof children === "function") return /* @__PURE__ */ jsx(Fragment, { children: children(isOpen, toggle, unreadCount) });
  if (asChild && React5.isValidElement(children)) {
    return /* @__PURE__ */ jsx(Slot, { onClick: toggle, "data-state": dataState, "aria-label": label, title: label, className, style, children });
  }
  return /* @__PURE__ */ jsxs(
    "button",
    {
      className: `rj-btn ${isOpen ? "rj-btn--accent" : "rj-btn--active"} ${className || ""}`,
      style: { position: "relative", ...style },
      onClick: toggle,
      "data-state": dataState,
      title: label,
      "aria-label": label,
      type: "button",
      children: [
        /* @__PURE__ */ jsx(ChatIcon, {}),
        unreadCount > 0 && !isOpen && /* @__PURE__ */ jsx("span", { className: "rj-badge rj-badge--danger", children: unreadCount > 99 ? "99+" : unreadCount })
      ]
    }
  );
}
function ToggleRecording({ className, style, mode = "file", recordingOptions, asChild, children }) {
  const { isRecording, startRecording, stopRecording } = useJitsiContext();
  const dataState = isRecording ? "recording" : "idle";
  const label = isRecording ? "Stop recording" : "Start recording";
  const toggle = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording({ mode, ...recordingOptions });
    }
  };
  if (typeof children === "function") return /* @__PURE__ */ jsx(Fragment, { children: children(isRecording, toggle) });
  if (asChild && React5.isValidElement(children)) {
    return /* @__PURE__ */ jsx(Slot, { onClick: toggle, "data-state": dataState, "aria-label": label, title: label, className, style, children });
  }
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: `rj-btn ${isRecording ? "rj-btn--muted" : "rj-btn--active"} ${className || ""}`,
      style,
      onClick: toggle,
      "data-state": dataState,
      title: label,
      "aria-label": label,
      type: "button",
      children: isRecording ? /* @__PURE__ */ jsx(StopRecordIcon, {}) : /* @__PURE__ */ jsx(RecordIcon, {})
    }
  );
}
function ToggleCaptions({ className, style, asChild, children }) {
  const { captionsEnabled, toggleCaptions } = useJitsiContext();
  const dataState = captionsEnabled ? "active" : "off";
  const label = captionsEnabled ? "Disable captions" : "Enable captions";
  if (typeof children === "function") return /* @__PURE__ */ jsx(Fragment, { children: children(captionsEnabled, toggleCaptions) });
  if (asChild && React5.isValidElement(children)) {
    return /* @__PURE__ */ jsx(Slot, { onClick: toggleCaptions, "data-state": dataState, "aria-label": label, title: label, className, style, children });
  }
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: `rj-btn ${captionsEnabled ? "rj-btn--accent" : "rj-btn--active"} ${className || ""}`,
      style,
      onClick: toggleCaptions,
      "data-state": dataState,
      title: label,
      "aria-label": label,
      type: "button",
      children: /* @__PURE__ */ jsx(CaptionsIcon, {})
    }
  );
}
function TogglePolls({ className, style, asChild, children }) {
  const { polls } = useJitsiContext();
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const activeCount = polls.filter((p) => p.isOpen).length;
  const dataState = isOpen ? "open" : "closed";
  const label = isOpen ? "Close polls" : "Open polls";
  if (typeof children === "function") return /* @__PURE__ */ jsx(Fragment, { children: children(isOpen, toggle, polls) });
  if (asChild && React5.isValidElement(children)) {
    return /* @__PURE__ */ jsx(Slot, { onClick: toggle, "data-state": dataState, "aria-label": label, title: label, className, style, children });
  }
  return /* @__PURE__ */ jsxs(
    "button",
    {
      className: `rj-btn ${isOpen ? "rj-btn--accent" : "rj-btn--active"} ${className || ""}`,
      style: { position: "relative", ...style },
      onClick: toggle,
      "data-state": dataState,
      title: label,
      "aria-label": label,
      type: "button",
      children: [
        /* @__PURE__ */ jsx(PollIcon, {}),
        activeCount > 0 && /* @__PURE__ */ jsx("span", { className: "rj-badge rj-badge--accent", children: activeCount })
      ]
    }
  );
}
function getStatusColor(connStatus, confStatus) {
  if (connStatus === "failed" || confStatus === "error") return "#ef4444";
  if (confStatus === "joined") return "#22c55e";
  if (connStatus === "connecting" || confStatus === "joining") return "#f59e0b";
  if (connStatus === "disconnected" || confStatus === "left") return "#6b7280";
  return "#6b7280";
}
function getStatusLabel(connStatus, confStatus) {
  if (connStatus === "failed") return "Connection failed";
  if (confStatus === "error") return "Conference error";
  if (confStatus === "joined") return "Connected";
  if (confStatus === "joining") return "Joining...";
  if (connStatus === "connecting") return "Connecting...";
  if (confStatus === "left") return "Left";
  if (connStatus === "disconnected") return "Disconnected";
  return "Initializing...";
}
function ConnectionStatus({ className, style, children }) {
  const { connectionStatus, conferenceStatus, participants } = useJitsiContext();
  const participantCount = participants.size;
  if (children) {
    return /* @__PURE__ */ jsx(Fragment, { children: children(connectionStatus, conferenceStatus, participantCount) });
  }
  const color = getStatusColor(connectionStatus, conferenceStatus);
  const label = getStatusLabel(connectionStatus, conferenceStatus);
  return /* @__PURE__ */ jsxs("div", { className: `rj-connection ${className || ""}`, style, children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "rj-connection__dot",
        style: {
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}`
        }
      }
    ),
    /* @__PURE__ */ jsx("span", { children: label }),
    conferenceStatus === "joined" && /* @__PURE__ */ jsxs("span", { className: "rj-connection__count", children: [
      "\xB7 ",
      participantCount,
      " ",
      participantCount === 1 ? "participant" : "participants"
    ] })
  ] });
}
function RecordingIndicator({ className, style, children }) {
  const { isRecording } = useJitsiContext();
  if (!isRecording) return null;
  if (children) return /* @__PURE__ */ jsx(Fragment, { children: children(isRecording) });
  return /* @__PURE__ */ jsxs("div", { className: `rj-rec-indicator ${className || ""}`, style, children: [
    /* @__PURE__ */ jsx("div", { className: "rj-rec-indicator__dot" }),
    /* @__PURE__ */ jsx("span", { children: "REC" })
  ] });
}
function ChatPanel({ className, style, placeholder = "Type a message...", children }) {
  const { messages, sendMessage, unreadCount, markMessagesRead } = useJitsiContext();
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const handleSend = useCallback(() => {
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [text, sendMessage]);
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);
  React5.useEffect(() => {
    markMessagesRead();
  }, [messages.length, markMessagesRead]);
  if (children) return /* @__PURE__ */ jsx(Fragment, { children: children(messages, sendMessage, unreadCount) });
  return /* @__PURE__ */ jsxs("div", { className: `rj-chat-panel ${className || ""}`, style, children: [
    /* @__PURE__ */ jsxs("div", { className: "rj-chat-panel__header", children: [
      "Chat (",
      messages.length,
      ")"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rj-chat-panel__messages", children: [
      messages.map((msg) => /* @__PURE__ */ jsxs("div", { className: `rj-msg ${msg.isLocal ? "rj-msg--local" : "rj-msg--remote"}`, children: [
        !msg.isLocal && /* @__PURE__ */ jsxs("span", { className: "rj-msg__sender", children: [
          msg.displayName,
          msg.isPrivate ? " (private)" : ""
        ] }),
        /* @__PURE__ */ jsx("div", { className: `rj-msg__bubble ${msg.isLocal ? "rj-msg__bubble--local" : ""}`, children: msg.text })
      ] }, msg.id)),
      /* @__PURE__ */ jsx("div", { ref: messagesEndRef })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rj-chat-panel__input-area", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          className: "rj-input",
          value: text,
          onChange: (e) => setText(e.target.value),
          onKeyDown: handleKeyDown,
          placeholder
        }
      ),
      /* @__PURE__ */ jsx("button", { className: "rj-send-btn", onClick: handleSend, type: "button", children: "Send" })
    ] })
  ] });
}
var AVATAR_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6"
];
function getAvatarColor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function ParticipantList({
  className,
  style,
  includeLocal = true,
  renderParticipant,
  children
}) {
  const { participants } = useJitsiContext();
  const participantsList = Array.from(participants.values()).filter(
    (p) => includeLocal || !p.isLocal
  );
  participantsList.sort((a, b) => {
    if (a.isLocal && !b.isLocal) return -1;
    if (!a.isLocal && b.isLocal) return 1;
    return a.displayName.localeCompare(b.displayName);
  });
  if (children) {
    return /* @__PURE__ */ jsx(Fragment, { children: children(participantsList) });
  }
  return /* @__PURE__ */ jsx("div", { className: `rj-participant-list ${className || ""}`, style, children: participantsList.map((participant) => {
    if (renderParticipant) {
      return /* @__PURE__ */ jsx(React5.Fragment, { children: renderParticipant(participant) }, participant.id);
    }
    return /* @__PURE__ */ jsxs("div", { className: "rj-participant-item", style: { flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px", width: "100%" }, children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "rj-avatar rj-avatar--sm",
            style: { backgroundColor: getAvatarColor(participant.id) },
            children: participant.displayName.charAt(0).toUpperCase()
          }
        ),
        /* @__PURE__ */ jsxs("span", { className: "rj-participant-item__name", children: [
          participant.displayName,
          participant.role === "moderator" && /* @__PURE__ */ jsx("span", { className: "rj-participant-item__you", children: "(Admin)" }),
          participant.isLocal && /* @__PURE__ */ jsx("span", { className: "rj-participant-item__you", children: "(You)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rj-participant-item__icons", children: [
          participant.audioMuted && /* @__PURE__ */ jsx("div", { className: "rj-status-icon rj-status-icon--muted", children: /* @__PURE__ */ jsx(MicMutedSmallIcon, {}) }),
          participant.videoMuted && /* @__PURE__ */ jsx("div", { className: "rj-status-icon rj-status-icon--muted", style: { marginRight: "4px" }, children: /* @__PURE__ */ jsx(VideoMutedSmallIcon, {}) }),
          /* @__PURE__ */ jsx(ConnectionIndicator, { participant })
        ] })
      ] }),
      /* @__PURE__ */ jsx(AdminControls, { participantId: participant.id, style: { width: "100%", marginTop: "4px" } })
    ] }, participant.id);
  }) });
}
function Captions({ className, style, maxVisible = 3, children }) {
  const { captions, captionsEnabled } = useJitsiContext();
  if (!captionsEnabled) return null;
  if (children) return /* @__PURE__ */ jsx(Fragment, { children: children(captions, captionsEnabled) });
  const visible = captions.slice(-maxVisible);
  return /* @__PURE__ */ jsx("div", { className: `rj-captions ${className || ""}`, style, children: visible.map((c, i) => /* @__PURE__ */ jsxs("div", { className: "rj-caption", children: [
    /* @__PURE__ */ jsxs("span", { className: "rj-caption__name", children: [
      c.displayName,
      ":"
    ] }),
    /* @__PURE__ */ jsx("span", { children: c.text })
  ] }, `${c.participantId}-${c.timestamp}-${i}`)) });
}
function PollCreator({ className, style, minOptions = 2, maxOptions = 10, onCreated, children }) {
  const { createPoll } = useJitsiContext();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const handleCreate = useCallback(() => {
    const validOptions = options.filter((o) => o.trim());
    if (!question.trim() || validOptions.length < minOptions) return;
    createPoll(question.trim(), validOptions);
    onCreated?.({});
    setQuestion("");
    setOptions(["", ""]);
  }, [question, options, minOptions, createPoll, onCreated]);
  if (children) return /* @__PURE__ */ jsx(Fragment, { children: children(createPoll) });
  return /* @__PURE__ */ jsxs("div", { className: `rj-panel ${className || ""}`, style, children: [
    /* @__PURE__ */ jsx("label", { className: "rj-label", children: "Question" }),
    /* @__PURE__ */ jsx("input", { className: "rj-input", value: question, onChange: (e) => setQuestion(e.target.value), placeholder: "Ask a question..." }),
    /* @__PURE__ */ jsx("label", { className: "rj-label", children: "Options" }),
    options.map((opt, i) => /* @__PURE__ */ jsx(
      "input",
      {
        className: "rj-input",
        value: opt,
        onChange: (e) => {
          const n = [...options];
          n[i] = e.target.value;
          setOptions(n);
        },
        placeholder: `Option ${i + 1}`
      },
      i
    )),
    options.length < maxOptions && /* @__PURE__ */ jsx("button", { className: "rj-btn-sm rj-btn-sm--ghost", onClick: () => setOptions([...options, ""]), type: "button", children: "+ Add option" }),
    /* @__PURE__ */ jsx("button", { className: "rj-btn-sm rj-btn-sm--primary", onClick: handleCreate, type: "button", children: "Create Poll" })
  ] });
}
function SinglePoll({ poll }) {
  const { votePoll, closePoll, localParticipantId, localRole } = useJitsiContext();
  const totalVotes = poll.options.reduce((sum, o) => sum + o.voters.length, 0);
  const isMod = localRole === "moderator";
  const isCreator = poll.creatorId === localParticipantId;
  return /* @__PURE__ */ jsxs("div", { className: "rj-panel", children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
      /* @__PURE__ */ jsx("span", { className: "rj-poll__question", children: poll.question }),
      /* @__PURE__ */ jsx("span", { className: "rj-poll__status", children: poll.isOpen ? "Open" : "Closed" })
    ] }),
    /* @__PURE__ */ jsxs("span", { className: "rj-poll__meta", children: [
      "by ",
      poll.creatorName,
      " \xB7 ",
      totalVotes,
      " vote",
      totalVotes !== 1 ? "s" : ""
    ] }),
    poll.options.map((opt, i) => {
      const pct = totalVotes > 0 ? opt.voters.length / totalVotes * 100 : 0;
      const voted = localParticipantId ? opt.voters.includes(localParticipantId) : false;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `rj-poll__option ${voted ? "rj-poll__option--voted" : ""}`,
          onClick: () => {
            if (poll.isOpen) votePoll(poll.id, i);
          },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "rj-poll__option-bar-container", children: [
              /* @__PURE__ */ jsx("span", { className: "rj-poll__option-text", children: opt.text }),
              /* @__PURE__ */ jsx("div", { className: "rj-poll__option-bar-bg", children: /* @__PURE__ */ jsx("div", { className: "rj-poll__option-bar-fill", style: { width: `${pct}%` } }) })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "rj-poll__vote-count", children: opt.voters.length })
          ]
        },
        i
      );
    }),
    poll.isOpen && (isMod || isCreator) && /* @__PURE__ */ jsx("button", { className: "rj-poll__close-btn", onClick: () => closePoll(poll.id), type: "button", children: "Close Poll" })
  ] });
}
function PollDisplay({ className, style, poll: pollProp, children }) {
  const { activePoll, polls, votePoll, closePoll } = useJitsiContext();
  if (children) return /* @__PURE__ */ jsx(Fragment, { children: children(activePoll, votePoll, closePoll) });
  if (pollProp) {
    return /* @__PURE__ */ jsx("div", { className, style, children: /* @__PURE__ */ jsx(SinglePoll, { poll: pollProp }) });
  }
  const sorted = [...polls].sort((a, b) => {
    if (a.isOpen && !b.isOpen) return -1;
    if (!a.isOpen && b.isOpen) return 1;
    return b.timestamp - a.timestamp;
  });
  if (sorted.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: `rj-panel rj-poll__empty ${className || ""}`, style, children: "No polls yet. Create one above!" });
  }
  return /* @__PURE__ */ jsx("div", { className, style: { display: "flex", flexDirection: "column", gap: "8px", ...style }, children: sorted.map((p) => /* @__PURE__ */ jsx(SinglePoll, { poll: p }, p.id)) });
}
function DeviceSelector({
  kind = "audioinput",
  className,
  style,
  label,
  children
}) {
  const { getDevices, switchCamera, switchMicrophone, localTracks } = useJitsiContext();
  const [devices, setDevices] = useState([]);
  const [selectedId, setSelectedId] = useState();
  useEffect(() => {
    const track = localTracks.find((t) => {
      if (kind === "audioinput") return t.getType() === "audio";
      if (kind === "videoinput") return t.getType() === "video";
      return false;
    });
    if (track?.stream) {
      const mediaTrack = kind === "audioinput" ? track.stream.getAudioTracks()[0] : track.stream.getVideoTracks()[0];
      if (mediaTrack) {
        const settings = mediaTrack.getSettings();
        setSelectedId(settings.deviceId);
      }
    }
  }, [localTracks, kind]);
  useEffect(() => {
    getDevices().then((allDevices) => {
      const filtered = allDevices.filter((d) => d.kind === kind);
      setDevices(filtered);
    });
  }, [getDevices, kind]);
  const handleSelect = useCallback(
    async (deviceId) => {
      setSelectedId(deviceId);
      if (kind === "videoinput") {
        await switchCamera(deviceId);
      } else if (kind === "audioinput") {
        await switchMicrophone(deviceId);
      }
    },
    [kind, switchCamera, switchMicrophone]
  );
  if (children) {
    return /* @__PURE__ */ jsx(Fragment, { children: children(devices, handleSelect, selectedId) });
  }
  const defaultLabel = label || (kind === "audioinput" ? "Microphone" : kind === "videoinput" ? "Camera" : "Speaker");
  return /* @__PURE__ */ jsxs("div", { className: `rj-field-group ${className || ""}`, style, children: [
    /* @__PURE__ */ jsx("label", { className: "rj-label", children: defaultLabel }),
    /* @__PURE__ */ jsx(
      "select",
      {
        className: "rj-select",
        value: selectedId || "",
        onChange: (e) => handleSelect(e.target.value),
        children: devices.map((device) => /* @__PURE__ */ jsx("option", { value: device.deviceId, children: device.label || `Device ${device.deviceId.substring(0, 8)}` }, device.deviceId))
      }
    )
  ] });
}
function AudioOutputSelector({ className, style, label, children }) {
  const { getDevices, setAudioOutput } = useJitsiContext();
  const [devices, setDevices] = useState([]);
  const [selectedId, setSelectedId] = useState();
  useEffect(() => {
    getDevices().then((all) => setDevices(all.filter((d) => d.kind === "audiooutput")));
  }, [getDevices]);
  const handleSelect = useCallback(async (deviceId) => {
    setSelectedId(deviceId);
    await setAudioOutput(deviceId);
  }, [setAudioOutput]);
  if (children) return /* @__PURE__ */ jsx(Fragment, { children: children(devices, handleSelect, selectedId) });
  return /* @__PURE__ */ jsxs("div", { className: `rj-field-group ${className || ""}`, style, children: [
    /* @__PURE__ */ jsx("label", { className: "rj-label", children: label || "Speaker" }),
    /* @__PURE__ */ jsx("select", { className: "rj-select", value: selectedId || "", onChange: (e) => handleSelect(e.target.value), children: devices.map((d) => /* @__PURE__ */ jsx("option", { value: d.deviceId, children: d.label || `Device ${d.deviceId.substring(0, 8)}` }, d.deviceId)) })
  ] });
}
var QUALITY_OPTIONS = [
  { label: "Low (180p)", value: 180 },
  { label: "Medium (360p)", value: 360 },
  { label: "HD (720p)", value: 720 },
  { label: "Full HD (1080p)", value: 1080 }
];
var LAST_N = [
  { label: "5 participants", value: 5 },
  { label: "10 participants", value: 10 },
  { label: "20 participants", value: 20 },
  { label: "Unlimited", value: -1 }
];
function PerformanceSettings({ className, style, children }) {
  const { setVideoQuality, setSenderQuality, setMaxVisibleParticipants } = useJitsiContext();
  if (children) return /* @__PURE__ */ jsx(Fragment, { children: children(setVideoQuality, setSenderQuality, setMaxVisibleParticipants) });
  return /* @__PURE__ */ jsxs("div", { className: `rj-panel ${className || ""}`, style, children: [
    /* @__PURE__ */ jsxs("div", { className: "rj-form-row", children: [
      /* @__PURE__ */ jsx("label", { className: "rj-label", children: "Receive Quality" }),
      /* @__PURE__ */ jsx("select", { className: "rj-select", defaultValue: 720, onChange: (e) => setVideoQuality(Number(e.target.value)), children: QUALITY_OPTIONS.map((o) => /* @__PURE__ */ jsx("option", { value: o.value, children: o.label }, o.value)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rj-form-row", children: [
      /* @__PURE__ */ jsx("label", { className: "rj-label", children: "Send Quality" }),
      /* @__PURE__ */ jsx("select", { className: "rj-select", defaultValue: 720, onChange: (e) => setSenderQuality(Number(e.target.value)), children: QUALITY_OPTIONS.map((o) => /* @__PURE__ */ jsx("option", { value: o.value, children: o.label }, o.value)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rj-form-row", children: [
      /* @__PURE__ */ jsx("label", { className: "rj-label", children: "Max Visible Participants" }),
      /* @__PURE__ */ jsx("select", { className: "rj-select", defaultValue: 20, onChange: (e) => setMaxVisibleParticipants(Number(e.target.value)), children: LAST_N.map((o) => /* @__PURE__ */ jsx("option", { value: o.value, children: o.label }, o.value)) })
    ] })
  ] });
}
function ToggleWhiteboard({ className, style, asChild, children }) {
  const { whiteboardActive, toggleWhiteboard } = useJitsiContext();
  const dataState = whiteboardActive ? "active" : "off";
  const label = whiteboardActive ? "Close whiteboard" : "Open whiteboard";
  if (typeof children === "function") return /* @__PURE__ */ jsx(Fragment, { children: children(whiteboardActive, toggleWhiteboard) });
  if (asChild && React5.isValidElement(children)) {
    return /* @__PURE__ */ jsx(Slot, { onClick: toggleWhiteboard, "data-state": dataState, "aria-label": label, title: label, className, style, children });
  }
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: `rj-btn ${whiteboardActive ? "rj-btn--accent" : "rj-btn--active"} ${className || ""}`,
      style,
      onClick: toggleWhiteboard,
      "data-state": dataState,
      title: label,
      "aria-label": label,
      type: "button",
      children: /* @__PURE__ */ jsx(WhiteboardIcon, {})
    }
  );
}
function VirtualBackgroundSelector({ className, style, children }) {
  const { virtualBackground, virtualBackgroundEffects, setVirtualBackground } = useJitsiContext();
  if (typeof children === "function") {
    return /* @__PURE__ */ jsx(Fragment, { children: children(virtualBackgroundEffects, virtualBackground, setVirtualBackground) });
  }
  if (virtualBackgroundEffects.length === 0) return null;
  return /* @__PURE__ */ jsx("div", { className: `rj-vb-selector ${className || ""}`, style, children: /* @__PURE__ */ jsxs("div", { className: "rj-vb-selector__grid", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: `rj-vb-item ${!virtualBackground ? "rj-vb-item--active" : ""}`,
        onClick: () => setVirtualBackground(null),
        children: [
          /* @__PURE__ */ jsx("div", { className: "rj-vb-item__preview rj-vb-item__preview--none", children: /* @__PURE__ */ jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
            /* @__PURE__ */ jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
          ] }) }),
          /* @__PURE__ */ jsx("span", { className: "rj-vb-item__label", children: "None" })
        ]
      }
    ),
    virtualBackgroundEffects.map((opt) => {
      const isSelected = virtualBackground?.type === opt.config.type && (opt.config.type === "image" ? virtualBackground.imageUrl === opt.config.imageUrl : true);
      return /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: `rj-vb-item ${isSelected ? "rj-vb-item--active" : ""}`,
          onClick: () => setVirtualBackground(opt.config),
          children: [
            /* @__PURE__ */ jsx("div", { className: "rj-vb-item__preview", children: opt.config.imageUrl ? /* @__PURE__ */ jsx("img", { src: opt.config.imageUrl, alt: opt.label }) : opt.config.type === "blur" ? /* @__PURE__ */ jsx("div", { className: "rj-vb-item__preview--blur" }) : /* @__PURE__ */ jsx("div", { className: "rj-vb-item__preview--placeholder" }) }),
            /* @__PURE__ */ jsx("span", { className: "rj-vb-item__label", children: opt.label })
          ]
        },
        opt.id
      );
    })
  ] }) });
}
function ScreenSharePreview() {
  const { localScreenTrack, isScreenSharing } = useJitsiContext();
  const videoRef = useRef(null);
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !localScreenTrack) return;
    localScreenTrack.attach(el);
    return () => {
      localScreenTrack.detach(el);
    };
  }, [localScreenTrack]);
  if (!isScreenSharing || !localScreenTrack) return null;
  return /* @__PURE__ */ jsxs("div", { className: "rj-screen-tile", children: [
    /* @__PURE__ */ jsx("video", { className: "rj-screen-tile__video", ref: videoRef, autoPlay: true, playsInline: true, muted: true }),
    /* @__PURE__ */ jsx("div", { className: "rj-screen-tile__label", children: "Your screen" })
  ] });
}
function MeetingUI({ title, showSidebar = false, showSettings = true, whiteboardComponent }) {
  const [sidebarOpen, setSidebarOpen] = useState(showSidebar);
  const [activeTab, setActiveTab] = useState("participants");
  const [showPollCreator, setShowPollCreator] = useState(false);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "rj-meeting__header", children: [
      /* @__PURE__ */ jsx("div", { className: "rj-meeting__title", children: /* @__PURE__ */ jsx("span", { children: title || "react-jitsi" }) }),
      /* @__PURE__ */ jsxs("div", { className: "rj-meeting__header-actions", children: [
        /* @__PURE__ */ jsx(RecordingIndicator, {}),
        /* @__PURE__ */ jsx(ConnectionStatus, {})
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rj-meeting__main", children: [
      /* @__PURE__ */ jsxs("div", { className: "rj-meeting__video-area", children: [
        /* @__PURE__ */ jsxs("div", { className: "rj-meeting__remote-area", children: [
          /* @__PURE__ */ jsx(ScreenSharePreview, {}),
          /* @__PURE__ */ jsx(VideoLayout, { whiteboardComponent })
        ] }),
        /* @__PURE__ */ jsx(Captions, {})
      ] }),
      sidebarOpen && /* @__PURE__ */ jsxs("div", { className: "rj-meeting__sidebar", children: [
        /* @__PURE__ */ jsxs("div", { className: "rj-meeting__tab-bar", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: `rj-meeting__tab ${activeTab === "participants" ? "rj-meeting__tab--active" : ""}`,
              onClick: () => setActiveTab("participants"),
              children: "People"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: `rj-meeting__tab ${activeTab === "chat" ? "rj-meeting__tab--active" : ""}`,
              onClick: () => setActiveTab("chat"),
              children: "Chat"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: `rj-meeting__tab ${activeTab === "polls" ? "rj-meeting__tab--active" : ""}`,
              onClick: () => setActiveTab("polls"),
              children: "Polls"
            }
          ),
          showSettings && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: `rj-meeting__tab ${activeTab === "settings" ? "rj-meeting__tab--active" : ""}`,
              onClick: () => setActiveTab("settings"),
              children: "Settings"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rj-meeting__sidebar-content", children: [
          activeTab === "participants" && /* @__PURE__ */ jsx(ParticipantList, {}),
          activeTab === "chat" && /* @__PURE__ */ jsx(ChatPanel, { style: { height: "100%", borderRadius: 0, backgroundColor: "transparent" } }),
          activeTab === "polls" && /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "12px" }, children: [
            !showPollCreator && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                style: {
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px dashed rgba(255,255,255,0.2)",
                  backgroundColor: "transparent",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontFamily: "'Inter', sans-serif"
                },
                onClick: () => setShowPollCreator(true),
                children: "+ Create Poll"
              }
            ),
            showPollCreator && /* @__PURE__ */ jsx(PollCreator, { onCreated: () => setShowPollCreator(false) }),
            /* @__PURE__ */ jsx(PollDisplay, {})
          ] }),
          activeTab === "settings" && /* @__PURE__ */ jsxs("div", { className: "rj-meeting__settings-group", children: [
            /* @__PURE__ */ jsx(DeviceSelector, { kind: "audioinput", label: "Microphone" }),
            /* @__PURE__ */ jsx(DeviceSelector, { kind: "videoinput", label: "Camera" }),
            /* @__PURE__ */ jsx(ToggleMirror, {}),
            /* @__PURE__ */ jsx(AudioOutputSelector, { label: "Speaker" }),
            /* @__PURE__ */ jsxs("div", { style: { borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px" }, children: [
              /* @__PURE__ */ jsx("label", { className: "rj-label", style: { marginBottom: "8px", display: "block" }, children: "Background" }),
              /* @__PURE__ */ jsx(VirtualBackgroundSelector, {})
            ] }),
            /* @__PURE__ */ jsx("div", { style: { borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px" }, children: /* @__PURE__ */ jsx(PerformanceSettings, { style: { padding: 0, backgroundColor: "transparent" } }) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rj-meeting__toolbar", children: [
      /* @__PURE__ */ jsx("div", { className: "rj-meeting__toolbar-section" }),
      /* @__PURE__ */ jsxs("div", { className: "rj-meeting__toolbar-section", style: { justifyContent: "center" }, children: [
        /* @__PURE__ */ jsx(ToggleAudio, {}),
        /* @__PURE__ */ jsx(ToggleVideo, {}),
        /* @__PURE__ */ jsx(ScreenShareButton, {}),
        /* @__PURE__ */ jsx(ToggleRecording, {}),
        /* @__PURE__ */ jsx(ToggleCaptions, {}),
        /* @__PURE__ */ jsxs(Popover, { children: [
          /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "rj-btn rj-btn--active",
              title: "More options",
              children: /* @__PURE__ */ jsx(MoreHorizontal, {})
            }
          ) }),
          /* @__PURE__ */ jsx(PopoverContent, { children: /* @__PURE__ */ jsx("div", { style: { background: "var(--rj-bg)", marginBottom: "8px", borderRadius: "50%" }, children: /* @__PURE__ */ jsx(ToggleWhiteboard, {}) }) })
        ] }),
        /* @__PURE__ */ jsx(LeaveButton, { label: "Leave" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rj-meeting__toolbar-section", style: { justifyContent: "flex-end" }, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `rj-btn ${sidebarOpen && activeTab === "participants" ? "rj-btn--accent" : "rj-btn--active"}`,
            onClick: () => {
              setSidebarOpen((s) => activeTab === "participants" ? !s : true);
              setActiveTab("participants");
            },
            title: "Toggle participants",
            children: /* @__PURE__ */ jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("path", { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }),
              /* @__PURE__ */ jsx("circle", { cx: "9", cy: "7", r: "4" }),
              /* @__PURE__ */ jsx("path", { d: "M23 21v-2a4 4 0 0 0-3-3.87" }),
              /* @__PURE__ */ jsx("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(ToggleChat, { children: (_isOpen, _toggle, unread) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: `rj-btn ${sidebarOpen && activeTab === "chat" ? "rj-btn--accent" : "rj-btn--active"}`,
            style: { position: "relative" },
            onClick: () => {
              setSidebarOpen((s) => activeTab === "chat" ? !s : true);
              setActiveTab("chat");
            },
            children: [
              /* @__PURE__ */ jsx(ChatIcon, {}),
              unread > 0 && /* @__PURE__ */ jsx("span", { className: "rj-badge rj-badge--danger", children: unread > 99 ? "99+" : unread })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx(TogglePolls, { children: (_isOpen, _toggle, polls) => {
          const active = polls.filter((p) => p.isOpen).length;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: `rj-btn ${sidebarOpen && activeTab === "polls" ? "rj-btn--accent" : "rj-btn--active"}`,
              style: { position: "relative" },
              onClick: () => {
                setSidebarOpen((s) => activeTab === "polls" ? !s : true);
                setActiveTab("polls");
              },
              children: [
                /* @__PURE__ */ jsx(PollIcon, {}),
                active > 0 && /* @__PURE__ */ jsx("span", { className: "rj-badge rj-badge--accent", children: active })
              ]
            }
          );
        } }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `rj-btn ${sidebarOpen && activeTab === "settings" ? "rj-btn--accent" : "rj-btn--active"}`,
            onClick: () => {
              setSidebarOpen((s) => activeTab === "settings" ? !s : true);
              setActiveTab("settings");
            },
            title: "Toggle settings",
            children: /* @__PURE__ */ jsx(Settings, {})
          }
        )
      ] })
    ] })
  ] });
}
function JitsiMeeting({
  title,
  height = "100vh",
  showSidebar = false,
  showSettings = true,
  whiteboardComponent,
  ...providerProps
}) {
  return /* @__PURE__ */ jsx("div", { className: "rj-meeting", style: { height }, children: /* @__PURE__ */ jsx(JitsiProvider, { ...providerProps, children: /* @__PURE__ */ jsx(MeetingUI, { title, showSidebar, showSettings, whiteboardComponent }) }) });
}
function AudioTrack() {
  const { remoteTracks } = useJitsiContext();
  const audioElementsRef = useRef(/* @__PURE__ */ new Map());
  useEffect(() => {
    const currentElements = audioElementsRef.current;
    const activeTrackIds = /* @__PURE__ */ new Set();
    remoteTracks.forEach((tracks) => {
      tracks.forEach((track) => {
        if (track.getType() !== "audio") return;
        const trackId = track.getId();
        activeTrackIds.add(trackId);
        if (!currentElements.has(trackId)) {
          const audioEl = document.createElement("audio");
          audioEl.autoplay = true;
          audioEl.setAttribute("data-jitsi-track", trackId);
          audioEl.style.display = "none";
          document.body.appendChild(audioEl);
          track.attach(audioEl);
          currentElements.set(trackId, audioEl);
        }
      });
    });
    currentElements.forEach((audioEl, trackId) => {
      if (!activeTrackIds.has(trackId)) {
        audioEl.pause();
        audioEl.srcObject = null;
        audioEl.remove();
        currentElements.delete(trackId);
      }
    });
    return () => {
      currentElements.forEach((audioEl) => {
        audioEl.pause();
        audioEl.srcObject = null;
        audioEl.remove();
      });
      currentElements.clear();
    };
  }, [remoteTracks]);
  return null;
}
function VirtualBackground({ className, style, asChild, children }) {
  const { virtualBackground, setVirtualBackground, removeVirtualBackground } = useJitsiContext();
  const isActive = !!virtualBackground;
  const dataState = isActive ? "active" : "off";
  const label = isActive ? "Remove background" : "Virtual background";
  if (typeof children === "function") return /* @__PURE__ */ jsx(Fragment, { children: children(virtualBackground, setVirtualBackground, removeVirtualBackground) });
  const toggle = async () => {
    if (isActive) await removeVirtualBackground();
  };
  if (asChild && React5.isValidElement(children)) {
    return /* @__PURE__ */ jsx(Slot, { onClick: toggle, "data-state": dataState, "aria-label": label, title: label, className, style, children });
  }
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: `rj-btn ${isActive ? "rj-btn--accent" : "rj-btn--active"} ${className || ""}`,
      style,
      onClick: toggle,
      "data-state": dataState,
      title: label,
      "aria-label": label,
      type: "button",
      children: /* @__PURE__ */ jsx(BackgroundIcon, {})
    }
  );
}
function ToggleNoiseSuppression({ className, style, asChild, children }) {
  const { noiseSuppressionEnabled, setNoiseSuppression, toggleNoiseSuppression } = useJitsiContext();
  const dataState = noiseSuppressionEnabled ? "active" : "off";
  const label = noiseSuppressionEnabled ? "Disable noise suppression" : "Enable noise suppression";
  if (typeof children === "function") return /* @__PURE__ */ jsx(Fragment, { children: children(noiseSuppressionEnabled, setNoiseSuppression) });
  if (asChild && React5.isValidElement(children)) {
    return /* @__PURE__ */ jsx(Slot, { onClick: toggleNoiseSuppression, "data-state": dataState, "aria-label": label, title: label, className, style, children });
  }
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: `rj-btn ${noiseSuppressionEnabled ? "rj-btn--success" : "rj-btn--active"} ${className || ""}`,
      style,
      onClick: toggleNoiseSuppression,
      "data-state": dataState,
      title: label,
      "aria-label": label,
      type: "button",
      children: /* @__PURE__ */ jsx(NoiseIcon, {})
    }
  );
}
function ChatInput({ className, style, placeholder = "Type a message...", privateTo, children }) {
  const { sendMessage } = useJitsiContext();
  const [text, setText] = useState("");
  const send = useCallback(() => {
    if (!text.trim()) return;
    sendMessage(text.trim(), privateTo);
    setText("");
  }, [text, sendMessage, privateTo]);
  if (children) return /* @__PURE__ */ jsx(Fragment, { children: children(text, setText, send) });
  return /* @__PURE__ */ jsxs("div", { className: `rj-chat-input ${className || ""}`, style, children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        className: "rj-input",
        value: text,
        onChange: (e) => setText(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        },
        placeholder
      }
    ),
    /* @__PURE__ */ jsx("button", { className: "rj-send-btn", onClick: send, type: "button", children: "Send" })
  ] });
}
function ChatMessages({ className, style, renderMessage, children }) {
  const { messages } = useJitsiContext();
  if (children) return /* @__PURE__ */ jsx(Fragment, { children: children(messages) });
  return /* @__PURE__ */ jsx("div", { className: `rj-msg-list ${className || ""}`, style, children: messages.map((msg) => {
    if (renderMessage) return /* @__PURE__ */ jsx(React5.Fragment, { children: renderMessage(msg) }, msg.id);
    return /* @__PURE__ */ jsxs("div", { className: `rj-msg ${msg.isLocal ? "rj-msg--local" : "rj-msg--remote"}`, children: [
      /* @__PURE__ */ jsxs("span", { className: "rj-msg__sender", children: [
        msg.displayName,
        msg.isPrivate ? " (private)" : ""
      ] }),
      /* @__PURE__ */ jsx("div", { className: `rj-msg__bubble ${msg.isLocal ? "rj-msg__bubble--local" : ""}`, children: msg.text })
    ] }, msg.id);
  }) });
}
function Whiteboard({ className, style, onDataReceived, children }) {
  const { whiteboardActive, getWhiteboardData, toggleWhiteboard, sendWhiteboardData, onWhiteboardData } = useJitsiContext();
  useEffect(() => {
    if (!onDataReceived) return;
    const unsubscribe = onWhiteboardData(onDataReceived);
    return unsubscribe;
  }, [onDataReceived, onWhiteboardData]);
  const sendData = useCallback((data) => {
    sendWhiteboardData(data);
  }, [sendWhiteboardData]);
  if (children) return /* @__PURE__ */ jsx(Fragment, { children: children(whiteboardActive, getWhiteboardData, sendData, toggleWhiteboard) });
  if (!whiteboardActive) return null;
  return /* @__PURE__ */ jsxs("div", { className: `rj-panel ${className || ""}`, style: { alignItems: "center", justifyContent: "center", minHeight: "400px", border: "2px dashed rgba(255,255,255,0.15)", ...style }, children: [
    /* @__PURE__ */ jsxs("svg", { width: "48", height: "48", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", style: { opacity: 0.4 }, children: [
      /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
      /* @__PURE__ */ jsx("path", { d: "M3 9h18M9 21V9" })
    ] }),
    /* @__PURE__ */ jsx("span", { style: { color: "#9ca3af" }, children: "Whiteboard active - Integrate your preferred whiteboard library" }),
    /* @__PURE__ */ jsx("span", { style: { fontSize: "12px", color: "#6b7280" }, children: "Use the render prop API for full control" })
  ] });
}
function MuteAllButton({ className, style, mediaType = "audio", asChild, children }) {
  const { localRole, muteAll } = useJitsiContext();
  if (localRole !== "moderator") return null;
  const handleMuteAll = () => muteAll(mediaType);
  const label = mediaType === "audio" ? "Mute all microphones" : "Turn off all cameras";
  if (typeof children === "function") return /* @__PURE__ */ jsx(Fragment, { children: children(handleMuteAll) });
  if (asChild && React5.isValidElement(children)) {
    return /* @__PURE__ */ jsx(Slot, { onClick: handleMuteAll, "aria-label": label, title: label, className, style, children });
  }
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: `rj-mute-all-btn ${className || ""}`,
      style,
      onClick: handleMuteAll,
      title: label,
      "aria-label": label,
      type: "button",
      children: mediaType === "audio" ? "Mute All" : "Disable All Cameras"
    }
  );
}

export { AdminControls, AudioOutputSelector, AudioTrack, BackgroundIcon, Captions, CaptionsIcon, ChatIcon, ChatInput, ChatMessages, ChatPanel, ConnectionIndicator, ConnectionStatus, DeviceSelector, EmptyRoomIcon, Fullscreen, FullscreenExit, Grid, GridOff, JitsiMeeting, JitsiProvider, LeaveButton, LocalVideo, MicMutedOverlayIcon, MicMutedSmallIcon, MicOffIcon, MicOnIcon, MirrorIcon, MoreHorizontal, MoreVertical, MuteAllButton, NoiseIcon, ParticipantList, ParticipantStatsPanel, PerformanceSettings, PhoneOffIcon, Pin, PinOff, PinOverlay, PollCreator, PollDisplay, PollIcon, RecordIcon, RecordingIndicator, RemoteVideos, ScreenShareButton, ScreenShareIcon, Settings, Slot, StopRecordIcon, StopShareIcon, ToggleAudio, ToggleCaptions, ToggleChat, ToggleMirror, ToggleNoiseSuppression, TogglePolls, ToggleRecording, ToggleVideo, ToggleWhiteboard, VideoLayout, VideoMutedSmallIcon, VideoOffIcon, VideoOnIcon, VirtualBackground, VirtualBackgroundSelector, Whiteboard, WhiteboardIcon, useJitsi };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map