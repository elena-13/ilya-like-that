'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

import { OWL_MIN_WIDTH, OWL_SPOT } from '../config';
import { useBirthdayInvite } from '../BirthdayInviteProvider';
import { blinkOwl, flickEar, injectOwlSvg } from '../owlSvg';
import { CLOUD_SRC, findOwlSeat, SHOWN, type Seat } from '../owlSeat';

// After the invite is closed, the owl settles on a hero cloud and stays:
// it blinks now and then, sometimes flicks an ear or tilts its head.
// Clicking it reopens the invite, so guests can find the date again.
// It's drawn into the cloud's box behind the cloud picture, so the cloud
// hides its feet and it drifts along with the cloud. findOwlSeat picks the
// cloud and the spot, clear of the title and buttons at any screen size; on
// narrow phones, where the big clouds have no room, the owl gets its own
// small cloud in a clear corner of the hero card.

const sitting = `translate(-50%, ${-SHOWN * 100}%)`;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Where it sits if no clear seat is found: the right cloud's peeking spot. */
function fallbackSeat(): Seat | null {
  const container = document.querySelector<HTMLElement>('[data-cloud-slot="right"]');
  return container
    ? {
        kind: 'cloud',
        container,
        x: OWL_SPOT.x,
        edge: OWL_SPOT.edge,
        width: Math.max(OWL_SPOT.width, OWL_MIN_WIDTH / (container.clientWidth || 1)),
      }
    : null;
}

export function OwlRest() {
  const t = useTranslations('invite');
  const { phase, reopen } = useBirthdayInvite();
  const active = phase === 'rest';
  const [seat, setSeat] = useState<Seat | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const owlRef = useRef<HTMLSpanElement>(null);
  const perchRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  // Pick a seat, and pick again when the layout changes.
  useEffect(() => {
    if (!active) {
      setSeat(null);
      return;
    }
    let cancelled = false;
    const place = async () => {
      await document.fonts?.ready;
      const found = (await findOwlSeat()) ?? fallbackSeat();
      if (!cancelled) setSeat(found);
    };
    place();

    let timer = 0;
    const onResize = () => {
      clearTimeout(timer);
      timer = window.setTimeout(place, 250);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, [active]);

  const container = seat?.container;

  // Hop out of the cloud, then idle.
  useEffect(() => {
    if (!active || !container) return;
    const button = buttonRef.current;
    const owl = owlRef.current;
    if (!button || !owl) return;

    let cancelled = false;
    const animations: Animation[] = [];
    const track = (animation: Animation | null) => {
      if (animation) animations.push(animation);
      return animation?.finished;
    };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const run = async () => {
      await Promise.all([injectOwlSvg(owl), wait(reduceMotion ? 0 : 900)]);
      if (cancelled) return;
      const perch = perchRef.current;
      if (perch) {
        perch.style.visibility = 'visible';
        // Its own little cloud puffs in first.
        if (!reduceMotion) {
          await track(
            perch.animate(
              [
                { opacity: 0, transform: 'scale(0.7)' },
                { opacity: 1, transform: 'scale(1)' },
              ],
              { duration: 450, easing: 'cubic-bezier(.2,.9,.3,1.2)' },
            ),
          );
          if (cancelled) return;
        }
      }
      button.style.visibility = 'visible';

      if (!reduceMotion) {
        // Hop up from inside the cloud onto its edge.
        await track(
          button.animate(
            [
              { transform: 'translate(-50%, 30%)' },
              { transform: `translate(-50%, ${-SHOWN * 100 - 8}%)`, offset: 0.7 },
              { transform: sitting },
            ],
            { duration: 650, easing: 'cubic-bezier(.2,.9,.3,1.1)' },
          ),
        );
        if (cancelled) return;
      }
      if (reduceMotion) return;

      // Idle life: mostly blinks, now and then an ear flick or a head tilt.
      while (!cancelled) {
        await wait(rand(2500, 6000));
        if (cancelled || busy.current) continue;
        const roll = Math.random();
        if (roll < 0.55) blinkOwl(owl).forEach(track);
        else if (roll < 0.75) blinkOwl(owl, { double: true }).forEach(track);
        else if (roll < 0.88) track(flickEar(owl));
        else {
          const deg = Math.random() < 0.5 ? -9 : 9;
          track(
            owl.animate(
              [
                { transform: 'rotate(0deg)' },
                { transform: `rotate(${deg}deg)`, offset: 0.25 },
                { transform: `rotate(${deg}deg)`, offset: 0.7 },
                { transform: 'rotate(0deg)' },
              ],
              { duration: 1400, easing: 'ease-in-out' },
            ),
          );
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      animations.forEach((animation) => animation.cancel());
    };
  }, [active, container]);

  if (!active || !seat) return null;

  const onClick = async () => {
    const owl = owlRef.current;
    if (busy.current) return;
    busy.current = true;
    if (owl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // A happy little hop before the invite opens.
      await owl
        .animate(
          [
            { transform: 'translateY(0) scale(1, 1)' },
            { transform: 'translateY(4%) scale(1.06, 0.92)', offset: 0.2 },
            { transform: 'translateY(-16%) scale(0.96, 1.05)', offset: 0.55 },
            { transform: 'translateY(0) scale(1, 1)' },
          ],
          { duration: 420, easing: 'ease-in-out' },
        )
        .finished.catch(() => {});
    }
    busy.current = false;
    reopen();
  };

  const spot = seat.kind === 'cloud' ? seat : seat.owl;
  const owlButton = (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label={t('reopen')}
      title={t('reopen')}
      // Below the cloud picture (inside the cloud's own layer), so the
      // cloud covers its feet.
      className="group/owl pointer-events-auto absolute -z-10 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow"
      style={{
        left: `${spot.x * 100}%`,
        top: `${spot.edge * 100}%`,
        width: `${spot.width * 100}%`,
        transform: sitting,
        visibility: 'hidden',
      }}
    >
      {/* Leans in a little on hover, as if curious. */}
      <span className="block origin-[50%_90%] transition-transform duration-300 group-hover/owl:-rotate-6 group-hover/owl:scale-105">
        <span ref={owlRef} className="block origin-[50%_90%]" />
      </span>
    </button>
  );

  return createPortal(
    seat.kind === 'cloud' ? (
      owlButton
    ) : (
      <div
        ref={perchRef}
        className="pointer-events-none absolute isolate z-20 origin-bottom"
        style={{
          left: `${seat.box.left * 100}%`,
          top: `${seat.box.top * 100}%`,
          width: `${seat.box.width * 100}%`,
          visibility: 'hidden',
        }}
      >
        <div className="motion-safe:animate-[owl-hover_5s_ease-in-out_infinite]">
          {owlButton}
          {/* eslint-disable-next-line @next/next/no-img-element -- small copy of the hero cloud, already loaded */}
          <img src={CLOUD_SRC} alt="" draggable={false} className="relative block w-full" />
        </div>
      </div>
    ),
    seat.container,
  );
}
