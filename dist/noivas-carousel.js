(() => {
  document.querySelectorAll('[data-bridal-carousel]').forEach(carousel => {
    const track = carousel.querySelector('.bridal-carousel-track');
    const slides = [...track.children];
    const controls = carousel.querySelector('.bridal-carousel-controls');
    const previous = controls.querySelector('[data-previous]');
    const next = controls.querySelector('[data-next]');
    const status = carousel.querySelector('[role="status"]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let scrollTimer;

    function update() {
      const max = track.scrollWidth - track.clientWidth;
      previous.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
      const index = slides.reduce((closest, slide, i) =>
        Math.abs(slide.offsetLeft - track.scrollLeft) < Math.abs(slides[closest].offsetLeft - track.scrollLeft) ? i : closest, 0);
      status.textContent = `Posição ${index + 1} de ${slides.length}`;
    }

    function move(direction) {
      const positions = slides.map(slide => slide.offsetLeft);
      const current = track.scrollLeft;
      const target = direction > 0
        ? positions.find(position => position > current + 2) ?? track.scrollWidth
        : positions.slice().reverse().find(position => position < current - 2) ?? 0;
      track.scrollTo({ left: target, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }

    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        move(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(update, 120);
    }, { passive: true });
    new ResizeObserver(update).observe(track);
    controls.hidden = false;
    update();
  });
})();
