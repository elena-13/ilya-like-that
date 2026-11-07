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
import { INVITE_SEEN_KEY } from './config';
import { InviteOverlay } from './components/InviteOverlay';

// Runs the birthday invite scenario once per invited browser:
//   'peek'   – the owl peeks out from behind the hero clouds (PEEKS in
//              config, one OwlPeek per cloud) and takes off on the last one;
//   'flight' – it flies to the front, drops the envelope, and the envelope
//              opens (InviteOverlay, a full-screen layer);
//              It's remembered as seen (localStorage) as soon as it opens;
//   'rest'   – once the invite is closed (or was seen on an earlier visit),
//              the owl sits on a cloud (OwlRest); clicking it reopens the
//              invite, so guests can check the date again.
// Only guests who opened the secret share link get it (`invited`, checked on
// the server from the cookie the link sets, see inviteAccess.ts), whether or
// not they ever sign in. Signed-in users without the link skip the show but
// still get the resting owl (phase 'rest' from the start), which opens the
// invite when clicked. Everyone else sees none of it. In development, `?invite` in the URL replays it for an invited
// guest who has already seen it.

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

type BirthdayInviteProviderProps = {
  /** This visitor opened the share link (see inviteAccess.ts). */
  invited: boolean;
  /** Signed in: gets the resting owl even without the share link. */
  signedIn?: boolean;
  children: ReactNode;
};

export function BirthdayInviteProvider({ invited, signedIn = false, children }: BirthdayInviteProviderProps) {
  const [phase, setPhase] = useState<Phase>('off');
  const [peekStep, setPeekStep] = useState(0);
  const [takeoff, setTakeoff] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!invited) {
      setPhase(signedIn ? 'rest' : 'off');
      return;
    }

    const replay =
      process.env.NODE_ENV === 'development' &&
      new URLSearchParams(window.location.search).has('invite');
    const due = replay || !readSeen(INVITE_SEEN_KEY);
    if (!due) {
      setPhase('rest');
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPeekStep(0);
    if (reduceMotion) writeSeen(INVITE_SEEN_KEY);
    setPhase(reduceMotion ? 'flight' : 'peek');
  }, [invited, signedIn]);

  const peekDone = useCallback(() => setPeekStep((step) => step + 1), []);

  const startFlight = useCallback((rect: DOMRect | null) => {
    // The invite is on its way: count it as seen even if the guest leaves
    // without closing it, so the show never replays.
    writeSeen(INVITE_SEEN_KEY);
    setTakeoff(rect);
    setPhase('flight');
  }, []);

  const close = useCallback(() => {
    writeSeen(INVITE_SEEN_KEY);
    setPhase('rest');
  }, []);

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
