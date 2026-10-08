document.querySelectorAll('.glass-button').forEach(button => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const label = button.querySelector('.glass-button__label');
    const originalText = label.textContent;
    // Keep the accessible button name stable throughout the animation.
    button.setAttribute('aria-label', originalText);
    label.setAttribute('aria-hidden', 'true');
    const characters = Array.from(originalText);
    const slots = characters.map(character => {
      const slot = document.createElement('span');
      slot.className = 'scramble-char';
      const base = document.createElement('span');
      base.className = 'scramble-char__base'; base.textContent = character;
      const fx = document.createElement('span');
      fx.className = 'scramble-char__fx';
      slot.append(base, fx);
      return { slot, fx, character };
    });
    label.replaceChildren(...slots.map(item => item.slot));
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const scrambleDuration = 850; // Total animation length in milliseconds.
    let scrambleFrame = 0;
    function resetScramble() {
      cancelAnimationFrame(scrambleFrame); scrambleFrame = 0;
      slots.forEach(({ slot, fx }) => {
        slot.classList.remove('is-scrambling'); fx.textContent = '';
      });
    }
    function scrambleText() {
      if (reducedMotion.matches || scrambleFrame) return;
      let start = null, lastTick = -1;
      function update(time) {
        if (start === null) start = time;
        const elapsed = time - start;
        if (elapsed >= scrambleDuration) { resetScramble(); return; }
        // Throttle glyph changes to avoid harsh frame-by-frame flicker.
        const tick = Math.floor(elapsed / 65);
        if (tick !== lastTick) {
          lastTick = tick;
          slots.forEach(({ slot, fx, character }, index) => {
            if (/\s/.test(character)) return;
            const delay = index / Math.max(1, slots.length - 1) * 470;
            const active = elapsed >= delay && elapsed < delay + 300;
            slot.classList.toggle('is-scrambling', active);
            if (active) fx.textContent = alphabet[Math.floor(Math.random() * alphabet.length)];
          });
        }
        scrambleFrame = requestAnimationFrame(update);
      }
      scrambleFrame = requestAnimationFrame(update);
    }
    button.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') scrambleText();
    });
    button.addEventListener('focus', () => {
      if (button.matches(':focus-visible')) scrambleText();
    });
    // Finish the short reveal even if the pointer leaves; never strand random text.
    reducedMotion.addEventListener('change', resetScramble);
    let x = 70, y = 35, targetX = 70, targetY = 35;
    let frame = 0, previousTime = 0;
    // Frame-rate-independent easing: the glow gently follows the pointer.
    function animateGlow(time) {
      const delta = previousTime ? Math.min(time - previousTime, 64) : 16.67;
      previousTime = time;
      const easing = 1 - Math.exp(-delta / 150);
      x += (targetX - x) * easing;
      y += (targetY - y) * easing;
      const settled = Math.abs(targetX - x) + Math.abs(targetY - y) < .03;
      if (settled) { x = targetX; y = targetY; }
      button.style.setProperty('--mx', `${x}%`);
      button.style.setProperty('--my', `${y}%`);
      if (!settled) frame = requestAnimationFrame(animateGlow);
      else { frame = 0; previousTime = 0; }
    }
    function moveGlow(nextX, nextY) {
      targetX = nextX; targetY = nextY;
      if (!frame) frame = requestAnimationFrame(animateGlow);
    }
    button.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch' || reducedMotion.matches) return;
      const rect = button.getBoundingClientRect();
      moveGlow(
        Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100)),
        Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100))
      );
    });
    button.addEventListener('pointerleave', () => {
      if (!reducedMotion.matches) moveGlow(70, 35);
    });
    reducedMotion.addEventListener('change', () => {
      cancelAnimationFrame(frame); frame = 0; previousTime = 0;
      x = targetX = 70; y = targetY = 35;
      button.style.removeProperty('--mx'); button.style.removeProperty('--my');
    });
    button.addEventListener('click', event => {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple'; ripple.setAttribute('aria-hidden', 'true');
      const size = Math.hypot(rect.width, rect.height) * 2;
      Object.assign(ripple.style, {
        width: `${size}px`, height: `${size}px`,
        left: `${event.detail === 0 ? rect.width / 2 : event.clientX - rect.left}px`,
        top: `${event.detail === 0 ? rect.height / 2 : event.clientY - rect.top}px`
      });
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
      // Add your download URL or click action here.
      // window.location.href = 'your-download-url';
    });
  });