from pathlib import Path
from PIL import Image
import re
root=Path(__file__).resolve().parent.parent
assets=root/'dist/assets'
mobile=assets/'mobile'
mobile.mkdir(exist_ok=True)
# Keep all original pixels and dimensions in the heavy carousel photograph.
Image.open(assets/'altacostura/roupa-de-alta-costura-perto-de-mim.png').save(mobile/'alta-costura-lossless.webp',lossless=True,method=6)
# Three device pixels per CSS pixel at the widest mobile header size (84px).
logo=Image.open(assets/'urbano-junior-logo-3.webp')
logo.thumbnail((252,252),Image.Resampling.LANCZOS)
logo.save(mobile/'logo-252.webp',lossless=True,method=6)
p=root/'dist/index.html'
s=p.read_text(encoding='utf-8')
anchor='  <link rel="stylesheet" href="assets/fonts.css">'
preloads='''  <!-- Mobile first-screen resources; desktop keeps its existing loading path. -->
  <link rel="preload" href="assets/local-font-1.woff2" as="font" type="font/woff2" crossorigin media="(max-width: 820px)">
  <link rel="preload" href="assets/local-font-5.woff2" as="font" type="font/woff2" crossorigin media="(max-width: 820px)">
  <link rel="preload" href="assets/festas/vestido-de-festa-personalizado-goiania.webp" as="image" fetchpriority="high" media="(max-width: 820px)">
'''
if '<!-- Mobile first-screen resources;' not in s:
    s=s.replace(anchor,preloads+anchor,1)
# Keep the exact same frame, direct image child, styles and animation targets.
s=re.sub(r'<div class="hero-photo-frame">(<img[^>]+src="assets/altacostura/roupa-de-alta-costura-perto-de-mim.png"[^>]*>)</div>',r'<picture class="hero-photo-frame"><source media="(max-width: 820px)" srcset="assets/mobile/alta-costura-lossless.webp">\1</picture>',s)
# Responsive candidates preserve the original image as the desktop source.
logo_tag='<img src="assets/urbano-junior-logo-3.webp" alt="Logo de Urbano Junior Estilista" width="84" height="84">'
responsive_logo=logo_tag.replace(' width=', ' srcset="assets/mobile/logo-252.webp 252w, assets/urbano-junior-logo-3.webp 1254w" sizes="(max-width: 820px) 84px, 1254px" width=')
s=s.replace(logo_tag,responsive_logo,1)
p.write_text(s,encoding='utf-8')
