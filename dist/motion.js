(() => {
  'use strict';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 820px)');
  const cameraMedia = matchMedia('(min-width: 821px) and (hover: hover) and (pointer: fine)');
  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const elegantEasing = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const supported = 'animate' in Element.prototype;
  const active = new Map(), pending = new Map(), revealed = new WeakSet(), accordions = new Map();
  let observer, heroPlayed = false, cameraCleanup = () => {};

  /* ---------- Keyframes ---------- */
  function frames(type) {
    const distance = compact.matches ? 16 : 28;
    const still = {opacity: 1, transform: 'translate3d(0,0,0)'};
    switch (type) {
      case 'line':
        return [{transform: 'scaleX(0)', transformOrigin: 'left'}, {transform: 'scaleX(1)', transformOrigin: 'left'}];
      case 'horizontal':
        return [{opacity: 0, clipPath: 'inset(0 100% 0 0)'}, {opacity: 1, clipPath: 'inset(0 0 0 0)'}];
      case 'vertical':
        return [{opacity: 0, transform: `translate3d(0,${distance * 0.6}px,0)`, clipPath: 'inset(100% 0 0 0)'}, {...still, clipPath: 'inset(0 0 0 0)'}];
      case 'signature':
        return [{opacity: 0, clipPath: 'ellipse(25% 29% at 50% 55%)'}, {opacity: 1, clipPath: 'ellipse(90% 90% at 50% 50%)'}];
      case 'photo-up':
        return [{clipPath: 'inset(16% 0 0 0)'}, {clipPath: 'inset(0 0 0 0)'}];
      case 'photo-down':
        return [{clipPath: 'inset(0 0 16% 0)'}, {clipPath: 'inset(0 0 0 0)'}];
      case 'photo':
        return [{opacity: 0, clipPath: 'inset(8% 0 0 0)'}, {opacity: 1, clipPath: 'inset(0 0 0 0)'}];
      case 'quiet':
        return [{opacity: 0}, {opacity: 1}];
      case 'fade-up':
        return [{opacity: 0, transform: `translate3d(0,${distance}px,0)`}, still];
      case 'fade-left':
        return [{opacity: 0, transform: `translate3d(${compact.matches ? 16 : 32}px,0,0)`}, still];
      case 'fade-right':
        return [{opacity: 0, transform: `translate3d(-${compact.matches ? 16 : 32}px,0,0)`}, still];
      case 'scale-in':
        return [{opacity: 0, transform: 'scale(0.95) translate3d(0,14px,0)'}, {...still, transform: 'scale(1) translate3d(0,0,0)'}];
      case 'compose':
        return [{opacity: 0, transform: `translate3d(${compact.matches ? 4 : 8}px,${distance * 0.4}px,0)`}, still];
      case 'stagger-card':
        return [{opacity: 0, transform: `translate3d(0,${compact.matches ? 14 : 24}px,0)`}, still];
      case 'contact-row':
        return [{opacity: 0, transform: `translate3d(${compact.matches ? 10 : 20}px,0,0)`}, still];
      default:
        return [{opacity: 0, transform: `translate3d(0,${distance}px,0)`}, still];
    }
  }

  /* ---------- Play animation (once only, permanent finish) ---------- */
  function play(element, type = 'rise', delay = 0, duration = 850) {
    if (!element || !supported || preference.matches || element.matches(':focus-within')) {
      if (element) {
        element.style.opacity = '1';
        element.style.transform = 'none';
        element.style.clipPath = 'none';
      }
      return;
    }

    // Use fill: 'both' so the element stays at keyframe 0 during any delay, and at final keyframe after finish
    const animation = element.animate(frames(type), {
      duration,
      delay,
      easing: type === 'scale-in' || type === 'stagger-card' ? elegantEasing : easing,
      fill: 'both'
    });

    if (!active.has(element)) active.set(element, new Set());
    active.get(element).add(animation);

    const onFinish = () => {
      // Solidify final styles permanently on inline style
      element.style.opacity = '1';
      element.style.transform = 'none';
      element.style.clipPath = 'none';
      element.dataset.revealed = 'true';
      const set = active.get(element);
      set?.delete(animation);
      if (!set?.size) active.delete(element);
    };

    animation.finished.then(onFinish).catch(onFinish);
  }

  /* ---------- Pre-hide elements that are below the viewport ---------- */
  function preHide(element, type) {
    if (!element || !supported || preference.matches) return;
    const kf = frames(type);
    if (kf[0]) {
      if (kf[0].opacity !== undefined) element.style.opacity = String(kf[0].opacity);
      if (kf[0].transform !== undefined) element.style.transform = String(kf[0].transform);
      if (kf[0].clipPath !== undefined) element.style.clipPath = String(kf[0].clipPath);
      if (kf[0].transformOrigin !== undefined) element.style.transformOrigin = String(kf[0].transformOrigin);
    }
  }

  function heading(element) {
    const lines = [...element.querySelectorAll('.motion-line')];
    if (!lines.length) return play(element, 'vertical', 0, 1000);
    lines.forEach((line, index) => play(line, line.matches('em') ? 'horizontal' : 'vertical', index * 140, 1000));
    element.querySelectorAll('.motion-accent:not(.motion-line)').forEach(accent => play(accent, 'quiet', 280, 900));
  }

  function reveal(element) {
    if (revealed.has(element)) return;
    revealed.add(element);
    observer?.unobserve(element);
    const callback = pending.get(element);
    pending.delete(element);
    if (callback) callback(element);
  }

  function watch(selector, callback, hideType) {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (revealed.has(element) || element.dataset.revealed === 'true') return;

      const rect = element.getBoundingClientRect();
      // If the element is already comfortably in or above the viewport on initial load, reveal immediately
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        revealed.add(element);
        callback(element, index);
        return;
      }

      // Pre-hide so it is guaranteed invisible before the user scrolls to it
      if (hideType) preHide(element, hideType);
      pending.set(element, target => callback(target, index));
      observer.observe(element);
    });
  }

  function hero() {
    if (heroPlayed || preference.matches) return;
    heroPlayed = true;
    const lines = document.querySelectorAll('#hero-title .motion-line');
    if (lines.length) {
      play(lines[0], 'fade-up', 80, 950);
      if (lines[1]) play(lines[1], 'compose', 220, 1000);
      if (lines[2]) play(lines[2], 'horizontal', 380, 1050);
    }
    play(document.querySelector('.hero-description'), 'fade-up', 500, 900);
    play(document.querySelector('.hero-copy .button'), 'fade-up', 700, 850);
    document.querySelectorAll('.hero-slide.is-active .hero-photo-frame').forEach((frame, index) =>
      play(frame, index ? 'photo-down' : 'photo-up', 180, index ? 1300 : 1150)
    );
  }

  function startReveals() {
    if (preference.matches || !supported || !('IntersectionObserver' in window)) {
      document.querySelectorAll('main, section, article, div, p, h2, h3, a, li, img').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.clipPath = 'none';
      });
      return;
    }

    observer?.disconnect();
    // rootMargin 40px ensures animation starts just as element approaches viewport, preventing any blink/gap
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) reveal(entry.target);
      });
    }, {threshold: 0.05, rootMargin: '0px 0px 40px 0px'});

    /* --- Section headings --- */
    watch('.section-heading h2', heading, 'fade-up');
    watch('.section-heading .eyebrow, .section-heading > p', element => play(element, 'fade-up', 80, 850), 'fade-up');

    /* --- Services: entire card enters smoothly together without internal image blinks --- */
    watch('.service-item', (element, index) => {
      const delay = compact.matches ? index * 80 : index * 140;
      play(element, 'stagger-card', delay, 950);
    }, 'stagger-card');

    /* --- About / Estilista: exibe todo o bloco de textos, título e link de forma fluida --- */
    watch('.about-copy', element => {
      play(element, 'fade-up', 0, 900);
    }, 'fade-up');

    /* --- Atelier composition --- */
    watch('.atelier-composition', element => {
      play(element, 'scale-in', 60, 1100);
    }, 'scale-in');

    /* Portfolio card visibility and transitions are managed by home.js pagination. */

    /* --- Portfolio filters and CTA --- */
    watch('.portfolio-filters', element => play(element, 'fade-up', 0, 800), 'fade-up');
    watch('.portfolio-end', element => play(element, 'fade-up', 120, 800), 'fade-up');

    /* --- Process steps: sequential cascade --- */
    watch('.process-grid li', (element, index) => {
      const delay = index * 150;
      play(element, 'stagger-card', delay, 900);
      const stepNumberSpan = element.querySelector('.step-number span');
      if (stepNumberSpan) play(stepNumberSpan, 'line', delay + 180, 900);
    }, 'stagger-card');

    watch('.process-cta', element => play(element, 'fade-up', 250, 850), 'fade-up');

    /* --- Contact section --- */
    watch('.studio-location', element => play(element, 'scale-in', 0, 1000), 'scale-in');
    watch('.contact-row', (element, index) => {
      play(element, 'contact-row', index * 90, 800);
    }, 'contact-row');
    watch('.contact-options > .button', element => play(element, 'fade-up', 360, 800), 'fade-up');

    /* --- Footer --- */
    watch('.footer-grid > div', (element, index) => play(element, 'fade-up', index * 80, 800), 'fade-up');

    /* --- Shape dividers --- */
    watch('.shape-divider', element => play(element, 'quiet', 0, 1000), 'quiet');

    hero();
  }

  function stopReveals() {
    observer?.disconnect();
    pending.forEach((callback, element) => {
      revealed.add(element);
      element.style.opacity = '1';
      element.style.transform = 'none';
      element.style.clipPath = 'none';
    });
    pending.clear();
    active.clear();
  }

  function setupCamera() {
    cameraCleanup();
    if (preference.matches || !cameraMedia.matches || !('IntersectionObserver' in window)) return;
    const items = [...document.querySelectorAll('.hero-photo-frame')], visible = new Set(), positions = new Map();
    let frame = 0;
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    function update() {
      frame = 0; if (document.hidden) return;
      const measurements = [...visible].filter(element => { const slide = element.closest('.hero-slide'); return !slide || slide.classList.contains('is-active'); }).map(element => ({element, rect: element.getBoundingClientRect()}));
      measurements.forEach(({element, rect}) => {
        positions.set(element, rect);
        const progress = Math.max(-1, Math.min(1, (innerHeight / 2 - rect.top - rect.height / 2) / ((innerHeight + rect.height) / 2)));
        element.style.setProperty('--camera-scroll', `${(progress * 6).toFixed(2)}px`);
      });
    }
    const onMove = event => {
      const rect = positions.get(event.currentTarget); if (!rect) return;
      const x = Math.max(-2, Math.min(2, ((event.clientX - rect.left) / rect.width - .5) * 4));
      const y = Math.max(-2, Math.min(2, ((event.clientY - rect.top) / rect.height - .5) * 4));
      event.currentTarget.style.setProperty('--camera-x', `${x.toFixed(2)}px`); event.currentTarget.style.setProperty('--camera-y', `${y.toFixed(2)}px`);
    };
    const reset = event => { event.currentTarget.style.removeProperty('--camera-x'); event.currentTarget.style.removeProperty('--camera-y'); };
    const visibility = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target); }); schedule(); });
    items.forEach(element => {
      element.classList.add('camera-frame'); visibility.observe(element);
      element.addEventListener('pointerenter', schedule); element.addEventListener('pointermove', onMove, {passive: true}); element.addEventListener('pointerleave', reset);
    });
    window.addEventListener('scroll', schedule, {passive: true}); window.addEventListener('resize', schedule, {passive: true});
    cameraCleanup = () => {
      visibility.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      items.forEach(element => {
        element.classList.remove('camera-frame'); ['--camera-scroll', '--camera-x', '--camera-y'].forEach(name => element.style.removeProperty(name));
        element.removeEventListener('pointerenter', schedule); element.removeEventListener('pointermove', onMove); element.removeEventListener('pointerleave', reset);
      }); visible.clear();
    };
  }

  function finishAccordion(details, state) {
    state.animation?.cancel(); state.animation = null; details.open = state.targetOpen; details.classList.remove('is-closing');
    state.answer.inert = !state.targetOpen; state.answer.setAttribute('aria-hidden', String(!state.targetOpen)); state.summary.setAttribute('aria-expanded', String(state.targetOpen));
  }
  document.querySelectorAll('.faq-list details').forEach(details => {
    const summary = details.querySelector('summary'), answer = details.querySelector('.faq-answer'); if (!answer || !supported) return;
    const state = {summary, answer, targetOpen: details.open, animation: null}; accordions.set(details, state); finishAccordion(details, state);
    summary.addEventListener('click', event => {
      event.preventDefault();
      const from = details.open ? answer.getBoundingClientRect().height : 0, fromOpacity = details.open ? Number(getComputedStyle(answer).opacity) : 0;
      state.targetOpen = !state.targetOpen; state.animation?.cancel(); state.animation = null;
      if (preference.matches) return finishAccordion(details, state);
      details.open = true; details.classList.toggle('is-closing', !state.targetOpen); summary.setAttribute('aria-expanded', String(state.targetOpen));
      answer.inert = !state.targetOpen; answer.setAttribute('aria-hidden', String(!state.targetOpen));
      const to = state.targetOpen ? answer.scrollHeight : 0;
      const animation = answer.animate([{height: `${from}px`, opacity: fromOpacity}, {height: `${to}px`, opacity: state.targetOpen ? 1 : 0}], {duration: 430, easing, fill: 'both'});
      state.animation = animation; animation.finished.then(() => { if (state.animation === animation) finishAccordion(details, state); }, () => {});
    });
  });

  preference.addEventListener('change', event => {
    if (event.matches) { stopReveals(); accordions.forEach((state, details) => finishAccordion(details, state)); } else startReveals();
    setupCamera();
  });
  cameraMedia.addEventListener('change', setupCamera);
  window.addEventListener('resize', () => accordions.forEach((state, details) => { if (state.animation) finishAccordion(details, state); }), {passive: true});

  // Start execution immediately
  startReveals();
  setupCamera();
})();
