# Иконка вкладки — звезда-спираль от заказчицы (прислана скриншотом в телеграме).
#   python3 tools/favicon/build.py <скриншот.png> dist
# Звезду вырезаем по рамке, белый фон вокруг неё заливкой от краёв делаем прозрачным
# (светлые полосы внутри звезды серые, а не белые, и до них заливка не доходит).
# Мастер сохраняется в tools/favicon/star.png — дальше можно строить только от него: build.py star.png dist
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

SRC, OUT = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
im = Image.open(SRC).convert('RGBA')
if os.path.basename(SRC) != 'star.png':
    im = im.crop((119, 9, 389, 244))                      # звезда в пузыре сообщения, с полями
    a = np.asarray(im).astype(float)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    white = (a[..., :3].min(2) > 232) | ((g > r + 12) & (g > b + 12))   # фон пузыря и зелёный фон чата
    white[212:, 200:] = True                                            # плашка времени «13:30 ✓» в углу
    lab, _ = nd.label(white)
    edge = np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]]); edge = edge[edge > 0]
    bg = np.isin(lab, edge)
    # мягкий край: полупрозрачность по расстоянию до фона на 1 px, без белой каймы
    dist = nd.distance_transform_edt(~bg)
    alpha = np.clip(dist / 1.5, 0, 1) * 255
    lab, n = nd.label(alpha > 0)                          # оставляем только саму звезду — без пылинок от углов пузыря
    keep = np.argmax(nd.sum(np.ones_like(alpha), lab, range(1, n + 1))) + 1
    alpha[lab != keep] = 0
    a[..., 3] = alpha
    im = Image.fromarray(a.astype(np.uint8), 'RGBA')
    box = im.getbbox(); im = im.crop(box)
    side = max(im.size) + 6
    sq = Image.new('RGBA', (side, side), (0, 0, 0, 0)); sq.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    im = sq; im.save(os.path.join(HERE, 'star.png'))


def size(n):
    return im.convert('RGBa').resize((n, n), Image.LANCZOS).convert('RGBA')


size(32).save(os.path.join(OUT, 'favicon-32.png'))
size(192).save(os.path.join(OUT, 'favicon-192.png'))
# в корне — для браузеров, которые сами спрашивают /favicon.ico
size(48).save(os.path.join(OUT, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
# iOS кладёт иконку на чёрное, поэтому под неё — цвет холста
touch = Image.new('RGBA', (180, 180), (183, 167, 152, 255)); s = size(150); touch.alpha_composite(s, (15, 15))
touch.convert('RGB').save(os.path.join(OUT, 'apple-touch-icon.png'))
for f in ('favicon-32.png', 'favicon-192.png', 'favicon.ico', 'apple-touch-icon.png'):
    print(f, os.path.getsize(os.path.join(OUT, f)), 'B')
