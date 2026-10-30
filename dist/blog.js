(() => {
  const filters = document.querySelector('[data-blog-filters]');
  const cards = [...document.querySelectorAll('[data-blog-category]')];
  const count = document.querySelector('[data-blog-count]');
  if (!filters || !cards.length) return;
  filters.hidden = false;
  filters.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      const selected = button.dataset.blogFilter;
      filters.querySelectorAll('button').forEach(filter => {
        filter.setAttribute('aria-pressed', String(filter === button));
      });
      let visible = 0;
      cards.forEach(card => {
        card.hidden = selected !== 'todos' && card.dataset.blogCategory !== selected;
        if (!card.hidden) visible += 1;
      });
      count.textContent = `${visible} ${visible === 1 ? 'artigo' : 'artigos'}`;
    });
  });
})();
