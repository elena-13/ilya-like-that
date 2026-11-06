'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';

import { INVITE_SHOW_EVERY_TIME, inviteSeenKey } from './config';
import { InviteOverlay } from './components/InviteOverlay';

// Runs the birthday invite scenario once per signed-in user:
//   'peek'   – the owl peeks out from behind the hero clouds (PEEKS in
//              config, one OwlPeek per cloud) and takes off on the last one;
//   'flight' – it flies to the front, drops the envelope, and the envelope
//              opens (InviteOverlay, a full-screen layer);
//   'rest'   – once the invite is closed (or was seen on an earlier visit),
//              the owl sits on a cloud (OwlRest); clicking it reopens the
//              invite, so guests can check the date again.
// Signed-out visitors see none of it (no peeking, invite or resting owl).
// In development, `?invite` in the URL replays it for a signed-in user who
// has already seen it.

type Phase = 'off' | 'peek' | 'flight' | 'rest';

type InviteState = {
  phase: Phase;
  /** Where the flying owl was on screen when it left the clouds. */
  takeoff: DOMRect | null;
  /** Which peek is playing (index into PEEKS). */
  peekStep: number;
  /** The current peek is over; play the next one. */
  peekDone: () => void;
  startFlight: (takeoff: DOMRect | null) => void;
  /** Opens the invite again (from the resting owl). */
  reopen: () => void;
};

const InviteContext = createContext<InviteState>({
  phase: 'off',
  takeoff: null,
  peekStep: 0,
  peekDone: () => {},
  startFlight: () => {},
  reopen: () => {},
});

export const useBirthdayInvite = () => useContext(InviteContext);

const readSeen = (key: string) => {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};

const writeSeen = (key: string) => {
  try {
    localStorage.setItem(key, '1');
  } catch {
    // Private mode etc.: the invite may show again, which is fine.
  }
};

export function BirthdayInviteProvider({ children }: { children: ReactNode }) {
  const { data, status } = useSession();
  const userId = data?.user?.id;
  const [phase, setPhase] = useState<Phase>('off');
  const [peekStep, setPeekStep] = useState(0);
  const [takeoff, setTakeoff] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    // Signed-in guests only; signing out hides it straight away.
    if (!userId) {
      setPhase('off');
      return;
    }

    const replay =
      process.env.NODE_ENV === 'development' &&
      new URLSearchParams(window.location.search).has('invite');
    const due = replay || INVITE_SHOW_EVERY_TIME || !readSeen(inviteSeenKey(userId));
    if (!due) {
      setPhase('rest');
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPeekStep(0);
    setPhase(reduceMotion ? 'flight' : 'peek');
  }, [status, userId]);

  const peekDone = useCallback(() => setPeekStep((step) => step + 1), []);

  const startFlight = useCallback((rect: DOMRect | null) => {
    setTakeoff(rect);
    setPhase('flight');
  }, []);

  const close = useCallback(() => {
    if (!userId) {
      setPhase('off');
      return;
    }
    writeSeen(inviteSeenKey(userId));
    setPhase('rest');
  }, [userId]);

  const reopen = useCallback(() => {
    setTakeoff(null);
    setPhase('flight');
  }, []);

  const value = useMemo(
    () => ({ phase, takeoff, peekStep, peekDone, startFlight, reopen }),
    [phase, takeoff, peekStep, peekDone, startFlight, reopen],
  );

  return (
    <InviteContext.Provider value={value}>
      {children}
      {phase === 'flight' && <InviteOverlay takeoff={takeoff} onClose={close} />}
    </InviteContext.Provider>
  );
}
