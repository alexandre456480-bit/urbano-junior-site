(() => {
  const section = document.querySelector('[data-party-projects]');
  if (!section) return;

  const cards = [...section.querySelectorAll('[data-project-category]')];
  const filters = [...section.querySelectorAll('[data-project-filter]')];
  const filterBar = section.querySelector('[data-project-filters]');
  const count = section.querySelector('[data-project-count]');
  const more = section.querySelector('[data-project-more]');
  const dialog = document.querySelector('#festas-project-dialog');
  const photo = dialog.querySelector('[data-dialog-photo]');
  const caption = dialog.querySelector('[data-dialog-caption]');
  const position = dialog.querySelector('[data-dialog-position]');
  const previous = dialog.querySelector('[data-dialog-previous]');
  const next = dialog.querySelector('[data-dialog-next]');
  let selected = cards;
  let limit = 9;
  let active = 0;
  let opener;
  let previousOverflow;

  function update() {
    cards.forEach(card => { card.hidden = !selected.includes(card) || selected.indexOf(card) >= limit; });
    const shown = Math.min(limit, selected.length);
    count.textContent = `${shown} de ${selected.length} imagens`;
    more.hidden = shown >= selected.length;
  }

  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    selected = cards.filter(card => button.dataset.projectFilter === 'todos' || card.dataset.projectCategory === button.dataset.projectFilter);
    limit = 9;
    update();
  }));

  more.addEventListener('click', () => {
    const firstNew = selected[limit];
    limit += 9;
    update();
    firstNew?.querySelector('a').focus({ preventScroll: true });
  });

  function show(index) {
    active = (index + selected.length) % selected.length;
    const link = selected[active].querySelector('a');
    const thumbnail = link.querySelector('img');
    photo.src = link.href;
    photo.alt = thumbnail.alt;
    photo.width = thumbnail.width;
    photo.height = thumbnail.height;
    caption.textContent = thumbnail.alt;
    position.textContent = `${active + 1} de ${selected.length}`;
    previous.disabled = next.disabled = selected.length < 2;
  }

  cards.forEach(card => card.querySelector('a').addEventListener('click', event => {
    if (typeof dialog.showModal !== 'function' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = event.currentTarget;
    show(selected.indexOf(card));
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
  }));

  previous.addEventListener('click', () => show(active - 1));
  next.addEventListener('click', () => show(active + 1));
  dialog.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(active + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow;
    photo.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  });

  filterBar.hidden = false;
  update();
})();
