(() => {
  'use strict';
  const portfolio = document.querySelector('#portfolio');
  const filters = [...portfolio.querySelectorAll('[data-filter]')];
  const projects = [...portfolio.querySelectorAll('.portfolio-item')];
  const status = portfolio.querySelector('#portfolio-status');
  const filterBar = portfolio.querySelector('.portfolio-filters');
  const more = portfolio.querySelector('#portfolio-more');
  const moreContainer = portfolio.querySelector('.portfolio-more');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let filtered = projects;
  let limit = 12;
  let currentCategory = 'todos';

  function renderProjects(animate = false) {
    const visible = new Set(filtered.slice(0, limit));
    projects.forEach(item => { item.hidden = !visible.has(item); });
    const label = filters.find(button => button.dataset.filter === currentCategory)?.dataset.filterLabel || 'Todos';
    status.textContent = `${visible.size} de ${filtered.length} imagens · ${label}`;
    moreContainer.hidden = visible.size >= filtered.length;
    if (animate && !reduce.matches) [...visible].forEach((item, index) => {
      item.animate?.([{ opacity: .5 }, { opacity: 1 }], { duration: 260, delay: Math.min(index, 3) * 30 });
    });
  }

  function filterProjects(category) {
    if (!filters.some(button => button.dataset.filter === category)) return;
    currentCategory = category;
    filtered = projects.filter(item => category === 'todos' || item.dataset.category === category);
    limit = 12;
    filters.forEach(button => {
      const selected = button.dataset.filter === category;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    renderProjects(true);
  }
  filters.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
  document.querySelectorAll('[data-service-filter]').forEach(link => link.addEventListener('click', () => filterProjects(link.dataset.serviceFilter)));
  more.addEventListener('click', () => {
    const firstNew = filtered[limit];
    limit += 12;
    renderProjects();
    if (moreContainer.hidden) firstNew?.querySelector('a').focus({ preventScroll: true });
  });
  filterBar.hidden = false;
  renderProjects();

  const dialog = document.querySelector('#project-dialog');
  const dialogImage = dialog.querySelector('#project-dialog-image');
  const dialogTitle = dialog.querySelector('#project-dialog-title');
  const dialogCategory = dialog.querySelector('#project-dialog-category');
  const dialogDescription = dialog.querySelector('#project-dialog-description');
  const dialogContact = dialog.querySelector('#project-dialog-contact');
  const dialogService = dialog.querySelector('#project-dialog-service');
  const dialogPosition = dialog.querySelector('#project-dialog-position');
  const previous = dialog.querySelector('.project-dialog-previous');
  const next = dialog.querySelector('.project-dialog-next');
  const whatsapp = dialogContact.href.split('?')[0];
  let activeProject = 0;
  let opener;
  let swipeStart;

  function showProject(index) {
    if (!filtered.length) return;
    activeProject = (index + filtered.length) % filtered.length;
    const item = filtered[activeProject];
    const link = item.querySelector('[data-project]');
    const image = link.querySelector('img');
    dialogImage.src = link.href;
    dialogImage.alt = image.alt;
    dialogImage.width = Number(image.getAttribute('width'));
    dialogImage.height = Number(image.getAttribute('height'));
    dialogTitle.textContent = item.dataset.title;
    dialogCategory.textContent = item.dataset.categoryLabel;
    dialogDescription.textContent = item.dataset.description;
    dialogPosition.textContent = `${activeProject + 1} de ${filtered.length}`;
    previous.disabled = next.disabled = filtered.length < 2;
    dialogService.href = item.dataset.serviceHref;
    dialogService.firstChild.textContent = item.dataset.category === 'autorais' ? 'Conhecer o estilista ' : 'Conhecer o serviço ';
    dialogContact.href = `${whatsapp}?text=${encodeURIComponent(`Olá, Urbano Junior! Gostaria de conversar sobre uma criação. Vi esta imagem no portfólio: ${image.alt}.`)}`;
  }

  projects.forEach(item => {
    const link = item.querySelector('[data-project]');
    link.addEventListener('click', event => {
      if (typeof dialog.showModal !== 'function' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      showProject(filtered.indexOf(item));
      dialog.showModal();
      document.body.classList.add('has-dialog');
    });
  });
  previous.addEventListener('click', () => showProject(activeProject - 1));
  next.addEventListener('click', () => showProject(activeProject + 1));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showProject(activeProject + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialogImage.draggable = false;
  dialogImage.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' && event.isPrimary) {
      swipeStart = { x: event.clientX, y: event.clientY };
      dialogImage.setPointerCapture(event.pointerId);
    }
  });
  dialogImage.addEventListener('pointerup', event => {
    if (!swipeStart) return;
    const x = event.clientX - swipeStart.x;
    const y = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(x) > 60 && Math.abs(y) < 50) showProject(activeProject + (x < 0 ? 1 : -1));
  });
  dialogImage.addEventListener('pointercancel', () => { swipeStart = null; });
  dialog.addEventListener('close', () => {
    swipeStart = null;
    document.body.classList.remove('has-dialog');
    dialogImage.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  });

  const carousel = document.querySelector('.atelier-carousel');
  const track = carousel.querySelector('.arc-track');
  const photos = [...track.children];
  const toggle = document.querySelector('.arc-toggle');
  const desktop = matchMedia('(min-width: 821px)');
  let phase = 0, frame = 0, last = 0, visible = false, dragging = false, hovered = false, focused = false;
  let paused = reduce.matches, lastX = 0, width = carousel.clientWidth;
  const wrap = value => ((value % 1) + 1) % 1;

  function paint() {

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
  function shouldMove() { return visible && !paused && !reduce.matches && !dragging && !document.hidden; }
  function animate(now) {
    frame = 0;
    if (!shouldMove()) { last = 0; return; }
    if (last) phase = wrap(phase + Math.min(now - last, 50) / 90000);
    last = now;
    paint();
    frame = requestAnimationFrame(animate);
  }
  function schedule() {
    if (shouldMove() && !frame) { last = 0; frame = requestAnimationFrame(animate); }
    else if (!shouldMove()) { cancelAnimationFrame(frame); frame = 0; last = 0; }
  }
  function updateToggle() {
    if (!toggle) return;
    toggle.hidden = false;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Retomar movimento' : 'Pausar movimento';
  }
  function setup() {
    width = carousel.clientWidth;
    carousel.classList.add('is-arc');
    photos.forEach(photo => { photo.style.removeProperty('transform'); photo.style.removeProperty('opacity'); photo.style.removeProperty('z-index'); });
    paint(); updateToggle(); schedule();
  }
  if (toggle) {
    toggle.addEventListener('click', () => { paused = !paused; updateToggle(); schedule(); });
  }
  carousel.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
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
    phase = wrap(phase + (event.key === 'ArrowRight' ? -1 : 1) / photos.length); paint();
  });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, {threshold: .05}).observe(carousel);
  new ResizeObserver(setup).observe(carousel);
  desktop.addEventListener('change', () => { dragging = false; setup(); });
  reduce.addEventListener('change', () => { paused = reduce.matches; updateToggle(); schedule(); });
  document.addEventListener('visibilitychange', schedule);
  setup();
})();
