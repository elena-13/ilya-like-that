'use client';

import { useEffect, useRef } from 'react';

import { OWL_MIN_WIDTH, OWL_SPRITE, OWL_SPOT as SPOT, PEEKS, type PeekSide } from '../config';
import { useBirthdayInvite } from '../BirthdayInviteProvider';
import { dropFeathers, setFlapRate } from '../feathers';
import { blinkOwl, flickEar, injectOwlSvg } from '../owlSvg';
import { OwlSprite } from './OwlSprite';

// The owl peeking out from behind a hero cloud. Rendered in HeroClouds'
// slot behind each cloud; it peeks in the order of PEEKS, each time with its
// own acts (rocking, an ear flick, blinking), and on the last peek spreads its
// wings and takes off with the envelope. The owl SVG is inlined (not an <img>)
// so its ear and eyes can move.

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function OwlPeek({ side }: { side: PeekSide }) {
  const { phase, peekStep, peekDone, startFlight } = useBirthdayInvite();
  const peek = PEEKS[peekStep];
  const active = phase === 'peek' && peek?.side === side;
  const acts = peek?.acts;
  const takeOff = peekStep === PEEKS.length - 1;

  const owlRef = useRef<HTMLDivElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const flyerImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!active || !acts) return;
    const owl = owlRef.current;
    const box = owl?.parentElement;
    if (!owl || !box) return;

    let cancelled = false;
    const animations: Animation[] = [];
    const play = (el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      const animation = el.animate(keyframes, { fill: 'forwards', ...options });
      animations.push(animation);
      return animation.finished;
    };

    const run = async () => {
      await Promise.all([injectOwlSvg(owl), wait(peekStep === 0 ? 1200 : 400)]);
      if (cancelled) return;

      // Owl sizes in px from the cloud's current box.
      const boxH = box.clientHeight;
      const owlH = owl.clientHeight;
      // Rise until the head and shoulders clear the cloud edge.
      const rise = (SPOT.hidden - SPOT.edge) * boxH + owlH * 0.55;
      const down = 'translate(-50%, 0) rotate(0deg)';
      const up = (deg = 0) => `translate(-50%, ${-rise}px) rotate(${deg}deg)`;
      const popUp = 'cubic-bezier(.2,.9,.3,1.2)';

      owl.style.visibility = 'visible';

      // Pop up, play this peek's acts one after another, then duck back
      // down (or take off from the last peek).
      await play(owl, [{ transform: down }, { transform: up(0) }], {
        duration: 450,
        easing: popUp,
      });
      for (const act of acts) {
        if (cancelled) return;
        if (act === 'rock') {
          // Rocks from side to side.
          await play(
            owl,
            [
              { transform: up(0) },
              { transform: up(-10) },
              { transform: up(9) },
              { transform: up(-9) },
              { transform: up(8) },
              { transform: up(-4) },
              { transform: up(0) },
            ],
            { duration: 1900, easing: 'ease-in-out' },
          );
        } else if (act === 'ear') {
          // Leans and listens: one ear flicks twice, like an animal's.
          for (const delay of [550, 1300]) {
            const flick = flickEar(owl, { delay });
            if (flick) animations.push(flick);
          }
          await play(
            owl,
            [
              { transform: up(0), easing: 'ease-in-out' },
              { transform: up(4), offset: 0.15 },
              { transform: up(4), offset: 0.85, easing: 'ease-in-out' },
              { transform: up(0) },
            ],
            { duration: 2000 },
          );
        } else {
          // Blinks twice.
          animations.push(...blinkOwl(owl, { delay: 400, double: true }));
          await wait(1400);
        }
      }
      if (cancelled) return;

      if (!takeOff) {
        await play(owl, [{ transform: up(0) }, { transform: down }], {
          duration: 450,
          easing: 'ease-in',
        });
        if (cancelled) return;
        owl.style.visibility = 'hidden';
        peekDone();
        return;
      }

      // Last peek: spread the wings and take off.
      const flyer = flyerRef.current;
      if (!flyer) return;
      // Line the flying sprite up with the peeking owl, then swap them.
      const owlRect = owl.getBoundingClientRect();
      const boxRect = box.getBoundingClientRect();
      const owlTop = owlRect.top - boxRect.top;
      const flyerW = owl.clientWidth / OWL_SPRITE.staticOwl.width;
      const flyerH = (flyerW * OWL_SPRITE.frameHeight) / OWL_SPRITE.frameWidth;
      const flyerTop = owlTop - OWL_SPRITE.staticOwl.top * flyerH;
      flyer.style.width = `${flyerW}px`;
      flyer.style.top = `${flyerTop}px`;
      flyer.style.visibility = 'visible';

      await Promise.all([
        play(owl, [{ opacity: 1 }, { opacity: 0 }], { duration: 160 }),
        play(flyer, [{ opacity: 0 }, { opacity: 1 }], { duration: 160 }),
      ]);
      if (cancelled) return;

      // Rise until the envelope clears the cloud, drifting toward the middle.
      // The envelope is heavy: the owl first sinks a little, flaps extra
      // hard, then heaves itself up, shedding a couple of feathers.
      const clearTop = SPOT.edge * boxH - OWL_SPRITE.envelopeBottom * flyerH - 12;
      const lift = flyerTop - clearTop;
      const sag = flyerH * 0.05;
      setFlapRate(flyerImgRef.current, 2.6);
      // Back to the normal beat once airborne, to match the flight that follows.
      wait(1050).then(() => !cancelled && setFlapRate(flyerImgRef.current, 1));
      const rect = flyer.getBoundingClientRect();
      dropFeathers(rect.left + rect.width * 0.5, rect.top + rect.height * 0.3, {
        count: 2,
        size: Math.max(9, rect.width * 0.06),
        spread: rect.width * 0.3,
      });
      await play(
        flyer,
        [
          { transform: 'translate(-50%, 0) rotate(-4deg)', easing: 'ease-in-out' },
          {
            transform: `translate(-50%, ${sag}px) rotate(-7deg)`,
            offset: 0.22,
            easing: 'cubic-bezier(.3,.6,.4,1)',
          },
          {
            transform: `translate(-38%, ${-lift * 0.6}px) rotate(5deg)`,
            offset: 0.68,
            easing: 'ease-in-out',
          },
          { transform: `translate(-30%, ${-lift}px) rotate(3deg)` },
        ],
        { duration: 1500 },
      );
      if (cancelled) return;

      startFlight(flyer.getBoundingClientRect());
    };

    run();

    return () => {
      cancelled = true;
      animations.forEach((animation) => animation.cancel());
    };
  }, [active, acts, peekStep, takeOff, peekDone, startFlight]);

  if (!active) return null;

  const x = side === 'left' ? 1 - SPOT.x : SPOT.x;

  return (
    <>
      <div
        ref={owlRef}
        aria-hidden
        className="absolute"
        style={{
          left: `${x * 100}%`,
          top: `${SPOT.hidden * 100}%`,
          width: `max(${SPOT.width * 100}%, ${OWL_MIN_WIDTH}px)`,
          transform: 'translate(-50%, 0)',
          transformOrigin: '50% 90%',
          visibility: 'hidden',
        }}
      />
      {takeOff && (
        <OwlSprite
          ref={flyerRef}
          imgRef={flyerImgRef}
          className="absolute"
          style={{ left: `${x * 100}%`, transform: 'translate(-50%, 0)', visibility: 'hidden' }}
        />
      )}
    </>
  );
}
