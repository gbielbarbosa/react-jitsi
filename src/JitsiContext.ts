import { createContext, useContext } from 'react';
import type { JitsiContextValue } from './types';

/**
 * React context that holds the entire Jitsi conference state and actions.
 * This is provided by <JitsiProvider> and consumed by all child components.
 */
export const JitsiContext = createContext<JitsiContextValue | null>(null);

/**
 * Internal hook to consume the Jitsi context.
 * Throws if used outside of a <JitsiProvider>.
 */
export function useJitsiContext(): JitsiContextValue {
  const ctx = useContext(JitsiContext);

  if (!ctx) {
    throw new Error(
      '[react-jitsi] useJitsi() must be used within a <JitsiProvider>. ' +
      'Wrap your component tree with <JitsiProvider domain="..." roomName="...">.'
    );
  }

  return ctx;
}
