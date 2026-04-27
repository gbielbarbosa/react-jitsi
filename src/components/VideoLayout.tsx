import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Rnd } from 'react-rnd';
import { useJitsiContext } from '../JitsiContext';
import { calculateGridSettings } from '../utils/layout';
import { LocalVideo } from './LocalVideo';
import { RemoteParticipantTile } from './RemoteVideos';
import { VideoControlsOverlay } from './VideoControlsOverlay';
import type { Participant } from '../types';
import { PinOverlay } from '../icons';
import * as HoverCard from '@radix-ui/react-hover-card';

export interface VideoLayoutProps {
  className?: string;
  style?: React.CSSProperties;
  /** Component to render inside the grid when the whiteboard is active */
  whiteboardComponent?: React.ReactNode;
}

export function VideoLayout({ className, style, whiteboardComponent }: VideoLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { participants, localParticipantId, remoteTracks, whiteboardActive } = useJitsiContext();

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const prevContainerSize = useRef({ width: 0, height: 0 });

  // Pinned participants
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  // Object fits mapping
  const [objectFits, setObjectFits] = useState<Record<string, 'cover' | 'contain'>>({});


  // Floating Rnd position and size
  const [rndPosition, setRndPosition] = useState({ x: 0, y: 0 });
  const [rndSize, setRndSize] = useState({ width: 240, height: 180 });

  // Update initial position once containerSize is known
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

  // Clamp Rnd position when container shrinks or expand
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
          y: Math.max(0, Math.min(nextY, newMaxY)),
        };
      });

      prevContainerSize.current = { width: newWidth, height: newHeight };
    }
  }, [containerSize, rndSize]);

  // Local Video Mode (grid or floating)
  const remoteParticipants = Array.from(participants.values()).filter(p => !p.isLocal);
  const hasRemotes = remoteParticipants.length > 0;

  const [localVideoMode, setLocalVideoMode] = useState<'grid' | 'floating'>(
    hasRemotes ? 'floating' : 'grid'
  );

  // Auto-switch to floating on first remote join
  const prevHasRemotesRef = useRef(hasRemotes);
  useEffect(() => {
    if (!prevHasRemotesRef.current && hasRemotes) {
      setLocalVideoMode('floating');
    }
    prevHasRemotesRef.current = hasRemotes;
  }, [hasRemotes]);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleFit = (id: string) => {
    setObjectFits((prev) => ({
      ...prev,
      [id]: prev[id] === 'contain' ? 'cover' : 'contain',
    }));
  };

  const localParticipant = localParticipantId ? participants.get(localParticipantId) : undefined;

  const allParticipants = Array.from(participants.values());

  // Inject whiteboard as a virtual participant if active and component is provided
  const whiteboardId = 'whiteboard-view';
  if (whiteboardActive && whiteboardComponent) {
    allParticipants.push({
      id: whiteboardId,
      displayName: 'Whiteboard',
      isLocal: false,
      audioMuted: true,
      videoMuted: false,
      connectionStatus: 'active',
      role: 'none'
    });
  }

  const pinnedParticipantsList = allParticipants.filter(p => pinnedIds.has(p.id));
  const hasPinned = pinnedParticipantsList.length > 0;

  // Items to put in the grid/strip
  let gridItems: Participant[] = [];
  let stripItems: Participant[] = [];

  if (hasPinned) {
    gridItems = pinnedParticipantsList;
    stripItems = allParticipants.filter(
      p => !pinnedIds.has(p.id) && (p.isLocal ? localVideoMode === 'grid' : true)
    );
  } else {
    gridItems = allParticipants.filter(
      p => p.isLocal ? localVideoMode === 'grid' : true
    );
  }

  // Calculate grid dimensions
  const gridDimensions = calculateGridSettings(
    hasPinned ? containerSize.width - 256 : containerSize.width, // leave room for strip if pinned
    containerSize.height,
    gridItems.length,
    16 / 9,
    16 // gap
  );

  return (
    <div className={`rj-video-layout ${className || ''}`} style={style} ref={containerRef}>

      {/* Floating Local Video */}
      {localVideoMode === 'floating' && localParticipant && !pinnedIds.has(localParticipant.id) && (
        <Rnd
          position={rndPosition}
          size={rndSize}
          onDragStop={(_, d) => setRndPosition({ x: d.x, y: d.y })}
          onResizeStop={(_, __, ref, ___, position) => {
            setRndSize({
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
            });
            setRndPosition(position);
          }}
          minWidth={160}
          minHeight={120}
          bounds="parent"
          className="rj-local-floating"
        >
          <LocalVideo objectFit={objectFits[localParticipant.id] || 'cover'} showPlaceholder>
            <VideoControlsOverlay
              participant={localParticipant}
              videoMode={localVideoMode}
              setVideoMode={setLocalVideoMode}
              isPinned={pinnedIds.has(localParticipant.id)}
              onTogglePin={() => togglePin(localParticipant.id)}
              objectFit={objectFits[localParticipant.id] || 'cover'}
              onToggleFit={() => toggleFit(localParticipant.id)}
            />
          </LocalVideo>
        </Rnd>
      )}

      {hasPinned ? (
        <div className="rj-video-layout__spotlight">
          {/* Main Grid for Pinned Videos */}
          <div className="rj-video-layout__spotlight-main">
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignContent: 'center',
              gap: 16,
              width: '100%',
              height: '100%',
            }}>
              {gridItems.map((p) => (
                <div key={p.id} style={{ width: gridDimensions.width, height: gridDimensions.height }}>
                  {p.isLocal ? (
                    <LocalVideo objectFit={objectFits[p.id] || 'contain'}>
                      <div className="rj-remote-tile__pin-icon">
                        <PinOverlay />
                      </div>
                      <VideoControlsOverlay videoMode={localVideoMode} setVideoMode={setLocalVideoMode} participant={p} isPinned={true} onTogglePin={() => togglePin(p.id)} objectFit={objectFits[p.id] || 'contain'} onToggleFit={() => toggleFit(p.id)} />
                    </LocalVideo>
                  ) : p.id === whiteboardId ? (
                    <HoverCard.Root openDelay={200} closeDelay={300}>
                      <HoverCard.Trigger asChild>
                        <div className="rj-remote-tile" style={{ width: '100%', height: '100%', backgroundColor: 'var(--rj-card)' }}>
                          {whiteboardComponent}
                          <div className="rj-remote-tile__pin-icon"><PinOverlay /></div>
                        </div>
                      </HoverCard.Trigger>
                      <HoverCard.Portal>
                        <HoverCard.Content side='left' sideOffset={8}>
                          <VideoControlsOverlay participant={p} isPinned={true} onTogglePin={() => togglePin(p.id)} objectFit="contain" onToggleFit={() => { }} />
                        </HoverCard.Content>
                      </HoverCard.Portal>
                    </HoverCard.Root>
                  ) : (
                    <RemoteParticipantTile participant={p} tracks={remoteTracks.get(p.id) || []} objectFit={objectFits[p.id] || 'contain'} style={{ width: '100%', height: '100%' }}>
                      <div className="rj-remote-tile__pin-icon">
                        <PinOverlay />
                      </div>
                      <VideoControlsOverlay participant={p} isPinned={true} onTogglePin={() => togglePin(p.id)} objectFit={objectFits[p.id] || 'contain'} onToggleFit={() => toggleFit(p.id)} />
                    </RemoteParticipantTile>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Side Strip for others */}
          {stripItems.length > 0 && (
            <div className="rj-video-layout__spotlight-strip">
              {stripItems.map((p) => (
                <div key={p.id} style={{ width: '100%', aspectRatio: '16/9' }}>
                  {p.isLocal ? (
                    <LocalVideo objectFit={objectFits[p.id] || 'cover'}>
                      <VideoControlsOverlay videoMode={localVideoMode} setVideoMode={setLocalVideoMode} participant={p} isPinned={false} onTogglePin={() => togglePin(p.id)} objectFit={objectFits[p.id] || 'cover'} onToggleFit={() => toggleFit(p.id)} />
                    </LocalVideo>
                  ) : p.id === whiteboardId ? (
                    <HoverCard.Root openDelay={200} closeDelay={300}>
                      <HoverCard.Trigger asChild>
                        <div className="rj-remote-tile" style={{ width: '100%', height: '100%', backgroundColor: 'var(--rj-card)' }}>
                          {whiteboardComponent}
                        </div>
                      </HoverCard.Trigger>
                      <HoverCard.Portal>
                        <HoverCard.Content side='left' sideOffset={8}>
                          <VideoControlsOverlay participant={p} isPinned={false} onTogglePin={() => togglePin(p.id)} objectFit="contain" onToggleFit={() => { }} />
                        </HoverCard.Content>
                      </HoverCard.Portal>
                    </HoverCard.Root>
                  ) : (
                    <RemoteParticipantTile participant={p} tracks={remoteTracks.get(p.id) || []} objectFit={objectFits[p.id] || 'cover'} style={{ width: '100%', height: '100%' }}>
                      <VideoControlsOverlay participant={p} isPinned={false} onTogglePin={() => togglePin(p.id)} objectFit={objectFits[p.id] || 'cover'} onToggleFit={() => toggleFit(p.id)} />
                    </RemoteParticipantTile>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rj-video-layout__grid">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignContent: 'center',
            gap: 16,
            width: '100%',
            height: '100%',
          }}>
            {gridItems.map((p) => (
              <div key={p.id} style={{ width: gridDimensions.width, height: gridDimensions.height }}>
                {p.isLocal ? (
                  <LocalVideo objectFit={objectFits[p.id] || 'cover'}>
                    <VideoControlsOverlay videoMode={localVideoMode} setVideoMode={setLocalVideoMode} participant={p} isPinned={false} onTogglePin={() => togglePin(p.id)} objectFit={objectFits[p.id] || 'cover'} onToggleFit={() => toggleFit(p.id)} />
                  </LocalVideo>
                ) : p.id === whiteboardId ? (
                  <HoverCard.Root openDelay={200} closeDelay={300}>
                    <HoverCard.Trigger asChild>
                      <div className="rj-remote-tile" style={{ width: '100%', height: '100%', backgroundColor: 'var(--rj-card)' }}>
                        {whiteboardComponent}
                      </div>
                    </HoverCard.Trigger>
                    <HoverCard.Portal>
                      <HoverCard.Content side='left' sideOffset={8}>
                        <VideoControlsOverlay participant={p} isPinned={false} onTogglePin={() => togglePin(p.id)} objectFit="contain" onToggleFit={() => { }} />
                      </HoverCard.Content>
                    </HoverCard.Portal>
                  </HoverCard.Root>
                ) : (
                  <RemoteParticipantTile participant={p} tracks={remoteTracks.get(p.id) || []} objectFit={objectFits[p.id] || 'cover'} style={{ width: '100%', height: '100%' }}>
                    <VideoControlsOverlay participant={p} isPinned={false} onTogglePin={() => togglePin(p.id)} objectFit={objectFits[p.id] || 'cover'} onToggleFit={() => toggleFit(p.id)} />
                  </RemoteParticipantTile>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
