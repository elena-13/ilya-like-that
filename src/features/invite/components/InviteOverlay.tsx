'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { HandCrossIcon } from '@/features/wishlist/components/HandIcons';
import { DEFAULT_STICKER, stickerInk } from '@/features/wishlist/components/Sticker';
import { OWL_SPRITE } from '../config';
import { dropFeathers, setFlapRate } from '../feathers';
import { OwlSprite } from './OwlSprite';
import { CARD, ENVELOPE_RATIO, InviteEnvelope } from './InviteEnvelope';

// Second half of the invite scenario, on a full-screen layer:
// the owl flies from where it left the clouds to the front of the screen,
// drops the envelope (it falls toward the viewer and grows), flies away,
// and the envelope opens: the flap turns over and the card slides out.

type Props = {
  /** Where the flying owl was when it left the clouds; null skips the flight. */
  takeoff: DOMRect | null;
  onClose: () => void;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function layout() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const above = CARD.lift - CARD.startTop; // card height above the envelope once open
  const ew = Math.min(vw * 0.86, 440, (vh * 0.86) / (ENVELOPE_RATIO + above));
  const eh = ew * ENVELOPE_RATIO;
  const top = (vh - ew * (ENVELOPE_RATIO + above)) / 2 + ew * above;
  const owlW = Math.min(vw * 0.92, 560, vh * 0.75);
  const owlH = (owlW * OWL_SPRITE.frameHeight) / OWL_SPRITE.frameWidth;
  return {
    vw,
    vh,
    envelope: { w: ew, h: eh, left: (vw - ew) / 2, top },
    owl: {
      w: owlW,
      h: owlH,
      left: (vw - owlW) / 2,
      top: Math.max(-owlH * 0.05, top - OWL_SPRITE.envelope.top * owlH - vh * 0.1),
    },
  };
}

/** Transform that shows a `baseW`-wide element (centre origin) at a given box. */
const placeAt = (
  baseW: number,
  baseH: number,
  left: number,
  top: number,
  w: number,
  rotate = 0,
) => {
  const s = w / baseW;
  const x = left - baseW / 2 + w / 2;
  const y = top - baseH / 2 + (baseH * s) / 2;
  return `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${s})`;
};

export function InviteOverlay({ takeoff, onClose }: Props) {
  const t = useTranslations('invite');
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [opened, setOpened] = useState(false);
  const [closing, setClosing] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  const owlRef = useRef<HTMLDivElement>(null);
  const owlImgRef = useRef<HTMLImageElement>(null);
  const wobbleRef = useRef<HTMLDivElement>(null);
  const envelopeBoxRef = useRef<HTMLDivElement>(null);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const owl = owlRef.current;
    const owlImg = owlImgRef.current;
    const envelopeBox = envelopeBoxRef.current;
    const envelope = envelopeRef.current;
    const backdrop = backdropRef.current;
    const wobble = wobbleRef.current;
    if (!owl || !owlImg || !envelopeBox || !envelope || !backdrop || !wobble) return;
    const flap = envelope.querySelector<HTMLElement>('[data-part="flap"]');
    const cardWindow = envelope.querySelector<HTMLElement>('[data-part="card-window"]');
    if (!flap || !cardWindow) return;

    // Preload the "no envelope" sprite so the swap doesn't blink.
    new Image().src = OWL_SPRITE.empty;

    let cancelled = false;
    const animations: Animation[] = [];
    const play = (el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      const animation = el.animate(keyframes, { fill: 'forwards', ...options });
      animations.push(animation);
      return animation.finished;
    };

    const L = layout();
    envelopeBox.style.setProperty('--ew', `${L.envelope.w}px`);
    const envelopeFinal = placeAt(
      L.envelope.w,
      L.envelope.h,
      L.envelope.left,
      L.envelope.top,
      L.envelope.w,
    );
    const openWindowHeight = `${L.envelope.h + L.envelope.w * CARD.lift}px`;

    const showOpened = () => {
      owl.style.visibility = 'hidden';
      envelopeBox.style.visibility = 'visible';
      envelopeBox.style.transform = envelopeFinal;
      flap.style.transform = 'rotateX(180deg)';
      flap.style.zIndex = '5';
      cardWindow.style.visibility = 'visible';
      cardWindow.style.height = openWindowHeight;
      backdrop.style.opacity = '1';
      setOpened(true);
    };

    // The flap turns over (behind the card once past upright), then the
    // card slides out.
    const openEnvelope = async () => {
      await wait(250);
      await play(flap, [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(90deg)' }], {
        duration: 260,
        easing: 'ease-in',
      });
      if (cancelled) return;
      flap.style.zIndex = '5';
      cardWindow.style.visibility = 'visible';
      await play(flap, [{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(180deg)' }], {
        duration: 300,
        easing: 'ease-out',
      });
      if (cancelled) return;

      await play(cardWindow, [{ height: `${L.envelope.h}px` }, { height: openWindowHeight }], {
        duration: 1000,
        easing: 'cubic-bezier(.25,.8,.3,1)',
      });
      if (cancelled) return;
      owl.style.visibility = 'hidden';
      setOpened(true);
    };

    const run = async () => {
      if (!takeoff) {
        // Reopened from the resting owl (or reduced motion): no flight.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          showOpened();
          await play(envelopeBox, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
          return;
        }
        // The envelope pops up in place, then opens as usual.
        envelopeBox.style.visibility = 'visible';
        play(backdrop, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
        await play(
          envelopeBox,
          [
            {
              transform: placeAt(
                L.envelope.w,
                L.envelope.h,
                L.envelope.left + L.envelope.w * 0.2,
                L.envelope.top + L.envelope.h * 0.2,
                L.envelope.w * 0.6,
                -6,
              ),
              opacity: 0,
              easing: 'cubic-bezier(.2,.9,.3,1.25)',
            },
            { transform: envelopeFinal, opacity: 1 },
          ],
          { duration: 550 },
        );
        if (cancelled) return;
        await openEnvelope();
        return;
      }

      // 1. Fly from the clouds to the front, growing as it comes closer.
      const from = placeAt(L.owl.w, L.owl.h, takeoff.left, takeoff.top, takeoff.width, -6);
      const midW = L.owl.w * 0.55;
      const mid = placeAt(
        L.owl.w,
        L.owl.h,
        (takeoff.left + L.owl.left) / 2 + L.vw * 0.08,
        Math.min(takeoff.top, L.owl.top) - L.vh * 0.08,
        midW,
        8,
      );
      const to = placeAt(L.owl.w, L.owl.h, L.owl.left, L.owl.top, L.owl.w);
      owl.style.transform = from;
      owl.style.visibility = 'visible';

      play(backdrop, [{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 300 });

      // The envelope is heavy for such a small courier: twice on the way the
      // owl sags, flaps extra hard to catch itself (losing a feather the
      // first time), and wobbles back level.
      const dip = L.owl.h * 0.07;
      const level = 'translateY(0) rotate(0deg)';
      play(
        wobble,
        [
          { transform: level },
          { transform: level, offset: 0.22, easing: 'cubic-bezier(.5,0,.9,.6)' },
          { transform: `translateY(${dip}px) rotate(-8deg)`, offset: 0.32, easing: 'ease-out' },
          {
            transform: `translateY(${-dip * 0.3}px) rotate(4deg)`,
            offset: 0.42,
            easing: 'ease-in-out',
          },
          { transform: 'translateY(0) rotate(-1.5deg)', offset: 0.5, easing: 'ease-in-out' },
          { transform: level, offset: 0.62, easing: 'cubic-bezier(.5,0,.9,.6)' },
          {
            transform: `translateY(${dip * 0.65}px) rotate(6deg)`,
            offset: 0.7,
            easing: 'ease-out',
          },
          {
            transform: `translateY(${-dip * 0.2}px) rotate(-3deg)`,
            offset: 0.79,
            easing: 'ease-in-out',
          },
          { transform: level, offset: 0.88 },
          { transform: level },
        ],
        { duration: 2700 },
      );
      (async () => {
        const at = async (ms: number, rate: number) => {
          await wait(ms);
          if (!cancelled) setFlapRate(owlImg, rate);
        };
        await at(820, 2.6);
        const body = owl.getBoundingClientRect();
        if (!cancelled) {
          // From the wing tip, so it doesn't sit on the owl's chest.
          dropFeathers(body.left + body.width * 0.5, body.top + body.height * 0.3, {
            count: 1,
            size: Math.max(10, body.width * 0.035),
            spread: body.width * 0.3,
            zIndex: 55,
          });
        }
        await at(550, 1);
        await at(330, 2.2);
        await at(500, 1);
      })();

      await play(
        owl,
        [
          { transform: from, easing: 'cubic-bezier(.4,0,.6,1)' },
          { transform: mid, offset: 0.45, easing: 'cubic-bezier(.3,0,.3,1)' },
          { transform: to },
        ],
        { duration: 2000 },
      );
      if (cancelled) return;

      // 2. Hover a moment, then let go.
      await wait(700);
      if (cancelled) return;

      const owlBox = owlImg.parentElement!.getBoundingClientRect();
      const drop = {
        left: owlBox.left + OWL_SPRITE.envelope.left * owlBox.width,
        top: owlBox.top + OWL_SPRITE.envelope.top * owlBox.height,
        w: OWL_SPRITE.envelope.width * owlBox.width,
      };
      owlImg.src = OWL_SPRITE.empty;
      // Light again: a happy burst of flapping, and a few feathers float off.
      setFlapRate(owlImg, 1.8);
      dropFeathers(owlBox.left + owlBox.width * 0.5, owlBox.top + owlBox.height * 0.3, {
        count: 3,
        size: Math.max(10, owlBox.width * 0.035),
        spread: owlBox.width * 0.3,
        zIndex: 55,
      });
      const dropStart = placeAt(L.envelope.w, L.envelope.h, drop.left, drop.top, drop.w);
      envelopeBox.style.transform = dropStart;
      envelopeBox.style.visibility = 'visible';

      // The owl leaves up and to the right; the envelope falls toward you.
      play(
        owl,
        [
          { transform: to },
          {
            transform: placeAt(L.owl.w, L.owl.h, L.vw * 0.95, -L.owl.h * 0.8, L.owl.w * 0.45, 12),
          },
        ],
        { duration: 1500, easing: 'cubic-bezier(.5,0,.8,.6)' },
      );
      await play(
        envelopeBox,
        [
          { transform: dropStart, easing: 'cubic-bezier(.5,0,.7,.4)' },
          {
            transform: placeAt(
              L.envelope.w,
              L.envelope.h,
              L.envelope.left,
              L.envelope.top - L.vh * 0.04,
              L.envelope.w * 0.92,
              -7,
            ),
            offset: 0.7,
            easing: 'cubic-bezier(.2,.7,.4,1)',
          },
          {
            transform: placeAt(
              L.envelope.w,
              L.envelope.h,
              L.envelope.left,
              L.envelope.top,
              L.envelope.w,
              2.5,
            ),
            offset: 0.88,
          },
          { transform: envelopeFinal },
        ],
        { duration: 1100 },
      );
      if (cancelled) return;

      // 3. Open.
      await openEnvelope();
    };

    run();

    return () => {
      cancelled = true;
      animations.forEach((animation) => animation.cancel());
    };
  }, [mounted, takeoff]);

  useEffect(() => {
    if (opened) closeRef.current?.focus();
  }, [opened]);

  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={cn('fixed inset-0 z-50 transition-opacity duration-300', closing && 'opacity-0')}
    >
      <div
        ref={backdropRef}
        onClick={opened ? close : undefined}
        className="absolute inset-0 bg-sky-dark/45 opacity-0 backdrop-blur-[3px]"
      />

      <div
        ref={envelopeBoxRef}
        className="pointer-events-none fixed top-0 left-0 origin-center"
        style={{ visibility: 'hidden' }}
      >
        <InviteEnvelope ref={envelopeRef} titleId={titleId} />
      </div>

      <div
        ref={owlRef}
        className="pointer-events-none fixed top-0 left-0 origin-center will-change-transform"
        style={{ width: layoutWidth(), visibility: 'hidden' }}
      >
        <div className="motion-safe:animate-[owl-hover_3.4s_ease-in-out_infinite]">
          {/* Sags under the heavy envelope (see the flight above). */}
          <div ref={wobbleRef} className="origin-[50%_40%]">
            <OwlSprite imgRef={owlImgRef} className="w-full" />
          </div>
        </div>
      </div>

      <button
        ref={closeRef}
        type="button"
        onClick={close}
        aria-label={t('close')}
        style={stickerInk(DEFAULT_STICKER)}
        className={cn(
          // Same hand-drawn cross sticker as the site's other X buttons.
          'absolute top-4 right-4 grid size-12 cursor-pointer place-items-center rounded-full transition-[opacity,scale,rotate] duration-300 hover:scale-110 hover:rotate-6 focus-visible:ring-2 focus-visible:ring-yellow focus-visible:outline-none',
          opened ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <HandCrossIcon className="size-10" sticker={DEFAULT_STICKER.paper} />
      </button>
    </div>,
    document.body,
  );
}

const layoutWidth = () => `${layout().owl.w}px`;
