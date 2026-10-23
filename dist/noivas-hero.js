(() => {
  const hero = document.querySelector('.bridal-hero');
  if (!hero) return;

  const desktopMotion = window.matchMedia('(min-width: 821px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let frame = 0;

  function update() {
    frame = 0;
    if (!desktopMotion.matches) return;
    const bounds = hero.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
    const offset = Math.min(Math.max(0, window.scrollY) * 0.22, bounds.height * 0.24);
    hero.style.setProperty('--hero-scroll-offset', `${offset}px`);
  }

  function schedule() {
    if (desktopMotion.matches && !frame) frame = requestAnimationFrame(update);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    hero.classList.toggle('is-parallax', desktopMotion.matches);
    if (desktopMotion.matches) schedule();
    else hero.style.removeProperty('--hero-scroll-offset');
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  desktopMotion.addEventListener('change', sync);
  sync();
})();
