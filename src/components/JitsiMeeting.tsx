import { useEffect, useRef, useState } from 'react';
import { useJitsiContext } from '../JitsiContext';
import { JitsiProvider } from '../JitsiProvider';
import { VideoLayout } from './VideoLayout';
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
import { ChatIcon, PollIcon, EmptyRoomIcon, Settings, MoreHorizontal } from '../icons';
import type { JitsiProviderProps } from '../types';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { ToggleWhiteboard } from './ToggleWhiteboard';

export interface JitsiMeetingProps extends Omit<JitsiProviderProps, 'children'> {
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

function MeetingUI({ title, showSidebar = false, showSettings = true, whiteboardComponent }: {
  title?: string; showSidebar?: boolean; showSettings?: boolean; whiteboardComponent?: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(showSidebar);
  const [activeTab, setActiveTab] = useState<SidebarTab>('participants');
  const [showPollCreator, setShowPollCreator] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="rj-meeting__header">
        <div className="rj-meeting__title">
          <span>{title || 'react-jitsi'}</span>
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
            <VideoLayout whiteboardComponent={whiteboardComponent} />
          </div>

          <Captions />
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
                  <ToggleMirror />
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
        <div className='rj-meeting__toolbar-section'>
          {/* TODO: Room timer */}
        </div>
        <div className='rj-meeting__toolbar-section' style={{ justifyContent: "center" }}>
          <ToggleAudio />
          <ToggleVideo />
          <ScreenShareButton />
          <ToggleRecording />
          <ToggleCaptions />
          <Popover>
            <PopoverTrigger asChild>
              <button type="button"
                className="rj-btn rj-btn--active"
                title="More options">
                <MoreHorizontal />
              </button>
            </PopoverTrigger>
            <PopoverContent>
              <div style={{ background: "var(--rj-bg)", marginBottom: "8px", borderRadius: "50%" }}>
                <ToggleWhiteboard />
              </div>
            </PopoverContent>
          </Popover>
          <LeaveButton label="Leave" />
        </div>
        <div className='rj-meeting__toolbar-section' style={{ justifyContent: "flex-end" }}>
          <button type="button"
            className={`rj-btn ${sidebarOpen && activeTab === 'participants' ? 'rj-btn--accent' : 'rj-btn--active'}`}
            onClick={() => { setSidebarOpen(s => activeTab === "participants" ? !s : true); setActiveTab('participants'); }}
            title="Toggle participants">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </button>
          <ToggleChat>
            {(_isOpen, _toggle, unread) => (
              <button type="button"
                className={`rj-btn ${sidebarOpen && activeTab === 'chat' ? 'rj-btn--accent' : 'rj-btn--active'}`}
                style={{ position: 'relative' }}
                onClick={() => { setSidebarOpen(s => activeTab === "chat" ? !s : true); setActiveTab('chat'); }}>
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
                  onClick={() => { setSidebarOpen(s => activeTab === "polls" ? !s : true); setActiveTab('polls'); }}>
                  <PollIcon />
                  {active > 0 && (
                    <span className="rj-badge rj-badge--accent">{active}</span>
                  )}
                </button>
              );
            }}
          </TogglePolls>
          <button type="button"
            className={`rj-btn ${sidebarOpen && activeTab === 'settings' ? 'rj-btn--accent' : 'rj-btn--active'}`}
            onClick={() => { setSidebarOpen(s => activeTab === "settings" ? !s : true); setActiveTab('settings'); }}
            title="Toggle settings">
            <Settings />
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// JitsiMeeting - Pre-built, full-featured meeting component
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
  showSidebar = false,
  showSettings = true,
  whiteboardComponent,
  ...providerProps
}: JitsiMeetingProps) {
  return (
    <div className="rj-meeting" style={{ height }}>
      <JitsiProvider {...providerProps}>
        <MeetingUI title={title} showSidebar={showSidebar} showSettings={showSettings} whiteboardComponent={whiteboardComponent} />
      </JitsiProvider>
    </div>
  );
}
