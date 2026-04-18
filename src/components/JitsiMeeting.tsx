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
// Styles
// ---------------------------------------------------------------------------

const containerStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', width: '100%',
  backgroundColor: '#0f0f19', color: '#e0e0e0', overflow: 'hidden',
  fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
};

const headerStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
  backgroundColor: 'rgba(15,15,25,0.8)', backdropFilter: 'blur(12px)',
  zIndex: 10,
};

const titleStyle: React.CSSProperties = {
  fontSize: '16px', fontWeight: 600, color: '#ffffff',
  display: 'flex', alignItems: 'center', gap: '12px',
};

const mainAreaStyle: React.CSSProperties = {
  display: 'flex', flex: 1, overflow: 'hidden', position: 'relative',
};

const videoAreaStyle: React.CSSProperties = {
  flex: 1, display: 'flex', flexDirection: 'column',
  padding: '16px', gap: '12px', overflow: 'auto', position: 'relative',
};

const localVideoContainerStyle: React.CSSProperties = {
  position: 'absolute', bottom: '90px', right: '28px',
  width: '220px', height: '140px', borderRadius: '12px',
  overflow: 'hidden', zIndex: 5,
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  border: '2px solid rgba(255,255,255,0.1)',
};

const remoteAreaStyle: React.CSSProperties = {
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const toolbarStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  padding: '12px 20px', backgroundColor: 'rgba(15,15,25,0.9)',
  backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.06)',
  zIndex: 10,
};

const sidebarStyle: React.CSSProperties = {
  width: '320px', display: 'flex', flexDirection: 'column',
  borderLeft: '1px solid rgba(255,255,255,0.06)',
  backgroundColor: 'rgba(10,10,20,0.95)',
};

const tabBarStyle: React.CSSProperties = {
  display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const tabBtnStyle: React.CSSProperties = {
  flex: 1, padding: '10px 8px', cursor: 'pointer',
  borderTop: 'none', borderRight: 'none', borderLeft: 'none',
  borderBottom: '2px solid transparent',
  fontSize: '12px', fontWeight: 500, textTransform: 'uppercase',
  letterSpacing: '0.04em', transition: 'all 0.15s ease',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  backgroundColor: 'transparent', color: '#9ca3af',
};

const tabActiveStyle: React.CSSProperties = {
  ...tabBtnStyle, color: '#a5b4fc',
  borderBottom: '2px solid #6366f1',
};

const tabContentStyle: React.CSSProperties = {
  flex: 1, overflow: 'auto', padding: '12px',
};

const dividerStyle: React.CSSProperties = { width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.12)' };

const emptyStateStyle: React.CSSProperties = {
  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', gap: '16px', color: '#6b7280', textAlign: 'center',
  padding: '32px',
};

const logoStyle: React.CSSProperties = {
  width: '48px', height: '48px', borderRadius: '12px',
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '20px', fontWeight: 700, color: '#fff',
};

// ---------------------------------------------------------------------------
// Local screen share preview (renders own screen track)
// ---------------------------------------------------------------------------

const screenTileStyle: React.CSSProperties = {
  position: 'relative', borderRadius: '12px', overflow: 'hidden',
  backgroundColor: '#1a1a2e', aspectRatio: '16 / 9',
  border: '2px solid rgba(99,102,241,0.5)',
};
const screenLabelStyle: React.CSSProperties = {
  position: 'absolute', bottom: '8px', left: '8px',
  padding: '4px 10px', borderRadius: '6px',
  backgroundColor: 'rgba(99,102,241,0.8)', backdropFilter: 'blur(4px)',
  color: '#fff', fontSize: '12px', fontWeight: 600,
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};

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
    <div style={screenTileStyle}>
      <video ref={videoRef} autoPlay playsInline muted
        style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      <div style={screenLabelStyle}>📺 Your screen</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner meeting UI (consumes context)
// ---------------------------------------------------------------------------

function MeetingUI({ title, showSidebar = true, showSettings = true }: {
  title?: string; showSidebar?: boolean; showSettings?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(showSidebar);
  const [activeTab, setActiveTab] = useState<SidebarTab>('participants');
  const [showPollCreator, setShowPollCreator] = useState(false);

  return (
    <>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>
          <div style={logoStyle}>J</div>
          <span>{title || 'Jitsi Meeting'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RecordingIndicator />
          <ConnectionStatus />
        </div>
      </div>

      {/* Main area */}
      <div style={mainAreaStyle}>
        {/* Video area */}
        <div style={videoAreaStyle}>
          <div style={remoteAreaStyle}>
            <ScreenSharePreview />
            <RemoteVideos style={{ maxHeight: '100%' }} />
            <div id="empty-room" style={emptyStateStyle}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span style={{ fontSize: '14px' }}>Waiting for others to join...</span>
            </div>
          </div>

          <Captions />

          <div style={localVideoContainerStyle}>
            <LocalVideo style={{ width: '100%', height: '100%' }} />
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div style={sidebarStyle}>
            <div style={tabBarStyle}>
              <button type="button" style={activeTab === 'participants' ? tabActiveStyle : tabBtnStyle}
                onClick={() => setActiveTab('participants')}>People</button>
              <button type="button" style={activeTab === 'chat' ? tabActiveStyle : tabBtnStyle}
                onClick={() => setActiveTab('chat')}>Chat</button>
              <button type="button" style={activeTab === 'polls' ? tabActiveStyle : tabBtnStyle}
                onClick={() => setActiveTab('polls')}>Polls</button>
              {showSettings && (
                <button type="button" style={activeTab === 'settings' ? tabActiveStyle : tabBtnStyle}
                  onClick={() => setActiveTab('settings')}>Settings</button>
              )}
            </div>
            <div style={tabContentStyle}>
              {activeTab === 'participants' && <ParticipantList />}
              {activeTab === 'chat' && <ChatPanel style={{ height: '100%', borderRadius: 0, backgroundColor: 'transparent' }} />}
              {activeTab === 'polls' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {!showPollCreator && (
                    <button type="button"
                      style={{
                        padding: '8px 16px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)',
                        backgroundColor: 'transparent', color: '#a5b4fc', cursor: 'pointer', fontSize: '13px',
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
      <div style={toolbarStyle}>
        <ToggleAudio />
        <ToggleVideo />
        <ToggleMirror />
        <div style={dividerStyle} />
        <ScreenShareButton />
        <ToggleRecording />
        <ToggleCaptions />
        <div style={dividerStyle} />
        <ToggleChat>
          {(_isOpen, _toggle, unread) => (
            <button type="button"
              style={{
                position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '48px', height: '48px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                transition: 'all 0.2s ease', outline: 'none', color: '#fff',
                backgroundColor: sidebarOpen && activeTab === 'chat' ? 'rgba(99,102,241,0.9)' : 'rgba(255,255,255,0.15)',
              }}
              onClick={() => { setSidebarOpen(true); setActiveTab('chat'); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: '-2px', right: '-2px', minWidth: '18px', height: '18px',
                  borderRadius: '9px', backgroundColor: '#ef4444', color: '#fff', fontSize: '10px',
                  fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                }}>{unread > 99 ? '99+' : unread}</span>
              )}
            </button>
          )}
        </ToggleChat>
        <TogglePolls>
          {(_isOpen, _toggle, polls) => {
            const active = polls.filter(p => p.isOpen).length;
            return (
              <button type="button"
                style={{
                  position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '48px', height: '48px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s ease', outline: 'none', color: '#fff',
                  backgroundColor: sidebarOpen && activeTab === 'polls' ? 'rgba(99,102,241,0.9)' : 'rgba(255,255,255,0.15)',
                }}
                onClick={() => { setSidebarOpen(true); setActiveTab('polls'); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                {active > 0 && (
                  <span style={{
                    position: 'absolute', top: '-2px', right: '-2px', minWidth: '18px', height: '18px',
                    borderRadius: '9px', backgroundColor: '#6366f1', color: '#fff', fontSize: '10px',
                    fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                  }}>{active}</span>
                )}
              </button>
            );
          }}
        </TogglePolls>
        <div style={dividerStyle} />
        <button type="button"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '48px', height: '48px', borderRadius: '50%', border: 'none', cursor: 'pointer',
            transition: 'all 0.2s ease', outline: 'none', color: '#fff',
            backgroundColor: sidebarOpen && activeTab === 'participants' ? 'rgba(99,102,241,0.9)' : 'rgba(255,255,255,0.15)',
          }}
          onClick={() => { setSidebarOpen(s => !s); setActiveTab('participants'); }}
          title="Toggle participants">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </button>
        <div style={dividerStyle} />
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
 *
 * function App() {
 *   return (
 *     <JitsiMeeting
 *       domain="meet.jit.si"
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
    <div style={{ ...containerStyle, height }}>
      <JitsiProvider {...providerProps}>
        <MeetingUI title={title} showSidebar={showSidebar} showSettings={showSettings} />
      </JitsiProvider>
    </div>
  );
}
