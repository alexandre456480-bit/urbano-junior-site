(() => {
  'use strict';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 820px)');
  const cameraMedia = matchMedia('(min-width: 821px) and (hover: hover) and (pointer: fine)');
  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const supported = 'animate' in Element.prototype;
  const active = new Map(), pending = new Map(), revealed = new WeakSet(), accordions = new Map();
  let observer, heroPlayed = false, cameraCleanup = () => {};

  function frames(type) {
    const distance = compact.matches ? 11 : 20;
    const still = {opacity: 1, transform: 'translate3d(0,0,0)'};
    switch (type) {
      case 'line': return [{transform: 'scaleX(0)', transformOrigin: 'left'}, {transform: 'scaleX(1)', transformOrigin: 'left'}];
      case 'horizontal': return [{opacity: .35, clipPath: 'inset(0 100% 0 0)'}, {opacity: 1, clipPath: 'inset(0 0 0 0)'}];
      case 'vertical': return [{opacity: .25, transform: `translate3d(0,${distance / 2}px,0)`, clipPath: 'inset(100% 0 0 0)'}, {...still, clipPath: 'inset(0 0 0 0)'}];
      case 'signature': return [{opacity: .3, clipPath: 'ellipse(25% 29% at 50% 55%)'}, {opacity: 1, clipPath: 'ellipse(90% 90% at 50% 50%)'}];
      case 'photo-up': return [{clipPath: 'inset(16% 0 0 0)'}, {clipPath: 'inset(0 0 0 0)'}];
      case 'photo-down': return [{clipPath: 'inset(0 0 16% 0)'}, {clipPath: 'inset(0 0 0 0)'}];
      case 'photo': return [{opacity: .4, clipPath: 'inset(10% 0 0 0)'}, {opacity: 1, clipPath: 'inset(0 0 0 0)'}];
      case 'quiet': return [{opacity: 0}, {opacity: 1}];
      case 'compose': return [{opacity: 0, transform: `translate3d(${compact.matches ? 4 : 8}px,${distance / 2}px,0)`}, still];
      case 'card': return [{opacity: 0, transform: `translate3d(0,${compact.matches ? 11 : 25}px,0)`}, still];
      default: return [{opacity: 0, transform: `translate3d(0,${distance}px,0)`}, still];
    }
  }
  function play(element, type = 'rise', delay = 0, duration = 900) {
    if (!element || !supported || preference.matches || document.hidden || element.matches(':focus-within')) return;
    const animation = element.animate(frames(type), {duration, delay, easing, fill: 'both'});
    if (!active.has(element)) active.set(element, new Set());
    active.get(element).add(animation);
    const release = () => { const set = active.get(element); set?.delete(animation); if (!set?.size) active.delete(element); };
    animation.finished.then(() => { release(); animation.cancel(); }, release);
  }
  function heading(element) {
    const lines = [...element.querySelectorAll('.motion-line')];
    if (!lines.length) return play(element, 'vertical', 0, 1050);
    lines.forEach((line, index) => play(line, line.matches('em') ? 'horizontal' : 'vertical', index * 150, 1050));
    element.querySelectorAll('.motion-accent:not(.motion-line)').forEach(accent => play(accent, 'quiet', 290, 950));
  }
  function reveal(element, immediate = false) {
    const callback = pending.get(element);
    if (!callback || revealed.has(element)) return;
    revealed.add(element); pending.delete(element); observer?.unobserve(element);
    if (!immediate) callback(element);
  }
  function watch(selector, callback) {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (revealed.has(element)) return;
      pending.set(element, target => callback(target, index)); observer.observe(element);
    });
  }
  function hero() {
    if (heroPlayed || preference.matches) return;
    heroPlayed = true;
    const lines = document.querySelectorAll('#hero-title .motion-line');
    play(lines[0], 'rise', 0, 900); play(lines[1], 'compose', 160, 950); play(lines[2], 'horizontal', 320, 1050);
    play(document.querySelector('.hero-description'), 'rise', 430, 850);
    play(document.querySelector('.hero-link'), 'quiet', 560, 750);
    play(document.querySelector('.hero-copy .button'), 'rise', 650, 800);
    // No loading gate: most of each photograph is visible from its first paint.
    document.querySelectorAll('.hero-slide.is-active .hero-photo-frame').forEach((frame, index) => play(frame, index ? 'photo-down' : 'photo-up', 0, index ? 1300 : 1150));
  }
  function startReveals() {
    if (preference.matches || !supported || !('IntersectionObserver' in window)) return;
    observer?.disconnect();
    observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); }), {threshold: 0, rootMargin: '0px 0px -24px 0px'});
    watch('main h2', heading);
    watch('.section-heading .eyebrow, .section-heading > p', element => play(element, 'quiet', 60, 900));
    watch('.service-item', (element, index) => {
      const delay = compact.matches ? 0 : index * 150;
      play(element, 'card', delay, 1000); play(element.querySelector('.service-image'), 'photo', delay + 80, 1100);
    });
    watch('.signature-composition', element => { play(element, 'signature', 0, 1350); play(element.querySelector('.signature-rule'), 'line', 220, 1050); });
    watch('.about-copy', element => {
      play(element.querySelector('.eyebrow'), 'quiet', 0, 800);
      play(element.querySelector('.sketch-line'), 'line', 30, 850); play(element.querySelector('.lead'), 'rise', 260, 800);
      element.querySelectorAll('p:not(.eyebrow):not(.lead)').forEach((text, index) => play(text, 'quiet', 380 + index * 100, 900));
      play(element.querySelector('.text-link'), 'rise', 580, 800);
    });
    watch('.process-grid li', (element, index) => {
      const delay = (compact.matches ? index % 2 : index) * 120;
      play(element.querySelector('.step-number'), 'quiet', delay, 650);
      play(element.querySelector('.step-number span'), 'line', delay + 160, 1150);
      play(element.querySelector('h3'), 'rise', delay + 140, 750); play(element.querySelector('p'), 'quiet', delay + 280, 800);
    });
    watch('.brands', element => play(element.querySelector('.brands-backdrop'), 'photo-down', 0, 1200));
    watch('.brands-image', element => play(element, 'photo', 0, 1200));
    watch('.brands-copy .eyebrow, .brands-copy > p:not(.eyebrow)', element => play(element, 'quiet', 90, 1000));
    watch('.brands-list li', (element, index) => { play(element, 'rise', index * 110, 800); play(element.querySelector('.brand-rule'), 'line', index * 110 + 130, 900); });
    watch('.brands-copy > .button', element => play(element, 'rise', 180, 750));
    watch('.faq-grid > div:first-child > p', element => play(element, 'quiet', 90, 850));
    watch('.faq-list details', (element, index) => play(element, 'quiet', (index % 3) * 90, 800));
    watch('.contact-copy > p, .contact-copy > .text-link', element => play(element, 'quiet', 170, 900));
    watch('.contact-form .field', (element, index) => play(element, 'rise', index * 120, 850));
    watch('.contact-form > .button', element => play(element, 'rise', 420, 750));
    watch('.footer-grid > div', (element, index) => play(element, 'quiet', index * 80, 850));
    hero();
  }
  function stopReveals() {
    observer?.disconnect(); pending.forEach((callback, element) => revealed.add(element)); pending.clear();
    active.forEach(set => set.forEach(animation => animation.cancel())); active.clear();
  }
  function setupCamera() {
    cameraCleanup();
    if (preference.matches || !cameraMedia.matches || !('IntersectionObserver' in window)) return;
    const items = [...document.querySelectorAll('.hero-photo-frame, .brands-image')], visible = new Set(), positions = new Map();
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
      if (element.matches('.hero-photo-frame')) { element.addEventListener('pointerenter', schedule); element.addEventListener('pointermove', onMove, {passive: true}); element.addEventListener('pointerleave', reset); }
    });
    window.addEventListener('scroll', schedule, {passive: true}); window.addEventListener('resize', schedule, {passive: true});
    // At most one update per scroll-event batch, limited to photographs in view.
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
  document.addEventListener('focusin', event => {
    active.forEach((set, element) => { if (element.contains(event.target)) set.forEach(animation => animation.cancel()); });
    pending.forEach((callback, element) => { if (element.contains(event.target)) reveal(element, true); });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { active.forEach(set => set.forEach(animation => animation.cancel())); active.clear(); accordions.forEach((state, details) => finishAccordion(details, state)); }
  });
  preference.addEventListener('change', event => {
    if (event.matches) { stopReveals(); accordions.forEach((state, details) => finishAccordion(details, state)); } else startReveals();
    setupCamera();
  });
  cameraMedia.addEventListener('change', setupCamera);
  window.addEventListener('resize', () => accordions.forEach((state, details) => { if (state.animation) finishAccordion(details, state); }), {passive: true});
  startReveals(); setupCamera();
})();
