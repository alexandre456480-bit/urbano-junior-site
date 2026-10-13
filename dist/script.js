(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#main-navigation');

  function closeMenu() {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    navigation.classList.toggle('is-open', open);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) closeMenu();
  });
  const desktop = window.matchMedia('(min-width: 821px)');
  desktop.addEventListener('change', event => { if (event.matches) closeMenu(); });
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  window.addEventListener('scroll', updateHeader, {passive: true});
  updateHeader();

  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = [...carousel.querySelectorAll('.hero-slide')];
    const toggle = carousel.querySelector('.carousel-toggle');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let paused = reducedMotion.matches;
    let timer = null;

    const updateToggle = () => {
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', paused ? 'Retomar carrossel' : 'Pausar carrossel');
      toggle.classList.toggle('is-paused', paused);
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = null;
    };
    const start = () => {
      stop();
      if (paused || document.hidden || slides.length < 2) return;
      timer = window.setInterval(() => {
        slides[current].classList.remove('is-active');
        slides[current].setAttribute('aria-hidden', 'true');
        current = (current + 1) % slides.length;
        slides[current].classList.add('is-active');
        slides[current].setAttribute('aria-hidden', 'false');
      }, 5000);
    };

    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      paused = !paused;
      updateToggle();
      start();
    });
    document.addEventListener('visibilitychange', start);
    reducedMotion.addEventListener('change', event => {
      paused = event.matches;
      updateToggle();
      start();
    });
    // Warm the remaining photographs without changing their layout or duplicating requests.
    slides.slice(1).forEach(slide => slide.querySelectorAll('img').forEach(image => {
      image.loading = 'eager';
    }));
    updateToggle();
    start();
  }

  document.querySelector('#year').textContent = String(new Date().getFullYear());
})();
