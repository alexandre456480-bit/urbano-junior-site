(() => {
  const group = document.querySelector('.nav-services');
  if (!group) return;
  const toggle = group.querySelector('.services-toggle');
  const submenu = group.querySelector('.services-submenu');
  const close = () => { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Expandir serviços'); submenu.hidden = true; };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Recolher serviços' : 'Expandir serviços');
    submenu.hidden = !open;
  });
  document.addEventListener('click', event => { if (!group.contains(event.target)) close(); });
  group.addEventListener('focusout', event => { if (!group.contains(event.relatedTarget)) close(); });
  group.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !submenu.hidden) { event.stopPropagation(); close(); toggle.focus(); }
  });
})();
