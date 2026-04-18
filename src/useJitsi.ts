import { useJitsiContext } from './JitsiContext';
import type { JitsiContextValue } from './types';

/**
 * Public hook to access the Jitsi conference state and actions.
 *
 * Must be used within a <JitsiProvider>.
 *
 * @example
 * ```tsx
 * function CustomControl() {
 *   const { audioMuted, toggleAudio, participants } = useJitsi();
 *   return (
 *     <button onClick={toggleAudio}>
 *       {audioMuted ? '🔇 Unmute' : '🔊 Mute'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useJitsi(): JitsiContextValue {
  return useJitsiContext();
}
