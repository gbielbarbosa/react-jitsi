import React, { useEffect, useRef, useState } from 'react';
import { useJitsiContext } from '../JitsiContext';
import { JitsiProvider } from '../JitsiProvider';
import { LocalVideo } from './LocalVideo';
import { RemoteVideos } from './RemoteVideos';
import { ToggleAudio } from './ToggleAudio';
import { ToggleVideo } from './ToggleVideo';
import { ScreenShareButton } from './ScreenShareButton';
import { LeaveButton } from './LeaveButton';
import { ToggleMirror } from './ToggleMirror';
import { ToggleChat } from './ToggleChat';
import { ToggleRecording } from './ToggleRecording';
import { ToggleCaptions } from './ToggleCaptions';
import { TogglePolls } from './TogglePolls';
import { ConnectionStatus } from './ConnectionStatus';
import { RecordingIndicator } from './RecordingIndicator';
import { ChatPanel } from './ChatPanel';
import { ParticipantList } from './ParticipantList';
import { Captions } from './Captions';
import { PollCreator } from './PollCreator';
import { PollDisplay } from './PollDisplay';
import { DeviceSelector } from './DeviceSelector';
import { AudioOutputSelector } from './AudioOutputSelector';
import { PerformanceSettings } from './PerformanceSettings';
import { ChatIcon, PollIcon, EmptyRoomIcon } from '../icons';
import type { JitsiProviderProps } from '../types';

export interface JitsiMeetingProps extends Omit<JitsiProviderProps, 'children'> {
  /** Meeting title displayed in the header */
  title?: string;
  /** Height of the meeting container (default: '100vh') */
  height?: string;
  /** Show sidebar with participants and chat (default: true) */
  showSidebar?: boolean;
  /** Show settings button (default: true) */
  showSettings?: boolean;
}

type SidebarTab = 'participants' | 'chat' | 'polls' | 'settings';

// ---------------------------------------------------------------------------
// Local screen share preview (renders own screen track)
// ---------------------------------------------------------------------------

function ScreenSharePreview() {
  const { localScreenTrack, isScreenSharing } = useJitsiContext();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !localScreenTrack) return;
    localScreenTrack.attach(el);
    return () => { localScreenTrack.detach(el); };
  }, [localScreenTrack]);

  if (!isScreenSharing || !localScreenTrack) return null;

  return (
    <div className="rj-screen-tile">
      <video className="rj-screen-tile__video" ref={videoRef} autoPlay playsInline muted />
      <div className="rj-screen-tile__label">Your screen</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner meeting UI (consumes context)
// ---------------------------------------------------------------------------

function MeetingUI({ title, showSidebar = true, showSettings = true }: {
  title?: string; showSidebar?: boolean; showSettings?: boolean;
}) {
  const { participants } = useJitsiContext();
  const hasRemoteParticipants = Array.from(participants.values()).some((p) => !p.isLocal);

  const [sidebarOpen, setSidebarOpen] = useState(showSidebar);
  const [activeTab, setActiveTab] = useState<SidebarTab>('participants');
  const [showPollCreator, setShowPollCreator] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="rj-meeting__header">
        <div className="rj-meeting__title">
          <span>{title || 'Jitsi Meeting'}</span>
        </div>
        <div className="rj-meeting__header-actions">
          <RecordingIndicator />
          <ConnectionStatus />
        </div>
      </div>

      {/* Main area */}
      <div className="rj-meeting__main">
        {/* Video area */}
        <div className="rj-meeting__video-area">
          <div className="rj-meeting__remote-area">
            <ScreenSharePreview />
            <RemoteVideos style={{ maxHeight: '100%' }} />
            {!hasRemoteParticipants && (
              <div id="empty-room" className="rj-meeting__empty">
                <EmptyRoomIcon />
                <span style={{ fontSize: '14px' }}>Waiting for others to join...</span>
              </div>
            )}
          </div>

          <Captions />

          <div className="rj-meeting__local-video">
            <LocalVideo />
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="rj-meeting__sidebar">
            <div className="rj-meeting__tab-bar">
              <button type="button" className={`rj-meeting__tab ${activeTab === 'participants' ? 'rj-meeting__tab--active' : ''}`}
                onClick={() => setActiveTab('participants')}>People</button>
              <button type="button" className={`rj-meeting__tab ${activeTab === 'chat' ? 'rj-meeting__tab--active' : ''}`}
                onClick={() => setActiveTab('chat')}>Chat</button>
              <button type="button" className={`rj-meeting__tab ${activeTab === 'polls' ? 'rj-meeting__tab--active' : ''}`}
                onClick={() => setActiveTab('polls')}>Polls</button>
              {showSettings && (
                <button type="button" className={`rj-meeting__tab ${activeTab === 'settings' ? 'rj-meeting__tab--active' : ''}`}
                  onClick={() => setActiveTab('settings')}>Settings</button>
              )}
            </div>
            <div className="rj-meeting__sidebar-content">
              {activeTab === 'participants' && <ParticipantList />}
              {activeTab === 'chat' && <ChatPanel style={{ height: '100%', borderRadius: 0, backgroundColor: 'transparent' }} />}
              {activeTab === 'polls' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {!showPollCreator && (
                    <button type="button"
                      style={{
                        padding: '8px 16px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)',
                        backgroundColor: 'transparent', color: '#ffffff', cursor: 'pointer', fontSize: '13px',
                        fontFamily: "'Inter', sans-serif"
                      }}
                      onClick={() => setShowPollCreator(true)}>
                      + Create Poll
                    </button>
                  )}
                  {showPollCreator && (
                    <PollCreator onCreated={() => setShowPollCreator(false)} />
                  )}
                  <PollDisplay />
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="rj-meeting__settings-group">
                  <DeviceSelector kind="audioinput" label="Microphone" />
                  <DeviceSelector kind="videoinput" label="Camera" />
                  <AudioOutputSelector label="Speaker" />
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                    <PerformanceSettings style={{ padding: 0, backgroundColor: 'transparent' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="rj-meeting__toolbar">
        <ToggleAudio />
        <ToggleVideo />
        <ToggleMirror />
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <ScreenShareButton />
        <ToggleRecording />
        <ToggleCaptions />
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <ToggleChat>
          {(_isOpen, _toggle, unread) => (
            <button type="button"
              className={`rj-btn ${sidebarOpen && activeTab === 'chat' ? 'rj-btn--accent' : 'rj-btn--active'}`}
              style={{ position: 'relative' }}
              onClick={() => { setSidebarOpen(true); setActiveTab('chat'); }}>
              <ChatIcon />
              {unread > 0 && (
                <span className="rj-badge rj-badge--danger">{unread > 99 ? '99+' : unread}</span>
              )}
            </button>
          )}
        </ToggleChat>
        <TogglePolls>
          {(_isOpen, _toggle, polls) => {
            const active = polls.filter(p => p.isOpen).length;
            return (
              <button type="button"
                className={`rj-btn ${sidebarOpen && activeTab === 'polls' ? 'rj-btn--accent' : 'rj-btn--active'}`}
                style={{ position: 'relative' }}
                onClick={() => { setSidebarOpen(true); setActiveTab('polls'); }}>
                <PollIcon />
                {active > 0 && (
                  <span className="rj-badge rj-badge--accent">{active}</span>
                )}
              </button>
            );
          }}
        </TogglePolls>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <button type="button"
          className={`rj-btn ${sidebarOpen && activeTab === 'participants' ? 'rj-btn--accent' : 'rj-btn--active'}`}
          onClick={() => { setSidebarOpen(s => !s); setActiveTab('participants'); }}
          title="Toggle participants">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </button>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <LeaveButton label="Leave" />
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// JitsiMeeting — Pre-built, full-featured meeting component
// ---------------------------------------------------------------------------

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
export function JitsiMeeting({
  title,
  height = '100vh',
  showSidebar = true,
  showSettings = true,
  ...providerProps
}: JitsiMeetingProps) {
  return (
    <div className="rj-meeting" style={{ height }}>
      <JitsiProvider {...providerProps}>
        <MeetingUI title={title} showSidebar={showSidebar} showSettings={showSettings} />
      </JitsiProvider>
    </div>
  );
}
