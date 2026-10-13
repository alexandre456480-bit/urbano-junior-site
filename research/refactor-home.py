"""Regenerate the sections below the preserved hero from editable home data."""
from pathlib import Path
from html import escape
from urllib.parse import quote
import json
import re

root = Path(__file__).resolve().parent.parent
target = root / 'dist' / 'index.html'
data = json.loads((root / 'dist' / 'content' / 'home.json').read_text(encoding='utf-8'))
e = escape
contact = data['contact']

def icon(name='arrow'):
    return f'<svg class="icon" aria-hidden="true"><use href="#{name}"/></svg>'

def image(item):
    return f'<img src="{e(item["src"])}" alt="{e(item["alt"])}" width="{item["width"]}" height="{item["height"]}" loading="lazy" decoding="async">'

def whatsapp(message):
    return contact['whatsapp'] + '?text=' + quote(message)

def external(url, text, classes='', extra=''):
    return f'<a class="{classes}" href="{e(url)}" target="_blank" rel="noopener noreferrer" {extra}>{text}</a>'

services = '\n'.join(f'''<article class="service-item">
  <a class="service-image {'evening' if s['category']=='festa' else ''}" href="#portfolio" data-service-filter="{s['category']}" aria-label="Conhecer serviço: {e(s['title'])}">{image(s)}<span class="image-number">{s['number']}</span><span class="image-arrow">{icon('diagonal')}</span></a>
  <div class="service-label"><span>{s['label']}</span><h3>{e(s['title'])}</h3><p>{e(s['description'])}</p><a class="text-link" href="#portfolio" data-service-filter="{s['category']}" aria-label="Conhecer serviço: {e(s['title'])}">Conhecer serviço {icon()}</a></div>
</article>''' for s in data['services'])

projects = '\n'.join(f'''<article class="portfolio-item portfolio-{p['ratio']}" data-category="{p['category']}">
  <a class="project-open" href="{e(p['src'])}" data-project="{p['id']}" aria-label="Visualizar {e(p['title'])}" aria-haspopup="dialog"><span class="project-photo" style="--photo-position:{p['position']}">{image(p)}<span class="project-overlay"><span>{e(p['type'])}</span>{icon('diagonal')}</span></span><div class="project-caption"><span class="project-category">{e(p['categoryLabel'])}</span><h3>{e(p['title'])}</h3></div></a>
</article>''' for p in data['projects'])

atelier = '\n'.join(f'<figure class="arc-photo">{image(p)}<figcaption>{e(p["title"])}</figcaption></figure>' for p in data['atelier'])
filters = ''.join(f'<button type="button" class="portfolio-filter {"is-selected" if key=="todos" else ""}" data-filter="{key}" aria-pressed="{"true" if key=="todos" else "false"}" aria-controls="portfolio-grid">{label}</button>' for key,label in [('todos','TODOS'),('sob-medida','SOB MEDIDA'),('festa','FESTA'),('noivas','NOIVAS'),('autorais','AUTORAIS'),('modelagem','MODELAGEM')])
steps = [
    ('Conversa e intenção','Entendemos sua ideia, ocasião, referências e expectativas para a criação.'),
    ('Conceito e escolhas','Definimos direção estética, tecidos, materiais e os principais detalhes da peça.'),
    ('Modelagem e provas','A criação ganha forma e passa pelos ajustes necessários para alcançar o caimento desejado.'),
    ('Detalhes e entrega','Os acabamentos são finalizados e a criação é preparada para o momento para o qual foi imaginada.')
]
process = ''.join(f'<li><span class="step-number">0{i}<span aria-hidden="true"></span></span><h3>{title}</h3><p>{text}</p></li>' for i,(title,text) in enumerate(steps,1))
facebook_text = 'Encontrar Urbano Jr. alta costura' if contact.get('facebookIsSearch') else 'Acompanhe Urbano Junior'
rows = ''.join(external(url,f'{icon(symbol)}<span><span class="contact-label">{label}</span><span class="contact-detail">{text}</span></span>{icon()}', 'contact-row') for label,text,symbol,url in [
    ('WHATSAPP','Fale diretamente com Urbano Junior','whatsapp',whatsapp('Olá, Urbano Junior! Gostaria de conversar sobre uma criação.')),
    ('INSTAGRAM','Conheça trabalhos e bastidores','instagram',contact['instagram']),
    ('FACEBOOK',facebook_text,'facebook',contact['facebook']),
    ('LOCALIZAÇÃO','Studio no Jardim América, Goiânia','pin',contact['maps'])
])
html = f'''
    <section id="universos" class="services home-section section-space" aria-labelledby="services-title">
      <div class="container"><div class="section-heading"><div><p class="eyebrow">01 / PRINCIPAIS SERVIÇOS</p><h2 id="services-title"><span class="motion-line">Criações para</span><br><span class="motion-line">diferentes momentos.</span><br><span class="motion-line">O mesmo <em class="motion-accent">olhar autoral.</em></span></h2></div><p>Do desenvolvimento de uma peça exclusiva à construção técnica para marcas, cada projeto parte de uma ideia e ganha forma de maneira individual.</p></div><div class="service-grid">{services}</div></div>
    </section>

    <section id="portfolio" class="portfolio home-section section-space" aria-labelledby="portfolio-title">
      <div class="container"><div class="section-heading"><div><p class="eyebrow">02 / PORTFÓLIO</p><h2 id="portfolio-title"><span class="motion-line">Criações que</span><br><span class="motion-line">ganham <em class="motion-accent">forma.</em></span></h2></div><div class="portfolio-intro"><p>Uma seleção de peças, processos e projetos desenvolvidos por Urbano Junior.</p><p class="photo-note">Nesta prévia, as fotografias e os nomes dos projetos são ilustrativos. {external(contact['instagram'],'Veja os trabalhos reais ↗')}.</p></div></div>
      <div class="portfolio-filters" role="group" aria-label="Filtrar portfólio">{filters}</div><p class="sr-only" id="portfolio-status" role="status" aria-live="polite"></p><div class="portfolio-grid" id="portfolio-grid">{projects}</div><div class="portfolio-end"><span>Uma ideia. Muitas possibilidades.</span>{external(whatsapp('Olá, Urbano Junior! Gostaria de conversar sobre uma criação.'),'Conte sua ideia '+icon(),'text-link')}</div></div>
    </section>

    <section id="estilista" class="about home-section section-space" aria-labelledby="about-title">
      <div class="container about-grid"><div class="about-copy"><p class="eyebrow">03 / O ESTILISTA · DIFERENCIAIS</p><h2 id="about-title"><span class="motion-line">Cada peça passa</span><br><span class="motion-line">pelas mãos de quem</span><br><em class="motion-line motion-accent">a imaginou.</em></h2><p class="lead"><span class="sketch-line" aria-hidden="true"></span>Um olhar autoral.<br>Um processo artesanal.</p><p>Cada criação é desenvolvida de maneira individual e acompanhada diretamente por Urbano Junior. Do conceito à modelagem, das provas aos acabamentos, cada etapa faz parte de um processo pensado para transformar uma ideia em uma peça única.</p><p>Urbano Junior é estilista e modelista em Goiânia, com trajetória ligada à criação, alta-costura, modelagem, moulage e desenvolvimento de moda.</p><p>Seu olhar aproxima intenção e técnica: a identidade de quem veste orienta as escolhas, e o cuidado artesanal acompanha cada detalhe.</p>{external(contact['instagram'],'Conheça Urbano Junior '+icon(),'text-link')}</div>
      <div class="atelier-composition"><div class="atelier-carousel" tabindex="0" role="region" aria-roledescription="carrossel" aria-label="Referências ilustrativas do processo de criação" aria-describedby="atelier-help"><div class="arc-track">{atelier}</div></div><div class="atelier-controls"><p id="atelier-help">ARRASTE PARA EXPLORAR <span aria-hidden="true">↔</span></p><button class="arc-toggle" type="button" aria-pressed="false" hidden>Pausar movimento</button></div><p class="photo-note">Imagens ilustrativas de criação e processo.</p></div></div>
    </section>

    <section id="processo" class="process home-section section-space" aria-labelledby="process-title">
      <div class="container"><div class="section-heading"><div><p class="eyebrow">04 / COMO FUNCIONA</p><h2 id="process-title"><span class="motion-line">Da primeira conversa</span><br><span class="motion-line">à <em class="motion-accent">peça final.</em></span></h2></div><p>Um processo próximo e individual, desenvolvido etapa por etapa.</p></div><ol class="process-grid">{process}</ol><div class="process-cta"><p>Comece sua <em>criação.</em></p>{external(whatsapp('Olá, Urbano Junior! Gostaria de começar uma criação sob medida.'),'CONVERSAR COM URBANO JUNIOR '+icon(),'button button-dark')}</div></div>
    </section>

    <section id="contato" class="contact home-section section-space" aria-labelledby="contact-title">
      <div class="container"><div class="section-heading"><div><p class="eyebrow">05 / LOCALIZAÇÃO E CONTATO</p><h2 id="contact-title"><span class="motion-line">Onde a criação</span><br><em class="motion-line motion-accent">começa.</em></h2></div><p>Atendimento com hora marcada no studio Urbano Junior, em Goiânia.</p></div><div class="contact-grid"><div class="studio-location"><div class="map-frame"><iframe src="{e(contact['mapEmbed'])}" title="Localização do Studio Urbano Junior no Jardim América, Goiânia" width="720" height="480" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div><div class="studio-caption"><div><h3>Studio Urbano Junior</h3><address>{e(contact['streetAddress'])} · Jardim América<br>Goiânia – GO · {e(contact['postalCode'])}</address></div>{external(contact['maps'],'Como chegar '+icon('diagonal'),'text-link')}</div></div><div class="contact-options">{rows}{external(whatsapp('Olá, Urbano Junior! Gostaria de agendar uma conversa sobre minha ideia.'),'INICIAR CONVERSA NO WHATSAPP '+icon(),'button button-dark')}<p class="contact-note">Uma conversa é o primeiro passo. Vamos imaginar sua próxima criação?</p></div></div></div>
    </section>
  </main>
  <footer class="site-footer"><div class="container footer-grid"><div class="footer-brand"><a href="#inicio" aria-label="Urbano Junior — início"><img src="assets/logo-display.webp" alt="Urbano Junior Estilista" width="112" height="112" loading="lazy"></a><p>Criação que começa em você.</p></div><div class="footer-navigation" role="navigation" aria-label="Navegação do rodapé"><h2>LINKS</h2><a href="#inicio">Início</a><a href="#universos">Serviços</a><a href="#portfolio">Portfólio</a><a href="#estilista">Sobre</a><a href="#contato">Contato</a></div><div class="footer-contact"><h2>STUDIO</h2><address>Jardim América<br>Goiânia – GO</address><p>Atendimento com hora marcada.</p>{external(contact['maps'],'Como chegar '+icon('diagonal'),'map-link')}</div><div class="footer-social"><h2>ACOMPANHE</h2>{external(contact['whatsapp'],icon('whatsapp')+' WhatsApp')}{external(contact['instagram'],icon('instagram')+' Instagram')}{external(contact['facebook'],icon('facebook')+' Facebook')}</div></div><div class="container footer-bottom"><span>© <span id="year">2026</span> Urbano Junior. Todos os direitos reservados.</span><a href="privacidade.html">Política de Privacidade</a></div></footer>
  <dialog class="project-dialog" id="project-dialog" aria-labelledby="project-dialog-title"><button class="dialog-close" type="button" aria-label="Fechar projeto">×</button><div class="project-dialog-content"><img id="project-dialog-image" alt=""><div class="project-dialog-copy"><p class="eyebrow" id="project-dialog-category"></p><h2 id="project-dialog-title"></h2><p id="project-dialog-description"></p><p class="photo-note">Fotografia e nome ilustrativos nesta prévia.</p>{external(whatsapp('Olá, Urbano Junior! Gostaria de conversar sobre uma criação.'),'CONVERSAR SOBRE UMA CRIAÇÃO '+icon(),'button button-dark','id="project-dialog-contact"')}</div></div></dialog>
'''
existing = target.read_text(encoding='utf-8')
start = existing.index('    <section id="universos"')
end = existing.index('  <a class="floating-contact"')
existing = existing[:start] + html + existing[end:]
if 'href="home.css"' not in existing:
    existing = existing.replace('<link rel="stylesheet" href="styles.css">','<link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="home.css">')
if 'src="home.js"' not in existing:
    existing = existing.replace('<script src="motion.js" defer></script>','<script src="motion.js" defer></script>\n  <script src="home.js" defer></script>')
if 'id="facebook"' not in existing:
    existing = existing.replace('<symbol id="pin"', '<symbol id="facebook" viewBox="0 0 24 24"><path d="M14 21v-8h3l.5-4H14V7c0-1 .5-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8"/></symbol>\n    <symbol id="pin"')
structured = re.search(r'(<script type="application/ld\+json">)(.*?)(</script>)', existing, re.S)
schema = json.loads(structured.group(2))
for item in schema['@graph']:
    if item['@type'] == 'LocalBusiness':
        item['address']['streetAddress'] = contact['streetAddress'] + ' — Jardim América'
        item['address']['postalCode'] = contact['postalCode']
existing = existing[:structured.start(2)] + '\n' + json.dumps(schema, ensure_ascii=False, indent=2) + '\n  ' + existing[structured.end(2):]
target.write_text(existing, encoding='utf-8')
print('Home regenerated; header and hero markup preserved.')
