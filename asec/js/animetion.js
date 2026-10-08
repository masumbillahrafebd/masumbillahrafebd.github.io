// For Smooth scrolling effect
const lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
    smoothTouch: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);




// For banner image shutter animation
const shutterImages = document.querySelectorAll('.banner-image-box');

if (shutterImages.length) {
  const shutterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    },
    { threshold: 0.2 }
  );

  shutterImages.forEach((image) => shutterObserver.observe(image));
}


// For Card scrolling logic
(() => {
  'use strict';

  const scene = document.querySelector('.scroll-scene');
  const stage = document.querySelector('.stage');
  const cards = [...document.querySelectorAll('.card')];
  const progress = document.querySelector('.progress');
  const hint = document.querySelector('.scroll-hint');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const replayButton = document.querySelector('#replay');

  if (!scene || !stage || !progress || !hint || !cards.length) {
    return;
  }

  const clamp = (x) => Math.max(0, Math.min(1, x));
  const range = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (x) => x * x * (3 - 2 * x);
  const mix = (a, b, t) => a + (b - a) * t;

  // Deterministic variation: the same letters follow the same paths on replay.
  const random = (n) => {
    const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
  };

  const letters = [];

  document.querySelectorAll('[data-text]').forEach((line, row) => {
    [...line.dataset.text].forEach((character, index) => {
      const span = document.createElement('span');
      span.className = character === ' ' ? 'letter space' : 'letter';
      span.textContent = character;
      line.append(span);

      const seed = letters.length + 1;
      letters.push({
        el: span,
        row,
        index,
        seed,
        threshold: random(seed) * 0.225
      });
    });
  });

  let sceneTop = 0;
  let distance = 1;
  let width = innerWidth;
  let height = innerHeight;
  let pending = false;

  function measure() {
    sceneTop = scene.getBoundingClientRect().top + scrollY;
    width = stage.clientWidth;
    height = stage.clientHeight;
    distance = Math.max(1, scene.offsetHeight - height);
    schedule();
  }

  function draw() {
    pending = false;

    const p = clamp((scrollY - sceneTop) / distance);
    progress.style.transform = `scaleX(${p})`;

    if (reduced.matches) return;

    const scatter = ease(range(p, 0.3, 0.445));

    letters.forEach(({ el, row, index, seed, threshold }) => {
      const reveal = ease(range(p, threshold, threshold + 0.035));
      const dx = (index - 8.5) * width * 0.036 * scatter;
      const dy =
        ((row ? 1 : -1) * height * 0.13 + (random(seed + 90) - 0.5) * height * 0.8) *
        scatter;
      const rotate = (random(seed + 31) - 0.5) * 140 * scatter;

      el.style.opacity = String(reveal * (1 - ease(range(p, 0.39, 0.455))));
      // Animate width too: missing letters close up, matching the reference.
      el.style.maxWidth = `${reveal * 1.2}em`;
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rotate}deg)`;
    });

    const arrivals = [0.335, 0.49, 0.635, 0.78];
    const amounts = arrivals.map((a) => ease(range(p, a, a + 0.11)));
    const count = amounts.reduce((a, b) => a + b, 0);
    const cardWidth = cards[0].offsetWidth;

    // Keep all four cards within narrow screens, with increased overlap.
    const step = Math.min(cardWidth * 0.65, (width - cardWidth - 35) / 3);

    cards.forEach((card, i) => {
      const t = amounts[i];
      const centre = (Math.max(1, count) - 1) / 2;
      const x = (i - centre) * step;
      const rotation = (i - centre) * 7;
      const y = mix(height * 0.85, Math.abs(i - centre) * 8, t);

      card.style.opacity = String(clamp(t * 5));
      card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${mix(12, rotation, t)}deg) scale(${mix(0.86, 1, t)})`;
    });

    hint.style.opacity = String(1 - range(p, 0.025, 0.1));
  }

  function schedule() {
    if (!pending) {
      pending = true;
      requestAnimationFrame(draw);
    }
  }

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure);
  reduced.addEventListener('change', measure);

  if (replayButton) {
    replayButton.addEventListener('click', () => {
      scrollTo({ top: sceneTop, behavior: 'instant' });
    });
  }

  measure();
})();

document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('mousemove', ({ clientX, clientY }) => {
    const { left, top } = card.getBoundingClientRect();
    card.style.setProperty('--x', `${clientX - left}px`);
    card.style.setProperty('--y', `${clientY - top}px`);
  });
});



// 

 /* Video-matched scroll scrub. No libraries, wheel hijacking, timers, or network requests.
The section stays in normal document flow. Its top position controls its color.
Tweak START/END to change the transition distance;
RESPONSE controls settling.
Image data is embedded below in the HTML, extracted from the supplied recording. */
(() => {
  'use strict';

  const panel = document.querySelector('.projects');
  const marquee = document.querySelector('.marquee span');
  const explore = document.querySelector('.explore');

  // Section না থাকলে এই animation চালাবে না।
  if (!panel) return;

  const START = 0.70;
  const END = 0.04;
  const RESPONSE = 90;

  const dark = [28, 34, 35];
  const light = [233, 236, 232];

  const reduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  let progress = 0;
  let target = 0;
  let raf = 0;
  let last = 0;

  const clamp = (value) => Math.max(0, Math.min(1, value));

  function measure() {
    const viewportHeight = Math.max(1, window.innerHeight);
    const panelTop = panel.getBoundingClientRect().top;

    target = clamp(
      (viewportHeight * START - panelTop) /
      (viewportHeight * (START - END))
    );
  }

  function render() {
    const color = dark.map((value, index) =>
      Math.round(value + (light[index] - value) * progress)
    );

    panel.style.setProperty(
      '--panel',
      `rgb(${color.join(',')})`
    );

    const ink = Math.round(255 * (1 - progress));

    panel.style.setProperty(
      '--ink',
      `rgb(${ink}, ${ink}, ${ink})`
    );

    // Marquee থাকলেই সেটি update হবে।
    if (marquee) {
      marquee.style.transform = reduced.matches
        ? 'none'
        : `translateX(${-window.scrollY * 0.18}px)`;
    }
  }

  function tick(now) {
    raf = 0;

    const dt = Math.min(64, now - last || 16.7);
    last = now;

    measure();

    const smoothing = reduced.matches
      ? 1
      : 1 - Math.exp(-dt / RESPONSE);

    progress += (target - progress) * smoothing;

    if (Math.abs(target - progress) < 0.0005) {
      progress = target;
    }

    render();

    if (progress !== target) {
      raf = requestAnimationFrame(tick);
    }
  }

  function request() {
    if (raf) return;

    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  window.addEventListener('pageshow', request);
  window.addEventListener('load', request, { once: true });

  reduced.addEventListener('change', request);

  // Button থাকলেই click listener যোগ হবে।
  explore?.addEventListener('click', () => {
    panel.scrollIntoView({
      behavior: reduced.matches ? 'instant' : 'smooth',
      block: 'start'
    });
  });

  measure();
  progress = target;
  render();
})();


