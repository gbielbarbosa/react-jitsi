import type { Participant } from '../types';
import { useJitsiContext } from '../JitsiContext';
import { AdminControls } from './AdminControls';
import { Fullscreen, FullscreenExit, Grid, GridOff, MoreVertical, Pin, PinOff } from '../icons';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';

export interface VideoControlsOverlayProps {
  participant: Participant;
  videoMode?: 'grid' | 'floating',
  setVideoMode?: (mode: 'grid' | 'floating') => void,
  isPinned: boolean;
  onTogglePin: () => void;
  objectFit: 'cover' | 'contain';
  onToggleFit: () => void;
}

export function VideoControlsOverlay({
  participant,
  videoMode,
  setVideoMode,
  isPinned,
  onTogglePin,
  objectFit,
  onToggleFit,
}: VideoControlsOverlayProps) {
  const { localRole } = useJitsiContext();
  const isModerator = localRole === 'moderator';

  if (participant.id !== "whiteboard-view") return (
    <div className="rj-video-overlay-controls">
      <div className="rj-video-overlay-actions">
        {
          videoMode && setVideoMode &&
          <button
            className='rj-video-btn'
            onClick={() => setVideoMode(videoMode === "grid" ? "floating" : "grid")}
          >
            {videoMode === "grid" ? <GridOff /> : <Grid />}
          </button>
        }
        <button
          className={`rj-video-btn ${isPinned ? 'rj-video-btn--active' : ''}`}
          onClick={onTogglePin}
          title={isPinned ? 'Unpin' : 'Pin'}
        >
          {isPinned ? <PinOff /> : <Pin />}
        </button>
        <button
          className="rj-video-btn"
          onClick={onToggleFit}
          title={objectFit === 'cover' ? 'Show whole video' : 'Crop to fill'}
        >
          {objectFit === 'cover' ? <Fullscreen /> : <FullscreenExit />}
        </button>
        {/* If it's a remote participant and local user is moderator, show admin controls */}
        {!participant.isLocal && isModerator && (
          <Popover>
            <PopoverTrigger asChild>
              <button className='rj-video-btn'>
                <MoreVertical />
              </button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="rj-video-overlay-admin">
                <AdminControls participantId={participant.id} />
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );

  return (
    <div className='rj-video-overlay-actions'>
      <button
        className={`rj-video-btn ${isPinned ? 'rj-video-btn--active' : ''}`}
        onClick={onTogglePin}
        title={isPinned ? 'Unpin' : 'Pin'}
      >
        {isPinned ? <PinOff /> : <Pin />}
      </button>
    </div>
  )
}
