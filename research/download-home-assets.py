from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen
import json

root = Path(__file__).resolve().parent.parent
photos = {
    'editorial-bridal.jpg': (34034504, 'https://www.pexels.com/photo/beautiful-bride-in-elegant-white-wedding-dress-34034504/'),
    'editorial-sketch.jpg': (6358793, 'https://www.pexels.com/photo/fabric-sampler-and-a-dress-design-sketch-on-the-wall-of-a-tailor-shop-6358793/'),
    'editorial-pattern.jpg': (7147569, 'https://www.pexels.com/photo/crop-seamstress-with-sewing-ruler-and-pattern-drawing-on-paper-7147569/'),
    'editorial-craft.jpg': (12362544, 'https://www.pexels.com/photo/a-person-using-a-sewing-machine-12362544/'),
}

def download(item):
    name, (photo, source) = item
    url = f'https://images.pexels.com/photos/{photo}/pexels-photo-{photo}.jpeg?auto=compress&cs=tinysrgb&w=1000&q=85'
    request = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urlopen(request, timeout=40) as response:
        data = response.read()
    (root / 'dist' / 'assets' / name).write_bytes(data)
    print(name, len(data))
    return {'file': name, 'source': source, 'download': url, 'license': 'Pexels License', 'illustrative': True}

with ThreadPoolExecutor(max_workers=4) as pool:
    sources = list(pool.map(download, photos.items()))
(root / 'dist' / 'assets' / 'home-photo-sources.json').write_text(json.dumps(sources, indent=2, ensure_ascii=False), encoding='utf-8')
