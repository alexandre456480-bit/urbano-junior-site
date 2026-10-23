(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  let observer;

  function reveal() {
    observer?.disconnect();
    revealItems.forEach(item => item.classList.remove('reveal-pending'));
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -25px 0px' });
    revealItems.forEach(item => {
      // Keep the first screen visible; animate the content as it enters below it.
      if (item.getBoundingClientRect().top < innerHeight - 30) return;
      item.classList.add('reveal-pending');
      observer.observe(item);
    });
  }
  reveal();
  reducedMotion.addEventListener('change', reveal);
  document.addEventListener('focusin', event => {
    event.target.closest('.reveal-pending')?.classList.remove('reveal-pending');
  });

  document.querySelectorAll('[data-about-slider]').forEach(slider => {
    const track = slider.querySelector('[data-track]');
    const items = [...track.children];
    const controls = slider.querySelector('.about-slider-controls');
    const previous = controls.querySelector('[data-prev]');
    const next = controls.querySelector('[data-next]');
    const counter = controls.querySelector('[data-current]');
    const centered = slider.dataset.aboutSlider === 'sketches';
    let active = 0;
    let frame = 0;

    function position(item) {
      return centered ? item.offsetLeft - (track.clientWidth - item.offsetWidth) / 2 : item.offsetLeft;
    }
    function update() {
      frame = 0;
      const scroll = track.scrollLeft;
      active = items.reduce((nearest, item, index) =>
        Math.abs(position(item) - scroll) < Math.abs(position(items[nearest]) - scroll) ? index : nearest, 0);
      items.forEach((item, index) => item.classList.toggle('is-active', index === active));
      counter.textContent = String(active + 1).padStart(2, '0');
      previous.disabled = scroll <= 2;
      next.disabled = scroll >= track.scrollWidth - track.clientWidth - 2;
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    function move(direction) {
      const target = Math.max(0, Math.min(items.length - 1, active + direction));
      track.scrollTo({ left: position(items[target]), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', schedule, { passive: true });
    track.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        move(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    track.querySelectorAll('img').forEach(image => image.addEventListener('load', schedule, { once: true }));
    if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(track);
    else window.addEventListener('resize', schedule, { passive: true });
    controls.hidden = false;
    update();
  });

  // Use the original file link as the fallback when dialog support is absent.
  const dialog = document.querySelector('#about-image-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const dialogImage = dialog.querySelector('img');
  const closeButton = dialog.querySelector('button');
  let opener;
  document.querySelectorAll('[data-artwork-link]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      dialogImage.src = link.href;
      dialogImage.alt = link.querySelector('img').alt;
      dialog.showModal();
      document.body.classList.add('about-dialog-open');
      closeButton.focus();
    });
  });
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('about-dialog-open');
    dialogImage.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  });
})();
