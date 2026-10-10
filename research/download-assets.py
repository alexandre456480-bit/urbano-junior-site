from pathlib import Path
import urllib.request, concurrent.futures, re
assets = Path(__file__).resolve().parent.parent / 'dist' / 'assets'
photos = {
 'editorial-hero.jpg': ('photo-1539109136881-3be0616acf4b',1600),
 'editorial-evening.jpg': ('photo-1566174053879-31528523f8ae',900),
 'editorial-atelier.jpg': ('photo-1592878904946-b3cd8ae243d0',1000),
 'editorial-fashion.jpg': ('photo-1551232864-3f0890e580d9',900),
}
def get(url):
 return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=45).read()
def download(item):
 name,(photo,width)=item
 data=get(f'https://images.unsplash.com/{photo}?auto=format&fit=crop&w={width}&q=85')
 (assets/name).write_bytes(data)
 print(name,len(data))
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 list(pool.map(download,photos.items()))
fontcss=get('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap').decode()
for i,url in enumerate(dict.fromkeys(re.findall(r'url\((https[^)]+)\)',fontcss))):
 name=f'font-{i}'+('.woff2' if '.woff2' in url else '.ttf')
 (assets/name).write_bytes(get(url));fontcss=fontcss.replace(url,name)
(assets/'fonts.css').write_text(fontcss,encoding='utf-8')
print('Fontes locais salvas')
