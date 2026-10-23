(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#main-navigation');

  function closeMenu() {
    navigation.classList.remove('is-open');
    header.classList.remove('has-open-menu');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    const servicesToggle = navigation.querySelector('.services-toggle');
    const servicesSubmenu = navigation.querySelector('.services-submenu');
    if (servicesToggle && servicesSubmenu) {
      servicesToggle.setAttribute('aria-expanded', 'false');
      servicesToggle.setAttribute('aria-label', 'Expandir serviços');
      servicesSubmenu.hidden = true;
    }
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    if (!open) {
      closeMenu();
      return;
    }
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    navigation.classList.toggle('is-open', open);
    header.classList.toggle('has-open-menu', open);
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
  header.addEventListener('focusout', event => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) closeMenu();
  });
  const desktop = window.matchMedia('(min-width: 821px)');
  desktop.addEventListener('change', event => { if (event.matches) closeMenu(); });
  const sections = [...document.querySelectorAll('section[id]')];
  const updateHeader = () => {
    const scrollPos = window.scrollY;
    header.classList.toggle('is-scrolled', scrollPos > 12);
    const headerHeight = header.offsetHeight || 90;
    const probeY = scrollPos + headerHeight * 0.45;
    let currentId = 'inicio';
    for (const section of sections) {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (probeY >= top && probeY < bottom) {
        currentId = section.id;
        break;
      }
    }
    if (header.dataset.activeSection !== currentId) {
      header.dataset.activeSection = currentId;
    }
  };
  window.addEventListener('scroll', updateHeader, {passive: true});
  window.addEventListener('resize', updateHeader, {passive: true});
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
      if (!toggle) return;
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

    if (toggle) {
      toggle.hidden = false;
      toggle.addEventListener('click', () => {
        paused = !paused;
        updateToggle();
        start();
      });
    }
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
