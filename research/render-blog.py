"""Render the blog directory from actual published articles, with no runtime fetch.

Add articles to dist/content/blog.json, run this script, then update-schema.py.
This renders content only; no tests or publication are performed.
"""
from pathlib import Path
from html import escape
from datetime import date
import json
import re

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
source = (DIST / 'servicos.html').read_text(encoding='utf-8')
articles = json.loads((DIST / 'content/blog.json').read_text(encoding='utf-8'))['articles']
articles = sorted(articles, key=lambda item: item['date'], reverse=True)
metadata = json.loads((ROOT / 'research/search-metadata.json').read_text(encoding='utf-8'))['blog']

def icon(name='arrow'):
    return '<svg class="icon" aria-hidden="true"><use href="#' + name + '"/></svg>'

cards = []
categories = {}
for article in articles:
    # Do not publish navigation to an article that has not been supplied yet.
    if not (DIST / article['href']).is_file():
        raise ValueError('Missing article file: ' + article['href'])
    if not (DIST / article['image']).is_file():
        raise ValueError('Missing article image: ' + article['image'])
    published = date.fromisoformat(article['date'])
    a = {key: escape(str(value), quote=True) for key, value in article.items()}
    categories[a['category']] = a['categoryLabel']
    cards.append(f'''<article class="blog-card" data-blog-category="{a['category']}">
<a class="blog-card-photo" href="{a['href']}" tabindex="-1" aria-hidden="true"><img src="{a['image']}" alt="{a['imageAlt']}" width="{a['width']}" height="{a['height']}" loading="lazy" decoding="async"></a>
<div class="blog-card-copy"><p class="blog-card-category">{a['categoryLabel']}</p><h2><a href="{a['href']}">{a['title']}</a></h2><p class="blog-card-excerpt">{a['excerpt']}</p><div class="blog-card-bottom"><a class="text-link" href="{a['href']}" aria-label="Leia mais: {a['title']}">Leia mais {icon()}</a><time datetime="{a['date']}">{published.strftime('%d/%m/%Y')}</time></div></div></article>''')

filters = '<button type="button" class="blog-filter" data-blog-filter="todos" aria-pressed="true" aria-controls="blog-grid">Todos</button>'
for category, label in categories.items():
    filters += f'<button type="button" class="blog-filter" data-blog-filter="{category}" aria-pressed="false" aria-controls="blog-grid">{label}</button>'

icons = re.search(r'<svg\b[^>]*class="icon-library".*?</svg>', source, re.S)[0]
header = re.search(r'<header\b.*?</header>', source, re.S)[0]
header = header.replace(' aria-current="page"', '').replace('href="#contato"', 'href="index.html#contato"')
if 'href="blog.html"' not in header:
    header = header.replace('<a href="sobre.html">', '<a href="blog.html" aria-current="page">Blog</a><a href="sobre.html">')
else:
    header = header.replace('href="blog.html"', 'href="blog.html" aria-current="page"')
footer = re.search(r'<footer\b.*?</footer>', source, re.S)[0].replace('href="#contato"', 'href="index.html#contato"')
if 'href="blog.html"' not in footer:
    footer = footer.replace('<a href="sobre.html">', '<a href="blog.html">Blog</a><a href="sobre.html">')

empty = '' if articles else f'''<div class="blog-empty"><span class="blog-empty-mark" aria-hidden="true">UJ</span><h2>Novas leituras, em breve.</h2><p>Os artigos serão reunidos aqui conforme forem publicados. Enquanto isso, conheça as peças e o processo de criação no portfólio.</p><a class="text-link" href="index.html#portfolio">Explorar o portfólio {icon('diagonal')}</a></div>'''
total = len(articles)
count = f'<p class="blog-count" data-blog-count role="status" aria-live="polite" aria-atomic="true">{total} {"artigo" if total == 1 else "artigos"}</p>' if articles else ''
title, description = escape(metadata['title']), escape(metadata['description'], quote=True)
html = f'''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title><meta name="description" content="{description}"><meta name="theme-color" content="#f5f2ec">
<link rel="canonical" href="https://urbanojunior.com/blog">
<meta property="og:type" content="website"><meta property="og:locale" content="pt_BR"><meta property="og:title" content="{title}"><meta property="og:description" content="{description}"><meta property="og:url" content="https://urbanojunior.com/blog"><meta property="og:image" content="https://urbanojunior.com/assets/urbano-junior-logo-3.webp"><meta property="og:image:alt" content="Urbano Junior Estilista"><meta name="twitter:card" content="summary">
<link rel="icon" href="assets/urbano-junior-logo-3.webp" type="image/webp"><link rel="preload" href="assets/local-font-3.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/fonts.css"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="home.css"><link rel="stylesheet" href="services.css"><link rel="stylesheet" href="blog.css">
<script src="script.js" defer></script><script src="services.js" defer></script><script src="blog.js" defer></script>
</head><body class="blog-page">{icons}<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>{header}
<main id="conteudo"><div class="container"><div class="breadcrumbs" aria-label="Caminho de navegação"><a href="index.html">Início</a><span aria-hidden="true">/</span><span aria-current="page">Blog</span></div>
<section class="blog-intro" aria-labelledby="blog-title"><p class="eyebrow">URBANO JUNIOR · MODA E CRIAÇÃO</p><h1 id="blog-title">Blog</h1><p>Ideias, referências e conversas sobre o vestir.<br>Um espaço para conhecer a criação sob medida, do desenho aos detalhes.</p></section></div>
<section class="blog-library" aria-label="Artigos do blog"><div class="container"><div class="blog-filters" data-blog-filters role="group" aria-label="Filtrar artigos por tema" hidden>{filters}</div>{count}<div class="blog-grid" id="blog-grid">{''.join(cards)}</div>{empty}<p class="blog-note">Criação sob medida, vestidos de noiva e de festa, croquis e o trabalho de ateliê em Goiânia.</p></div></section></main>
{footer}</body></html>
'''
(DIST / 'blog.html').write_text(html, encoding='utf-8')
