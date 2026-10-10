import urllib.request, re
from pathlib import Path
assets=Path(__file__).resolve().parent.parent/'dist'/'assets'
def get(url):
 request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'})
 return urllib.request.urlopen(request,timeout=45).read()
css=get('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap').decode()
blocks=re.findall(r'/\* (latin(?:-ext)?) \*/\s*(@font-face\s*\{[^}]+\})',css)
if not blocks: raise RuntimeError('Nenhum bloco latino encontrado; manter fontes anteriores')
css='\n'.join(block for subset,block in blocks)
for i,url in enumerate(dict.fromkeys(re.findall(r'url\((https[^)]+)\)',css))):
 name=f'local-font-{i}.woff2'
 (assets/name).write_bytes(get(url));css=css.replace(url,name)
(assets/'fonts.css').write_text(css,encoding='utf-8')
for family in ['cormorantgaramond','manrope']:
 (assets/f'{family}-OFL.txt').write_bytes(get(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{family}/OFL.txt'))
print('Fontes latinas WOFF2 e licenças salvas; bytes:',sum(p.stat().st_size for p in assets.glob('local-font-*')))
