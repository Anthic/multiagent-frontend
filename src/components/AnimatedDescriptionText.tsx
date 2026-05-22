'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface Letter {
  ch: string;
  w: number;
  x: number;
  y: number;
  ox: number;
  oy: number;
  px: number;
  py: number;
  line: number;
  locked: boolean;
}

interface DragState {
  idx: number;
  offsetX: number;
  offsetY: number;
}

interface AnimatedDescriptionTextProps {
  text: string;
}

const FONT = '18px Roboto, Arial, sans-serif';
const LINE_HEIGHT = 28;
const MARGIN = 2;
const DAMPING = 0.96;
const GRAVITY = 0.16;
const ITERATIONS = 10;

export function AnimatedDescriptionText({ text }: AnimatedDescriptionTextProps) {
  const graphemes = useMemo(() => {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      return [...segmenter.segment(text)].map((item) => item.segment);
    }

    return Array.from(text);
  }, [text]);

  const containerRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLImageElement>(null);
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const lettersRef = useRef<Letter[]>([]);
  const restLengthsRef = useRef<number[]>([]);
  const dragsRef = useRef(new Map<number, DragState>());
  const unravelLineRef = useRef(-1);
  const unravelCooldownRef = useRef(0);
  const unravelActiveRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    if (!measureCtx) return;
    measureCtx.font = FONT;

    function layoutLetters() {
      if (!container || !measureCtx) return;

      const maxWidth = Math.max(240, container.getBoundingClientRect().width - MARGIN * 2);
      let x = MARGIN;
      let y = 0;
      let line = 0;

      const nextLetters = graphemes.map((ch, idx) => {
        const w = measureCtx.measureText(ch).width;
        if (ch === ' ' && x > MARGIN) {
          let nextWordWidth = 0;
          for (let j = idx + 1; j < graphemes.length && graphemes[j] !== ' '; j++) {
            nextWordWidth += measureCtx.measureText(graphemes[j]).width;
          }

          if (x + w + nextWordWidth > maxWidth) {
            x = MARGIN;
            y += LINE_HEIGHT;
            line++;
          }
        }

        const previous = lettersRef.current[idx];
        const letter: Letter = {
          ch,
          w,
          x: previous?.locked === false ? previous.x : x,
          y: previous?.locked === false ? previous.y : y,
          ox: x,
          oy: y,
          px: previous?.locked === false ? previous.px : x,
          py: previous?.locked === false ? previous.py : y,
          line,
          locked: previous ? previous.locked : true,
        };

        x += w;
        return letter;
      });

      const lastIdx = nextLetters.length - 1;
      for (let i = lastIdx; i > Math.max(-1, lastIdx - 6); i--) {
        nextLetters[i].locked = false;
      }
      unravelLineRef.current = nextLetters[lastIdx]?.line ?? -1;
      unravelCooldownRef.current = 0;
      unravelActiveRef.current = false;

      lettersRef.current = nextLetters;
      restLengthsRef.current = nextLetters.slice(0, -1).map((letter, idx) => {
        const next = nextLetters[idx + 1];
        return Math.hypot(
          next.ox + next.w / 2 - (letter.ox + letter.w / 2),
          next.oy + LINE_HEIGHT / 2 - (letter.oy + LINE_HEIGHT / 2),
        ) * 1.2;
      });

      container.style.height = `${y + LINE_HEIGHT + 58}px`;
      setReady(true);
    }

    layoutLetters();
    const resizeObserver = new ResizeObserver(layoutLetters);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [graphemes]);

  useEffect(() => {
    let animationId = 0;

    function isDragged(idx: number) {
      for (const drag of dragsRef.current.values()) {
        if (drag.idx === idx) return true;
      }

      return false;
    }

    function simulate() {
      const letters = lettersRef.current;
      const restLengths = restLengthsRef.current;
      if (!letters.length) return;

      if (unravelActiveRef.current) {
        if (unravelCooldownRef.current > 0) {
          unravelCooldownRef.current--;
        } else if (unravelLineRef.current >= 0) {
          for (const letter of letters) {
            if (letter.line !== unravelLineRef.current || !letter.locked) continue;
            letter.locked = false;
            letter.px = letter.x;
            letter.py = letter.y - 0.5;
          }

          unravelLineRef.current--;
          unravelCooldownRef.current = 24;
        } else {
          unravelActiveRef.current = false;
        }

        if (hintRef.current) hintRef.current.style.opacity = '0';
      }

      for (let i = letters.length - 2; i >= 0; i--) {
        const letter = letters[i];
        const next = letters[i + 1];
        if (!letter.locked || next.locked) continue;

        const dx = next.x + next.w / 2 - (letter.ox + letter.w / 2);
        const dy = next.y + LINE_HEIGHT / 2 - (letter.oy + LINE_HEIGHT / 2);
        if (Math.hypot(dx, dy) > restLengths[i] + 1) {
          letter.locked = false;
          letter.px = letter.x;
          letter.py = letter.y;
          if (hintRef.current) hintRef.current.style.opacity = '0';
        }
      }

      for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        if (letter.locked || isDragged(i)) continue;

        const vx = (letter.x - letter.px) * DAMPING;
        const vy = (letter.y - letter.py) * DAMPING;
        letter.px = letter.x;
        letter.py = letter.y;
        letter.x += vx;
        letter.y += vy + GRAVITY;
      }

      for (let iter = 0; iter < ITERATIONS; iter++) {
        for (let i = 0; i < letters.length - 1; i++) {
          const a = letters[i];
          const b = letters[i + 1];
          if (a.locked && b.locked) continue;

          const ax = a.x + a.w / 2;
          const ay = a.y + LINE_HEIGHT / 2;
          const bx = b.x + b.w / 2;
          const by = b.y + LINE_HEIGHT / 2;
          const dx = bx - ax;
          const dy = by - ay;
          const dist = Math.hypot(dx, dy) || 0.001;
          const diff = (dist - restLengths[i]) / dist;
          const aFixed = a.locked || isDragged(i);
          const bFixed = b.locked || isDragged(i + 1);

          if (aFixed && !bFixed) {
            b.x -= dx * diff;
            b.y -= dy * diff;
          } else if (!aFixed && bFixed) {
            a.x += dx * diff;
            a.y += dy * diff;
          } else if (!aFixed && !bFixed) {
            a.x += dx * diff * 0.5;
            a.y += dy * diff * 0.5;
            b.x -= dx * diff * 0.5;
            b.y -= dy * diff * 0.5;
          }
        }
      }

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const maxX = rect.width;
      const maxY = rect.height;
      for (const letter of letters) {
        if (letter.locked) continue;
        if (letter.x < 0) letter.x = 0;
        if (letter.x + letter.w > maxX) letter.x = maxX - letter.w;
        if (letter.y < 0) letter.y = 0;
        if (letter.y + LINE_HEIGHT > maxY) letter.y = maxY - LINE_HEIGHT;
      }
    }

    function render() {
      simulate();

      const letters = lettersRef.current;
      letters.forEach((letter, idx) => {
        const element = letterRefs.current[idx];
        if (!element) return;
        element.style.transform = `translate(${letter.x}px, ${letter.y}px)`;
        element.style.pointerEvents = letter.locked ? 'none' : 'auto';
        element.style.cursor = letter.locked ? 'default' : 'grab';
      });

      const last = letters[letters.length - 1];
      if (last && hintRef.current) {
        hintRef.current.style.transform = `translate(${last.ox - 46}px, ${last.oy + LINE_HEIGHT + 6}px)`;
      }

      animationId = requestAnimationFrame(render);
    }

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, []);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    let idx = Number(target.dataset.letterIndex);
    const letters = lettersRef.current;
    if (!letters.length) return;

    if (!Number.isFinite(idx) || !letters[idx] || letters[idx].locked) {
      idx = letters.length - 1;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    dragsRef.current.set(event.pointerId, {
      idx,
      offsetX: event.clientX - rect.left - letters[idx].x,
      offsetY: event.clientY - rect.top - letters[idx].y,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.style.cursor = 'grabbing';
    letters[idx].locked = false;
    unravelActiveRef.current = true;
    if (hintRef.current) hintRef.current.style.opacity = '0';
    event.preventDefault();
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragsRef.current.get(event.pointerId);
    if (!drag) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const letter = lettersRef.current[drag.idx];
    letter.x = event.clientX - rect.left - drag.offsetX;
    letter.y = event.clientY - rect.top - drag.offsetY;
    letter.px = letter.x;
    letter.py = letter.y;
    letter.locked = false;
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragsRef.current.get(event.pointerId);
    if (!drag) return;

    const element = letterRefs.current[drag.idx];
    if (element) element.style.cursor = 'grab';
    event.currentTarget.style.cursor = 'grab';
    dragsRef.current.delete(event.pointerId);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full cursor-grab select-none touch-none overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {graphemes.map((ch, idx) => (
        <span
          key={`${ch}-${idx}`}
          ref={(element) => {
            letterRefs.current[idx] = element;
          }}
          data-letter-index={idx}
          className="absolute left-0 top-0 font-roboto text-[18px] leading-none text-black/62 will-change-transform"
          style={{ opacity: ready ? 1 : 0, pointerEvents: 'none' }}
        >
          {ch}
        </span>
      ))}
      <img
        ref={hintRef}
        src="/drag.png"
        alt=""
        className="pointer-events-none absolute left-0 top-0 z-20 w-[82px] transition-opacity duration-700"
        style={{ opacity: ready ? 1 : 0 }}
      />
    </div>
  );
}
