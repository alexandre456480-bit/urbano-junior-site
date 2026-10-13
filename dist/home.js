(() => {
  'use strict';
  const filters = [...document.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('.portfolio-item')];
  const status = document.querySelector('#portfolio-status');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  function filterProjects(category) {
    filters.forEach(button => {
      const selected = button.dataset.filter === category;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    projects.forEach(item => { item.hidden = category !== 'todos' && item.dataset.category !== category; });
    const visible = projects.filter(item => !item.hidden);
    const label = filters.find(button => button.dataset.filter === category)?.textContent.toLocaleLowerCase('pt-BR');
    status.textContent = `${visible.length} ${visible.length === 1 ? 'referência' : 'referências'} em ${label}.`;
    if (!reduce.matches) visible.forEach((item, index) => item.animate([{opacity: .4}, {opacity: 1}], {duration: 420, delay: index * 45, easing: 'ease', fill: 'none'}));
  }
  filters.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
  document.querySelectorAll('[data-service-filter]').forEach(link => link.addEventListener('click', () => filterProjects(link.dataset.serviceFilter)));

  const dialog = document.querySelector('#project-dialog');
  let homeData;
  let opener;
  const content = fetch('content/home.json').then(response => {
    if (!response.ok) throw new Error('Home content unavailable');
    return response.json();
  }).then(value => { homeData = value; return value; }).catch(() => null);

  document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', async event => {
    event.preventDefault();
    await content;
    const project = homeData?.projects.find(item => item.id === button.dataset.project);
    const item = button.closest('.portfolio-item');
    const image = button.querySelector('img');
    // Static HTML provides an accessible fallback if the content request fails.
    document.querySelector('#project-dialog-image').src = project?.src || image.getAttribute('src');
    document.querySelector('#project-dialog-image').alt = project?.alt || image.alt;
    document.querySelector('#project-dialog-title').textContent = project?.title || button.querySelector('h3').textContent;
    document.querySelector('#project-dialog-category').textContent = project?.categoryLabel || button.querySelector('.project-category').textContent;
    document.querySelector('#project-dialog-description').textContent = project?.description || 'Uma referência ilustrativa de forma, tecido e criação.';
    const category = project?.categoryLabel || item.dataset.category;
    document.querySelector('#project-dialog-contact').href = `${homeData?.contact.whatsapp || 'https://wa.me/5562981647663'}?text=${encodeURIComponent(`Olá, Urbano Junior! Gostaria de conversar sobre uma criação: ${category}.`)}`;
    opener = button;
    dialog.showModal();
    document.body.classList.add('has-dialog');
  }));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { document.body.classList.remove('has-dialog'); opener?.focus({preventScroll: true}); });

  const carousel = document.querySelector('.atelier-carousel');
  const track = carousel.querySelector('.arc-track');
  const photos = [...track.children];
  const toggle = document.querySelector('.arc-toggle');
  const desktop = matchMedia('(min-width: 821px)');
  let phase = 0, frame = 0, last = 0, visible = false, dragging = false, hovered = false, focused = false;
  let paused = reduce.matches, lastX = 0, width = carousel.clientWidth;
  const wrap = value => ((value % 1) + 1) % 1;

  function paint() {
    if (!desktop.matches) return;
    photos.forEach((photo, index) => {
      const position = (wrap(index / photos.length + phase + .5) - .5) * 2;
      const distance = Math.abs(position);
      const scale = 1 - distance * .34;
      const x = position * width * .66;
      const y = 74 - Math.pow(distance, 2) * 147;
      photo.style.transform = `translateX(-50%) translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${(-distance * 155).toFixed(2)}px) rotateY(${(-position * 22).toFixed(2)}deg) rotateZ(${(position * 5).toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      photo.style.zIndex = String(Math.round((1 - distance) * 100));
      photo.style.opacity = String(Math.min(1, (1 - distance) * 6));
    });
  }
  function shouldMove() { return desktop.matches && visible && !paused && !reduce.matches && !dragging && !hovered && !focused && !document.hidden; }
  function animate(now) {
    frame = 0;
    if (!shouldMove()) { last = 0; return; }
    if (last) phase = wrap(phase + Math.min(now - last, 50) / 150000);
    last = now;
    paint();
    frame = requestAnimationFrame(animate);
  }
  function schedule() {
    if (shouldMove() && !frame) { last = 0; frame = requestAnimationFrame(animate); }
    else if (!shouldMove()) { cancelAnimationFrame(frame); frame = 0; last = 0; }
  }
  function updateToggle() {
    toggle.hidden = !desktop.matches;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Retomar movimento' : 'Pausar movimento';
  }
  function setup() {
    width = carousel.clientWidth;
    carousel.classList.toggle('is-arc', desktop.matches);
    photos.forEach(photo => { photo.style.removeProperty('transform'); photo.style.removeProperty('opacity'); photo.style.removeProperty('z-index'); });
    paint(); updateToggle(); schedule();
  }
  toggle.addEventListener('click', () => { paused = !paused; updateToggle(); schedule(); });
  carousel.addEventListener('pointerdown', event => {
    if (!desktop.matches || event.button !== 0) return;
    dragging = true; lastX = event.clientX;
    carousel.setPointerCapture(event.pointerId);
    carousel.classList.add('is-dragging');
    schedule();
  });
  carousel.addEventListener('pointermove', event => {
    if (!dragging) return;
    phase = wrap(phase + (event.clientX - lastX) / (width * 1.32));
    lastX = event.clientX;
    paint();
  });
  function release() { dragging = false; carousel.classList.remove('is-dragging'); schedule(); }
  carousel.addEventListener('pointerup', release);
  carousel.addEventListener('pointercancel', release);
  carousel.addEventListener('lostpointercapture', release);
  carousel.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; schedule(); } });
  carousel.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  carousel.addEventListener('focusin', () => { focused = true; schedule(); });
  carousel.addEventListener('focusout', () => { focused = false; schedule(); });
  carousel.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    if (desktop.matches) { phase = wrap(phase + (event.key === 'ArrowRight' ? -1 : 1) / photos.length); paint(); }
    else track.scrollBy({left: (event.key === 'ArrowRight' ? 1 : -1) * width * .72, behavior: reduce.matches ? 'instant' : 'smooth'});
  });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, {threshold: .05}).observe(carousel);
  new ResizeObserver(setup).observe(carousel);
  desktop.addEventListener('change', () => { dragging = false; setup(); });
  reduce.addEventListener('change', () => { paused = reduce.matches; updateToggle(); schedule(); });
  document.addEventListener('visibilitychange', schedule);
  setup();
})();
