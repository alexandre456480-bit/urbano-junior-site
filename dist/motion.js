(() => {
  'use strict';

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || !('animate' in Element.prototype)) return;

  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const active = new Map();
  const pending = new Map();
  const revealed = new WeakSet();
  let observer;

  const frames = {
    rise: [
      {opacity: 0, transform: 'translate3d(0, 22px, 0)'},
      {opacity: 1, transform: 'translate3d(0, 0, 0)'}
    ],
    veil: [
      {opacity: 0, transform: 'translate3d(0, 14px, 0)', clipPath: 'inset(0 0 28% 0)'},
      {opacity: 1, transform: 'translate3d(0, 0, 0)', clipPath: 'inset(0 0 0 0)'}
    ],
    photograph: [
      {opacity: 0, transform: 'translate3d(0, 24px, 0) scale(1.025)', clipPath: 'inset(9% 0 0 0)'},
      {opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)', clipPath: 'inset(0 0 0 0)'}
    ],
    signature: [
      {opacity: 0, transform: 'translate3d(-16px, 12px, 0)', clipPath: 'inset(0 12% 0 0)'},
      {opacity: 1, transform: 'translate3d(0, 0, 0)', clipPath: 'inset(0 0 0 0)'}
    ],
    quiet: [{opacity: 0}, {opacity: 1}]
  };

  function play(element, type = 'rise', delay = 0, duration = 1050) {
    if (!element || preference.matches || document.hidden || element.matches(':focus-within')) return;
    active.get(element)?.cancel();
    const animation = element.animate(frames[type], {duration, delay, easing, fill: 'both'});
    active.set(element, animation);
    const release = () => {
      if (active.get(element) === animation) active.delete(element);
      animation.cancel();
    };
    animation.finished.then(release, () => {
      if (active.get(element) === animation) active.delete(element);
    });
  }

  function reveal(element, immediate = false) {
    const options = pending.get(element);
    if (!options || revealed.has(element)) return;
    revealed.add(element);
    pending.delete(element);
    observer?.unobserve(element);
    if (!immediate) play(element, options.type, options.delay, options.duration);
    if (!immediate && element.matches('.process-grid li')) {
      const rule = element.querySelector('.step-number span');
      if (rule && !preference.matches) {
        const animation = rule.animate(
          [{transform: 'scaleX(0)', transformOrigin: 'left'}, {transform: 'scaleX(1)', transformOrigin: 'left'}],
          {duration: 1000, delay: options.delay + 160, easing, fill: 'backwards'}
        );
        active.set(rule, animation);
        animation.finished.then(() => { active.delete(rule); animation.cancel(); }, () => active.delete(rule));
      }
    }
  }

  function watch(selector, type, stagger = 0, duration = 1050) {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (revealed.has(element)) return;
      pending.set(element, {type, delay: (index % 4) * stagger, duration});
      observer.observe(element);
    });
  }

  function start() {
    if (preference.matches) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
    }, {threshold: 0, rootMargin: '0px 0px -36px 0px'});

    watch('.section-heading > div', 'veil', 0, 1150);
    watch('.section-heading > p', 'quiet', 0, 1250);
    watch('.service-item', 'photograph', 100, 1200);
    watch('.signature-composition', 'signature', 0, 1400);
    watch('.about-copy', 'veil', 0, 1150);
    watch('.process-grid li', 'rise', 90, 1100);
    watch('.brands-image', 'photograph', 0, 1350);
    watch('.brands-copy', 'veil', 0, 1200);
    watch('.faq-grid > div:first-child', 'veil', 0, 1150);
    watch('.faq-list details', 'rise', 55, 900);
    watch('.contact-copy', 'veil', 0, 1150);
    watch('.contact-form', 'rise', 0, 1150);
    watch('.footer-grid > div', 'quiet', 75, 1050);

    // The hero opens once; the carousel keeps its independent five-second rhythm.
    play(document.querySelector('.site-header .brand'), 'quiet', 0, 900);
    play(document.querySelector('.hero h1'), 'veil', 90, 1250);
    play(document.querySelector('.hero-description'), 'rise', 260, 1100);
    play(document.querySelector('.hero-copy .button'), 'rise', 380, 1050);
    play(document.querySelector('.hero-link'), 'quiet', 520, 1000);
    play(document.querySelector('.hero-visual'), 'photograph', 130, 1450);
  }

  function finish() {
    observer?.disconnect();
    pending.forEach((options, element) => revealed.add(element));
    pending.clear();
    active.forEach(animation => animation.cancel());
    active.clear();
  }

  // Focused controls and anchor destinations are always immediately available.
  document.addEventListener('focusin', event => {
    active.forEach((animation, element) => {
      if (element.contains(event.target)) animation.cancel();
    });
    pending.forEach((options, element) => {
      if (element.contains(event.target)) reveal(element, true);
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      active.forEach(animation => animation.cancel());
      active.clear();
    }
  });
  preference.addEventListener('change', event => {
    if (event.matches) finish();
    else start();
  });
  start();
})();
