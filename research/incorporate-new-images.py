"""Incorporate the supplied October 2026 photos without replacing existing work.

This is an idempotent content migration, not a test or a deployment script.
Run portfolio_home.py and update-schema.py afterwards to refresh derived markup.
"""
from pathlib import Path
from html import escape
from PIL import Image
import json
import re
import shutil

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
BRIDAL = 'vestidos-de-noiva-sob-medida-em-goiania'
PARTY = 'vestidos-de-festa-sob-medida-em-goiania'
CUSTOM = 'roupas-sob-medida-em-goiania'
COUTURE = 'alta-costura-em-goiania'

# Classification is based on the supplied photographs, rather than filenames alone.
PHOTOS = [
    ('alta-costura-modelagem', 'alta-costura', 'Alta Costura', 'Bordados e recortes', 'Peça escura com recortes, transparência e aplicações douradas no manequim', COUTURE),
    ('ensaio-fotografico-urbano-junior', 'sob-medida', 'Sob medida', 'Criação em cena', 'Registro de ensaio fotográfico com modelo usando blusa azul de mangas amplas e calça branca', CUSTOM),
    ('modelagem-de-vestido-de-noiva', 'modelagem', 'Modelagem', 'Corpete de noiva', 'Corpete branco com decote em transparência e aplicações florais no manequim', BRIDAL),
    ('modelagem-vestidos-de-festa', 'modelagem', 'Modelagem', 'Drapeados e aplicações', 'Vestido azul com drapeados e aplicações douradas sobre manequim vermelho', PARTY),
    ('vestido-de-noiva-goiania', 'noivas', 'Noivas', 'Noiva com véu e buquê', 'Fotografia em preto e branco de noiva com vestido sem alças, véu longo e buquê', BRIDAL),
    ('vestido-para-festas-sob-medida', 'festa', 'Festa', 'Vestido rosa de festa', 'Mulher usando vestido longo rosa com drapeado e saia em camadas', PARTY),
    ('vestido-para-ocasioes-especiais', 'festa', 'Festa', 'Contrastes e movimento', 'Modelo com blusa branca sem mangas e saia longa preta em ensaio junto a um rio', PARTY),
    ('vestido-sob-medida-em-goiania', 'sob-medida', 'Sob medida', 'Vestido vermelho bordado', 'Vestido longo vermelho com mangas compridas e corpete bordado sobre manequim', CUSTOM),
    ('vestidos-sob-medida-goiania', 'sob-medida', 'Sob medida', 'Bordados e transparências', 'Retrato de mulher com vestido de corpete bordado em dourado e transparências', CUSTOM),
    ('vestidos-sob-medida-urbano-junior', 'festa', 'Festa', 'Volumes e cauda', 'Modelo com vestido claro drapeado, saia assimétrica e cauda em tom rosado', PARTY),
]

data_path = DIST / 'content/home.json'
data = json.loads(data_path.read_text(encoding='utf-8'))
target = DIST / 'assets/novas-imagens'
target.mkdir(parents=True, exist_ok=True)
photos = {}
for stem, category, label, title, alt, service in PHOTOS:
    source = ROOT / 'img/novas-imagens' / (stem + '.webp')
    shutil.copy2(source, target / source.name)
    with Image.open(source) as image:
        width, height = image.size
    project = {
        'id': 'acervo-' + stem, 'title': title, 'category': category,
        'categoryLabel': label, 'type': title, 'src': 'assets/novas-imagens/' + source.name,
        'alt': alt, 'width': width, 'height': height,
        'ratio': 'portrait' if height / width > 1.15 else 'landscape' if width / height > 1.15 else 'square',
        'position': '50% 50%', 'description': alt + '.', 'serviceHref': service + '.html',
    }
    photos[stem] = project
    if not any(item['src'] == project['src'] for item in data['projects']):
        data['projects'].append(project)
data_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def image_markup(photo):
    return '<img src="{src}" alt="{alt}" width="{width}" height="{height}" loading="lazy" decoding="async">'.format(**{key: escape(str(value), quote=True) for key, value in photo.items()})


def link_markup(photo, contents):
    return '<a href="{src}" target="_blank" rel="noopener noreferrer" aria-label="Ampliar: {alt}">{contents}</a>'.format(src=photo['src'], alt=escape(photo['alt'], quote=True), contents=contents)


def append_to_grid(html, class_name, figures):
    # Existing grids contain figures and links, with no nested div containers.
    pattern = r'(<div class="' + re.escape(class_name) + r'"[^>]*>)(.*?)(</div>)'
    def append(match):
        content = match[2]
        for photo, figure in figures:
            if photo['src'] not in content:
                content += figure
        return match[1] + content + match[3]
    return re.sub(pattern, append, html, count=1, flags=re.S)


# Preserve the existing progressive galleries and their filter/dialog contract.
party_stems = [item[0] for item in PHOTOS if item[5] in (PARTY, CUSTOM) and item[0] != 'ensaio-fotografico-urbano-junior']
custom_stems = [item[0] for item in PHOTOS if item[5] != BRIDAL] + ['modelagem-de-vestido-de-noiva']
for route, stems in ((PARTY, party_stems), (CUSTOM, custom_stems)):
    path = DIST / (route + '.html')
    html = path.read_text(encoding='utf-8')
    figures = []
    for stem in stems:
        photo = photos[stem]
        category = 'modelagem' if photo['category'] == 'modelagem' else 'pecas' if stem in ('ensaio-fotografico-urbano-junior', 'alta-costura-modelagem') else 'vestidos'
        contents = image_markup(photo) + '<span class="festas-project-expand" aria-hidden="true"><svg class="icon"><use href="#diagonal"/></svg></span>'
        figures.append((photo, '<figure class="festas-project-card" data-project-category="' + category + '">' + link_markup(photo, contents) + '</figure>'))
    html = append_to_grid(html, 'festas-project-grid', figures)
    count = len(re.findall(r'<figure class="festas-project-card"', html))
    html = re.sub(r'(data-project-count[^>]*>)\d+ imagens', lambda m: m[1] + str(count) + ' imagens', html)
    path.write_text(html, encoding='utf-8')

# Both new bridal photos belong in the existing carousel, including the bodice detail.
path = DIST / (BRIDAL + '.html')
html = path.read_text(encoding='utf-8')
figures = []
for stem in ('vestido-de-noiva-goiania', 'modelagem-de-vestido-de-noiva'):
    photo = photos[stem]
    figures.append((photo, '<figure class="bridal-carousel-slide" role="group" aria-roledescription="slide">' + link_markup(photo, image_markup(photo)) + '</figure>'))
html = append_to_grid(html, 'bridal-carousel-track', figures)
def relabel_carousel(match):
    track = match[0]
    total = track.count('class="bridal-carousel-slide"')
    index = 0
    def relabel(figure):
        nonlocal index
        index += 1
        tag = re.sub(r' aria-label="[^"]*"', '', figure[0])
        return tag[:-1] + f' aria-label="{index} de {total}">'
    return re.sub(r'<figure class="bridal-carousel-slide"[^>]*>', relabel, track)
html = re.sub(r'<div class="bridal-carousel-track"[^>]*>.*?</div>', relabel_carousel, html, count=1, flags=re.S)
path.write_text(html, encoding='utf-8')

path = DIST / (COUTURE + '.html')
html = path.read_text(encoding='utf-8')
photo = photos['alta-costura-modelagem']
figure = '<figure class="couture-editorial-addition">' + link_markup(photo, image_markup(photo)) + '</figure>'
html = append_to_grid(html, 'couture-editorial-grid', [(photo, figure)])
path.write_text(html, encoding='utf-8')
