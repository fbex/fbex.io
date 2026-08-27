import gsap from 'gsap';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The entrance: wordmark letters rise out of their masks, then everything
 * else fades up behind them.
 */
export function playIntro() {
  if (prefersReducedMotion()) return;

  const letters = gsap.utils.toArray<HTMLElement>('[data-letter]');

  gsap.set(letters, { yPercent: 120, opacity: 0, filter: 'blur(14px)' });
  gsap.set('[data-rise]', { y: 26, opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  tl.to(letters, {
    yPercent: 0,
    opacity: 1,
    filter: 'blur(0px)',
    duration: 1.35,
    stagger: 0.055,
  })
    .to(
      '[data-rise]',
      { y: 0, opacity: 1, duration: 1.1, stagger: 0.09 },
      '-=0.85'
    );

  return tl;
}

const GLYPHS = '01<>/\\{}[]#$%&*+=~^|:;abcdefghijklmnopqrstuvwxyz';
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/**
 * Resolves `el` to `text` one character at a time, cycling random glyphs in
 * the not-yet-settled positions. Resolves when the word has fully landed.
 */
function scrambleTo(el: HTMLElement, text: string, duration = 900) {
  return new Promise<void>((resolve) => {
    const from = el.textContent ?? '';
    const length = Math.max(from.length, text.length);
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Characters settle left-to-right: each one gets its own threshold.
      const settled = progress * length * 1.35;

      let out = '';
      for (let i = 0; i < length; i++) {
        const char = text[i] ?? '';
        if (i < settled - 1) out += char;
        else if (i < settled) out += randomGlyph();
        else out += from[i] ? randomGlyph() : '';
      }
      el.textContent = out;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = text;
        resolve();
      }
    };

    requestAnimationFrame(tick);
  });
}

/** Cycles `el` through `phrases` forever, scrambling between each. */
export function cycleRoles(el: HTMLElement, phrases: readonly string[]) {
  if (prefersReducedMotion() || phrases.length === 0) {
    el.textContent = phrases[0] ?? '';
    return;
  }

  let index = 0;
  el.textContent = phrases[0];

  const next = async () => {
    index = (index + 1) % phrases.length;
    await scrambleTo(el, phrases[index]!);
    window.setTimeout(next, 3200);
  };

  window.setTimeout(next, 2600);
}

/**
 * Pulls an element a little toward the cursor while the pointer is near it,
 * and springs it back on the way out.
 */
export function makeMagnetic(el: HTMLElement, strength = 0.32) {
  if (prefersReducedMotion() || window.matchMedia('(hover: none)').matches) {
    return;
  }

  const moveX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
  const moveY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

  const onMove = (event: PointerEvent) => {
    const box = el.getBoundingClientRect();
    moveX((event.clientX - (box.left + box.width / 2)) * strength);
    moveY((event.clientY - (box.top + box.height / 2)) * strength);
  };

  const onLeave = () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.85, ease: 'elastic.out(1, 0.35)' });
  };

  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
}
