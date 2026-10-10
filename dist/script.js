(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#main-navigation');
  const interest = document.querySelector('#project-type');
  const contactForm = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');

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

  document.querySelectorAll('[data-interest]').forEach(link => {
    link.addEventListener('click', () => {
      interest.value = link.dataset.interest;
      status.textContent = '';
    });
  });

  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.querySelector('#client-name').value.trim();
    if (!name) {
      document.querySelector('#client-name').setCustomValidity('Informe seu nome para iniciar a conversa.');
      contactForm.reportValidity();
      return;
    }
    const idea = document.querySelector('#project-message').value.trim();
    const message = `Olá, Urbano Junior! Meu nome é ${name}.\nGostaria de conversar sobre: ${interest.value}.${idea ? `\n\nMinha ideia: ${idea}` : ''}`;
    const url = `https://wa.me/5562981647663?text=${encodeURIComponent(message)}`;
    // Navigation happens on this user gesture; no personal data is persisted.
    const outgoing = document.createElement('a');
    outgoing.href = url;
    outgoing.target = '_blank';
    outgoing.rel = 'noopener noreferrer';
    outgoing.click();
    status.replaceChildren();
    status.append('Sua mensagem está pronta. ');
    const fallback = document.createElement('a');
    fallback.href = url;
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    fallback.textContent = 'Abrir no WhatsApp';
    fallback.style.textDecoration = 'underline';
    status.append(fallback);
  });
  document.querySelector('#client-name').addEventListener('input', event => event.target.setCustomValidity(''));
  document.querySelector('#year').textContent = String(new Date().getFullYear());
})();
