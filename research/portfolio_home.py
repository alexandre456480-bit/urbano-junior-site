"""Render only the home portfolio and its dialog from content/home.json."""
from pathlib import Path
from html import escape
from urllib.parse import quote
from collections import Counter
import json
import re

ROOT = Path(__file__).resolve().parent.parent
CATEGORIES = [('todos', 'Todos'), ('sob-medida', 'Sob medida'), ('festa', 'Festa'), ('noivas', 'Noivas'), ('alta-costura', 'Alta Costura'), ('autorais', 'Croquis'), ('modelagem', 'Modelagem')]


def icon(name='arrow'):
    return f'<svg class="icon" aria-hidden="true"><use href="#{name}"/></svg>'


def update_portfolio():
    path = ROOT / 'dist/index.html'
    html = path.read_text(encoding='utf-8')
    data = json.loads((ROOT / 'dist/content/home.json').read_text(encoding='utf-8'))
    projects = data['projects']
    counts = Counter(p['category'] for p in projects)
    filters = []
    for key, label in CATEGORIES:
        count = len(projects) if key == 'todos' else counts[key]
        selected = key == 'todos'
        filters.append(f'<button type="button" class="portfolio-filter{" is-selected" if selected else ""}" data-filter="{key}" data-filter-label="{label}" aria-label="{label}, {count} imagens" aria-pressed="{str(selected).lower()}" aria-controls="portfolio-grid"><span>{label}</span><span class="portfolio-filter-count" aria-hidden="true">{count}</span></button>')
    cards = []
    for project in projects:
        p = {key: escape(str(value), quote=True) for key, value in project.items()}
        cards.append(f'''<article class="portfolio-item portfolio-{p['ratio']}" data-category="{p['category']}" data-title="{p['title']}" data-category-label="{p['categoryLabel']}" data-description="{p['description']}" data-service-href="{p['serviceHref']}">
  <a class="project-open" href="{p['src']}" data-project="{p['id']}" target="_blank" rel="noopener noreferrer" aria-label="Ampliar: {p['alt']}" aria-haspopup="dialog"><span class="project-photo" style="--photo-position:{p['position']}"><img src="{p['src']}" alt="{p['alt']}" width="{p['width']}" height="{p['height']}" loading="lazy" decoding="async"><span class="project-overlay"><span>{p['categoryLabel']}</span>{icon('diagonal')}</span></span></a>
</article>''')
    whatsapp = escape(data['contact']['whatsapp'] + '?text=' + quote('Olá, Urbano Junior! Gostaria de conversar sobre uma criação.'), quote=True)
    section = f'''<section id="portfolio" class="portfolio home-section section-space" aria-labelledby="portfolio-title">
      <div class="container"><div class="section-heading"><h2 id="portfolio-title">Portfólio</h2><div class="portfolio-intro"><p>Peças, croquis e registros do ateliê.</p></div></div>
      <div class="portfolio-filters" role="group" aria-label="Filtrar portfólio" hidden>{''.join(filters)}</div><p class="portfolio-status" id="portfolio-status" role="status" aria-live="polite" aria-atomic="true">{len(projects)} imagens</p><div class="portfolio-grid" id="portfolio-grid">{''.join(cards)}</div><div class="portfolio-more" hidden><button type="button" class="button button-dark" id="portfolio-more" aria-controls="portfolio-grid">VER MAIS PROJETOS {icon()}</button></div><div class="portfolio-end"><a class="text-link" href="{whatsapp}" target="_blank" rel="noopener noreferrer">Conte sua ideia {icon()}</a></div></div>
      <div class="shape-divider shape-divider-portfolio" aria-hidden="true"><svg viewBox="0 0 1440 50" preserveAspectRatio="none"><path d="M0,50 C380,6 1060,6 1440,50 L1440,50 L0,50 Z" fill="var(--greige)"></path></svg></div>
    </section>'''
    dialog = f'''<dialog class="project-dialog" id="project-dialog" aria-labelledby="project-dialog-title"><button class="dialog-close" type="button" aria-label="Fechar projeto" autofocus>×</button><div class="project-dialog-content"><img id="project-dialog-image" alt=""><div class="project-dialog-copy"><p class="eyebrow" id="project-dialog-category"></p><h2 id="project-dialog-title"></h2><p id="project-dialog-description"></p><div class="project-dialog-navigation" role="group" aria-label="Navegar pelas imagens da categoria"><button type="button" class="project-dialog-previous" aria-label="Imagem anterior">{icon()}</button><span id="project-dialog-position" role="status" aria-live="polite" aria-atomic="true"></span><button type="button" class="project-dialog-next" aria-label="Próxima imagem">{icon()}</button></div><a class="text-link project-dialog-service" id="project-dialog-service" href="servicos.html">Conhecer o serviço {icon()}</a><a class="button button-dark" href="{whatsapp}" target="_blank" rel="noopener noreferrer" id="project-dialog-contact">CONVERSAR SOBRE UMA CRIAÇÃO {icon()}</a></div></div></dialog>'''
    html, section_count = re.subn(r'<section id="portfolio".*?</section>', lambda _: section, html, count=1, flags=re.S)
    html, dialog_count = re.subn(r'<dialog class="project-dialog".*?</dialog>', lambda _: dialog, html, count=1, flags=re.S)
    if section_count != 1 or dialog_count != 1:
        raise ValueError('The existing portfolio section and dialog must both be present.')
    path.write_text(html, encoding='utf-8')


if __name__ == '__main__':
    update_portfolio()
