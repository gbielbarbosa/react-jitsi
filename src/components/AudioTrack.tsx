import { useEffect, useRef } from 'react';
import { useJitsiContext } from '../JitsiContext';

/**
 * Invisible component that manages audio playback for all remote participants.
 *
 * This ensures that remote audio plays even if you are not using <RemoteVideos>.
 * If you are already using <RemoteVideos>, this component is not needed
 * as <RemoteVideos> handles audio attachment internally.
 *
 * @example
 * ```tsx
 * <JitsiProvider domain="8x8.vc" roomName="my-room">
 *   <AudioTrack />
 *   <LocalVideo />
 *   {/* remote audio will play even without RemoteVideos *\/}
 * </JitsiProvider>
 * ```
 */
export function AudioTrack() {
  const { remoteTracks } = useJitsiContext();
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    const currentElements = audioElementsRef.current;
    const activeTrackIds = new Set<string>();

    // Attach new audio tracks
    remoteTracks.forEach((tracks) => {
      tracks.forEach((track) => {
        if (track.getType() !== 'audio') return;

        const trackId = track.getId();
        activeTrackIds.add(trackId);

        if (!currentElements.has(trackId)) {
          const audioEl = document.createElement('audio');
          audioEl.autoplay = true;
          audioEl.setAttribute('data-jitsi-track', trackId);
          // Keep audio elements hidden
          audioEl.style.display = 'none';
          document.body.appendChild(audioEl);
          track.attach(audioEl);
          currentElements.set(trackId, audioEl);
        }
      });
    });

    // Cleanup removed tracks
    currentElements.forEach((audioEl, trackId) => {
      if (!activeTrackIds.has(trackId)) {
        audioEl.pause();
        audioEl.srcObject = null;
        audioEl.remove();
        currentElements.delete(trackId);
      }
    });

    return () => {
      // Full cleanup on unmount
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
