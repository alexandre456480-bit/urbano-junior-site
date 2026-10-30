"""Update static SEO metadata and JSON-LD from the visible site content.

Run from any directory. Pass --base-url when the production domain changes.
No network requests, tests, screenshots or publication are performed.
"""
from pathlib import Path
from html import escape, unescape
from urllib.parse import urljoin, unquote, quote
import argparse
import copy
import json
import re

root = Path(__file__).resolve().parent.parent
dist = root / 'dist'
slug = 'vestidos-de-noiva-sob-medida-em-goiania'
couture_slug = 'alta-costura-em-goiania'
festa_slug = 'vestidos-de-festa-sob-medida-em-goiania'
custom_slug = 'roupas-sob-medida-em-goiania'
parser = argparse.ArgumentParser()
parser.add_argument('--base-url', default='https://urbanojunior.com/')
args = parser.parse_args()
base = args.base_url.rstrip('/') + '/'
# Keep search and social wording together, including on campaign/contact pages.
metadata = json.loads((root / 'research/search-metadata.json').read_text(encoding='utf-8'))
for route, fields in metadata.items():
    path = dist / (route + '.html')
    html = path.read_text(encoding='utf-8')
    html = re.sub(r'<title>.*?</title>', lambda _: '<title>' + escape(fields['title']) + '</title>', html, count=1, flags=re.S)
    for attribute, key, value in [
        ('name', 'description', fields['description']),
        ('property', 'og:title', fields['title']),
        ('property', 'og:description', fields['description']),
        ('name', 'twitter:title', fields['title']),
        ('name', 'twitter:description', fields['description']),
    ]:
        tag = '<meta ' + attribute + '="' + key + '" content="' + escape(value, quote=True) + '">'
        pattern = r'<meta ' + attribute + '="' + re.escape(key) + '"[^>]*>'
        if re.search(pattern, html):
            html = re.sub(pattern, lambda _: tag, html, count=1)
        else:
            html = html.replace('</head>', tag + '\n</head>')
    path.write_text(html, encoding='utf-8')

data = json.loads((dist / 'content/home.json').read_text(encoding='utf-8'))
contact = data['contact']

def ref(identifier):
    return {'@id': identifier}

def text(value):
    return unescape(re.sub(r'<[^>]*>', '', value)).strip()

business_id, person_id, website_id = [base + '#' + key for key in ('atelie', 'estilista', 'website')]
city = {'@type': 'City', 'name': 'Goiânia', 'containedInPlace': {'@type': 'State', 'name': 'Goiás'}}
business = {
    '@type': 'LocalBusiness', '@id': business_id,
    'name': 'Urbano Junior Estilista', 'url': base,
    'description': 'Studio de criação sob medida, vestidos de noiva e de festa e modelagem para marcas no Jardim América, em Goiânia. Atendimento com hora marcada.',
    'logo': {'@type': 'ImageObject', '@id': base + '#logo', 'url': base + 'assets/urbano-junior-logo-3.webp', 'contentUrl': base + 'assets/urbano-junior-logo-3.webp'},
    'image': base + 'assets/noivas/vestido-de-noiva-sob-medida.webp',
    'telephone': '+55-62-98164-7663',
    'address': {'@type': 'PostalAddress', 'streetAddress': contact['streetAddress'] + ' — Jardim América', 'addressLocality': 'Goiânia', 'addressRegion': 'GO', 'postalCode': contact['postalCode'], 'addressCountry': 'BR'},
    'hasMap': contact['maps'], 'areaServed': city,
    'sameAs': [contact['instagram'], contact['facebook']],
    'contactPoint': {'@type': 'ContactPoint', 'telephone': '+55-62-98164-7663', 'contactType': 'Agendamento e informações', 'url': contact['whatsapp'], 'availableLanguage': 'pt-BR'},
}
person = {'@type': 'Person', '@id': person_id, 'name': 'Urbano Junior', 'jobTitle': 'Estilista e modelista', 'url': base + 'sobre', 'worksFor': ref(business_id), 'sameAs': business['sameAs']}
website = {'@type': 'WebSite', '@id': website_id, 'url': base, 'name': 'Urbano Junior Estilista', 'inLanguage': 'pt-BR', 'publisher': ref(business_id)}
services = []
for item in data['services']:
    # The dedicated couture entity is included below, also before its home card existed.
    if item['category'] == 'alta-costura':
        continue
    bridal = item['category'] == 'noivas'
    service_slug = {'noivas': slug, 'festa': festa_slug, 'sob-medida': custom_slug}.get(item['category'])
    url = base + service_slug if service_slug else base + 'servicos#' + item['category']
    identifier = base + service_slug + '#servico' if service_slug else base + '#servico-' + item['category']
    service = {'@type': 'Service', '@id': identifier, 'name': 'Vestidos de noiva sob medida em Goiânia' if bridal else item['title'], 'serviceType': 'Criação de vestido de noiva sob medida' if bridal else item['title'], 'description': item['description'], 'url': url, 'provider': ref(business_id), 'areaServed': city, 'image': urljoin(base, item['src'])}
    if service_slug == custom_slug:
        service.update({'name': 'Criação de roupas sob medida em Goiânia', 'serviceType': 'Criação de roupas sob medida', 'image': base + 'assets/sob-medida/roupas-sob-medida.webp'})
    if service_slug:
        service['mainEntityOfPage'] = ref(base + service_slug + '#pagina')
        service['availableChannel'] = {'@type': 'ServiceChannel', 'serviceUrl': contact['whatsapp'], 'serviceLocation': ref(business_id), 'availableLanguage': 'pt-BR'}
    services.append(service)
services.append({
    '@type': 'Service', '@id': base + couture_slug + '#servico',
    'name': 'Alta costura em Goiânia', 'serviceType': 'Criação autoral de peças sob medida',
    'description': 'Criação autoral de vestidos, conjuntos e peças sob medida com Urbano Junior. Desenho, modelagem, provas e acabamentos definidos para cada projeto.',
    'url': base + couture_slug, 'provider': ref(business_id), 'areaServed': city,
    'image': base + 'assets/altacostura/roupa-de-alta-costura-perto-de-mim.png',
    'mainEntityOfPage': ref(base + couture_slug + '#pagina'),
    'availableChannel': {'@type': 'ServiceChannel', 'serviceUrl': contact['whatsapp'], 'serviceLocation': ref(business_id), 'availableLanguage': 'pt-BR'},
})
catalog = {'@type': 'OfferCatalog', '@id': base + '#catalogo-servicos', 'name': 'Serviços de Urbano Junior', 'url': base + 'servicos', 'numberOfItems': len(services), 'itemListElement': [{'@type': 'Offer', 'itemOffered': ref(service['@id']), 'seller': ref(business_id)} for service in services]}

for filename, route, kind in [('index.html', '', 'WebPage'), ('servicos.html', 'servicos', 'CollectionPage'), ('blog.html', 'blog', 'Blog'), (slug + '.html', slug, 'WebPage'), (couture_slug + '.html', couture_slug, 'WebPage'), (festa_slug + '.html', festa_slug, 'WebPage'), (custom_slug + '.html', custom_slug, 'WebPage'), ('sobre.html', 'sobre', ['AboutPage', 'ProfilePage']), ('privacidade.html', 'privacidade', 'WebPage')]:
    path = dist / filename
    html = path.read_text(encoding='utf-8')
    url = base + route
    # Keep absolute social images on the selected production origin too.
    html = re.sub(r'(<meta (?:property|name)="(?:og:image|twitter:image)" content=")https?://[^/]+/', lambda m: m[1] + base, html)
    title = text(re.search(r'<title>(.*?)</title>', html, re.S).group(1))
    description = unescape(re.search(r'<meta name="description" content="([^"]*)"', html).group(1))
    page_id = url + '#pagina'
    page = {'@type': kind, '@id': page_id, 'url': url, 'name': title, 'description': description, 'inLanguage': 'pt-BR', 'isPartOf': ref(website_id), 'publisher': ref(business_id), 'about': ref(business_id)}
    graph = [copy.deepcopy(business), copy.deepcopy(person), copy.deepcopy(website), page]
    if route:
        crumbs = [('Início', base)]
        if route in (slug, couture_slug, festa_slug, custom_slug):
            crumbs.append(('Serviços', base + 'servicos'))
        crumbs.append(({'servicos': 'Serviços', 'blog': 'Blog', slug: 'Noivas', couture_slug: 'Alta Costura', festa_slug: 'Festas e ocasiões especiais', custom_slug: 'Criação sob medida', 'sobre': 'Sobre Urbano Junior', 'privacidade': 'Política de Privacidade'}[route], url))
        breadcrumb = {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [{'@type': 'ListItem', 'position': i, 'name': name, 'item': link} for i, (name, link) in enumerate(crumbs, 1)]}
        page['breadcrumb'] = ref(breadcrumb['@id'])
        graph.append(breadcrumb)
    if route in ('', 'servicos'):
        graph[0]['hasOfferCatalog'] = ref(catalog['@id'])
        graph.extend(copy.deepcopy(services) + [copy.deepcopy(catalog)])
        if route == 'servicos':
            listing = {'@type': 'ItemList', '@id': url + '#lista-servicos', 'name': 'Serviços de Urbano Junior em Goiânia', 'numberOfItems': len(services), 'itemListElement': [{'@type': 'ListItem', 'position': i, 'item': ref(service['@id'])} for i, service in enumerate(services, 1)]}
            page['mainEntity'] = ref(listing['@id'])
            graph.append(listing)
        else:
            page['mainEntity'] = ref(business_id)
            gallery_id = base + '#portfolio'
            portfolio_images = []
            for project in data['projects']:
                image_url = urljoin(base, quote(project['src'], safe='/'))
                portfolio_images.append({'@type': 'ImageObject', '@id': image_url + '#imagem', 'url': image_url, 'contentUrl': image_url, 'description': project['alt'], 'width': project['width'], 'height': project['height'], 'isPartOf': ref(gallery_id)})
            gallery = {'@type': 'ImageGallery', '@id': gallery_id, 'url': gallery_id, 'name': 'Portfólio de Urbano Junior', 'inLanguage': 'pt-BR', 'isPartOf': ref(page_id), 'about': ref(person_id), 'image': [ref(image['@id']) for image in portfolio_images]}
            page['hasPart'] = [ref(gallery_id)]
            graph.extend([gallery] + portfolio_images)
    elif route == 'blog':
        articles = json.loads((dist / 'content/blog.json').read_text(encoding='utf-8'))['articles']
        if articles:
            listing = {'@type': 'ItemList', '@id': url + '#artigos', 'name': 'Artigos do blog', 'numberOfItems': len(articles), 'itemListElement': [{'@type': 'ListItem', 'position': i, 'name': article['title'], 'url': urljoin(base, article['href'].removesuffix('.html'))} for i, article in enumerate(sorted(articles, key=lambda article: article['date'], reverse=True), 1)]}
            page['mainEntity'] = ref(listing['@id'])
            graph.append(listing)
    elif route == 'sobre':
        page['mainEntity'] = ref(person_id)
        page['about'] = ref(person_id)
        graph[1].update({
            'description': 'Estilista e modelista em Goiânia, com atuação em criação autoral, croquis, modelagem, moulage e peças sob medida.',
            'image': base + 'assets/junior-urbano/urbano-junior-alta-costura.webp',
            'knowsAbout': ['Desenho de moda', 'Criação autoral', 'Modelagem', 'Moulage', 'Criação sob medida'],
            'mainEntityOfPage': ref(page_id),
        })
        portrait = {'@type': 'ImageObject', '@id': url + '#retrato', 'contentUrl': graph[1]['image'], 'width': 1385, 'height': 2000, 'about': ref(person_id)}
        page['primaryImageOfPage'] = ref(portrait['@id'])
        graph.append(portrait)
        artworks = []
        artwork_images = []
        seen = set()
        for tag in re.findall(r'<img\b[^>]*\bdata-about-artwork[^>]*>', html):
            attributes = dict(re.findall(r'([\w-]+)="([^"]*)"', tag))
            source = attributes['src']
            if source in seen:
                continue
            seen.add(source)
            image_url = urljoin(base, source)
            artwork_id = image_url + '#obra'
            image = {'@type': 'ImageObject', '@id': image_url + '#imagem', 'contentUrl': image_url, 'description': unescape(attributes.get('alt', '')), 'encodesCreativeWork': ref(artwork_id)}
            for dimension in ('width', 'height'):
                if attributes.get(dimension, '').isdigit():
                    image[dimension] = int(attributes[dimension])
            artwork = {'@type': 'VisualArtwork', '@id': artwork_id, 'name': unescape(attributes.get('alt', 'Croqui de Urbano Junior')), 'artform': 'Desenho de moda', 'creator': ref(person_id), 'image': ref(image['@id']), 'isPartOf': ref(url + '#croquis')}
            artworks.append(artwork)
            artwork_images.append(image)
        gallery = {'@type': 'ImageGallery', '@id': url + '#croquis', 'url': url + '#croquis', 'name': 'Portfólio de croquis de Urbano Junior', 'about': ref(person_id), 'isPartOf': ref(page_id), 'hasPart': [ref(artwork['@id']) for artwork in artworks], 'image': [ref(image['@id']) for image in artwork_images]}
        graph.extend([gallery] + artworks + artwork_images)
        questions = re.findall(r'<details[^>]*>\s*<summary>(.*?)</summary>\s*<div class="faq-answer">\s*<p>(.*?)</p>', html, re.S)
        faq = {'@type': 'FAQPage', '@id': url + '#sobre-o-trabalho', 'url': url + '#sobre-o-trabalho', 'name': 'Sobre o trabalho de Urbano Junior', 'inLanguage': 'pt-BR', 'isPartOf': ref(page_id), 'about': ref(person_id), 'mainEntity': [{'@type': 'Question', 'name': text(q), 'acceptedAnswer': {'@type': 'Answer', 'text': text(a)}} for q, a in questions]}
        graph.append(faq)
        page['hasPart'] = [ref(gallery['@id']), ref(faq['@id'])]
        publications_markup = re.search(r'<section id="publicacoes".*?</section>', html, re.S)
        if publications_markup:
            publications = []
            for source_url, source_markup in re.findall(r'<a class="about-publication-card" href="([^"]+)"[^>]*>(.*?)</a>', publications_markup[0], re.S):
                source_name = text(re.search(r'<h3[^>]*>(.*?)</h3>', source_markup, re.S)[1])
                publications.append({'@type': 'WebPage', '@id': unescape(source_url), 'url': unescape(source_url), 'name': source_name, 'inLanguage': 'es', 'about': ref(person_id), 'publisher': {'@type': 'Organization', 'name': 'Nicaragua Diseña', 'url': 'https://www.nicaraguadisena.com/'}})
            references = [ref(publication['@id']) for publication in publications]
            graph[1]['subjectOf'] = references
            page['citation'] = references
            publication_section = {'@type': 'WebPageElement', '@id': url + '#publicacoes', 'name': 'Nicaragua Diseña — publicações e eventos', 'isPartOf': ref(page_id), 'about': ref(person_id), 'citation': references}
            page['hasPart'].append(ref(publication_section['@id']))
            graph.extend([publication_section] + publications)
    elif route in (slug, couture_slug, festa_slug, custom_slug):
        bridal = copy.deepcopy(next(service for service in services if service['@id'] == url + '#servico'))
        page['mainEntity'] = ref(bridal['@id'])
        page['about'] = [ref(bridal['@id']), ref(business_id)]
        graph.append(bridal)
        # Derive the FAQ from the current visible answers to prevent stale copy.
        faq_markup = html[html.index('<section id="duvidas"'):]
        questions = re.findall(r'<details[^>]*>\s*<summary>(.*?)</summary>\s*<div class="faq-answer">\s*<p>(.*?)</p>', faq_markup, re.S)
        faq_names = {slug: 'Perguntas frequentes sobre vestidos de noiva', couture_slug: 'Perguntas frequentes sobre alta costura sob medida', festa_slug: 'Perguntas frequentes sobre peças de festa sob medida', custom_slug: 'Perguntas frequentes sobre criação de roupas sob medida'}
        faq = {'@type': 'FAQPage', '@id': url + '#duvidas', 'url': url + '#duvidas', 'name': faq_names[route], 'inLanguage': 'pt-BR', 'isPartOf': ref(page_id), 'about': ref(bridal['@id']), 'mainEntity': [{'@type': 'Question', 'name': text(q), 'acceptedAnswer': {'@type': 'Answer', 'text': text(a)}} for q, a in questions]}
        graph.append(faq)
        process_id = {slug: 'processo-noivas', couture_slug: 'processo-alta-costura', festa_slug: 'processo-festas', custom_slug: 'processo-sob-medida'}[route]
        gallery_markup = html[html.index('<section id="portfolio"'):html.index('<section id="' + process_id + '"')]
        images = []
        seen = set()
        for tag in re.findall(r'<img\b[^>]*>', gallery_markup):
            attributes = dict(re.findall(r'([\w-]+)="([^"]*)"', tag))
            src = attributes['src']
            if src in seen:
                continue
            seen.add(src)
            image_url = urljoin(base, src)
            image = {'@type': 'ImageObject', '@id': image_url + '#imagem', 'contentUrl': image_url, 'url': image_url, 'description': unescape(attributes.get('alt', '')), 'isPartOf': ref(url + '#portfolio')}
            for dimension in ('width', 'height'):
                if attributes.get(dimension, '').isdigit():
                    image[dimension] = int(attributes[dimension])
            images.append(image)
        gallery_names = {slug: 'Portfólio de noivas', couture_slug: 'Acervo de alta costura', festa_slug: 'Vestidos e peças de festa', custom_slug: 'Projetos de criação sob medida'}
        gallery = {'@type': 'ImageGallery', '@id': url + '#portfolio', 'url': url + '#portfolio', 'name': gallery_names[route], 'inLanguage': 'pt-BR', 'isPartOf': ref(page_id), 'about': ref(bridal['@id']), 'image': [ref(image['@id']) for image in images]}
        graph.extend([gallery] + images)
        page['hasPart'] = [ref(gallery['@id']), ref(faq['@id'])]
        featured_name = {slug: '/vestido-de-noiva-sob-medida.webp', couture_slug: '/roupa-de-alta-costura-perto-de-mim.png', festa_slug: '/roupas-modeladas-para-festas-e-ocasioes-especiais-urbano-junior.webp', custom_slug: '/roupas-sob-medida.webp'}[route]
        featured = next(image for image in images if image['contentUrl'].endswith(featured_name))
        page['primaryImageOfPage'] = ref(featured['@id'])
    html = re.sub(r'(<link rel="canonical" href=")[^"]*(")', lambda m: m[1] + escape(url, quote=True) + m[2], html)
    html = re.sub(r'(<meta property="og:url" content=")[^"]*(")', lambda m: m[1] + escape(url, quote=True) + m[2], html)
    if 'rel="alternate" type="text/plain"' not in html:
        html = html.replace('</head>', '<link rel="alternate" type="text/plain" href="/llms.txt" title="Resumo do site para assistentes de IA">\n</head>')
    if route == slug:
        image_url = base + 'assets/noivas/vestido-de-noiva-sob-medida.webp'
        html = re.sub(r'(<meta property="og:image" content=")[^"]*(")', lambda m: m[1] + image_url + m[2], html)
    schema = '<script type="application/ld+json">\n' + json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, indent=2) + '\n</script>'
    if 'application/ld+json' in html:
        html = re.sub(r'<script type="application/ld\+json">.*?</script>', lambda _: schema, html, flags=re.S)
    else:
        html = html.replace('</head>', schema + '\n</head>')
    path.write_text(html, encoding='utf-8')

routes = ['', 'servicos', slug, couture_slug, festa_slug, custom_slug, 'sobre', 'blog', 'privacidade', 'formulario', 'links']
(dist / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join('  <url><loc>' + escape(base + route) + '</loc></url>\n' for route in routes) + '</urlset>\n', encoding='utf-8')
(dist / 'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: ' + base + 'sitemap.xml\n', encoding='utf-8')

# Maintain canonical URLs for the campaign and contact pages.
for route in ('links', 'formulario'):
    path = dist / (route + '.html')
    html = path.read_text(encoding='utf-8')
    canonical = '<link rel="canonical" href="' + escape(base + route, quote=True) + '">'
    if 'rel="canonical"' in html:
        html = re.sub(r'<link rel="canonical"[^>]*>', canonical, html)
    else:
        html = html.replace('</head>', '  ' + canonical + '\n</head>')
    path.write_text(html, encoding='utf-8')
