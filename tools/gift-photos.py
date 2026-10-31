# Фото подарков: python3 tools/gift-photos.py <папка с исходниками> dist/assets/gifts
# Каждое фото обрезается в квадрат по главному объекту (CROP — сдвиг квадрата по длинной стороне,
# доля от свободного хода: 0 — верх/лево, .5 — центр, 1 — низ/право), уменьшается до 600×600
# и заранее «впечатывается» в бумагу: в макете фото лежат на бумаге режимом linear burn
# (бумага + фото − 1), а на сайте их кладём через multiply (бумага × фото), поэтому
# сохраняем фото = 1 − (1 − исходник) / бумага.
import os, sys
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
PAPER = (0xed, 0xe4, 0xd6)
SIZE = 600
# имя на сайте: (файл от заказчицы, CROP)
PHOTOS = {
    'photostudio': ('утв1.jpg', .5),
    'ceramics': ('утв2.jpg', .5),
    'irrigator': ('утв3.png', .45),
    'mouse': ('мышь2.jpg', .4),
    'painting-1': ('Dusk Street by the Soviet Apartment Block.png', .4),
    'painting-2': ('Nostalgic Retro Gallery Grid.png', .5),
    'painting-3': ('Misty Autumn Cottage Valley Canvas.png', .85),
    'kapor': ('Charcoal Knit Hood Editorial Portrait.png', .17),
    'mittens': ('Cozy Mittens and Dark Waves.png', .75),
    'projector': ('утв8.jpg', .2),
    'hp-shopper': ('переделать формат.jpg', .35),
    'hp-cap': ('переделать формат2.jpg', .75),
    'hp-tshirt': ('футболка.jpg', .45),
    'marmelad': ('Colorful Sugar Gummy Candy Flat Lay.png', .5),
    'board': ('Cozy Sunlit Whiteboard Workspace.png', .6),
    'lamp': ('переделать формат5.jpg', .8),
    'taksa': ('Cozy Corduroy Dachshund on Sofa.png', .61),
    'vase': ('переделать формаат.jpg', .7),
    'dried-flowers': ('переделать формат7.jpg', .6),
    'microphone': ('Premium Furry Lavalier Microphone Product Shot.png', .7),
}

os.makedirs(OUT, exist_ok=True)
for name, (file, pos) in PHOTOS.items():
    im = Image.open(os.path.join(SRC, file)).convert('RGB')
    side = min(im.size)
    x0 = round((im.width - side) * pos) if im.width > side else 0
    y0 = round((im.height - side) * pos) if im.height > side else 0
    sq = im.crop((x0, y0, x0 + side, y0 + side)).resize((SIZE, SIZE), Image.LANCZOS)
    bands = [b.point(lambda v, p=p: max(0, min(255, round(255 * (1 - (1 - v / 255) / (p / 255))))))
             for b, p in zip(sq.split(), PAPER)]
    path = os.path.join(OUT, f'{name}.webp')
    Image.merge('RGB', bands).save(path, quality=82, method=6)
    print(f'{name:14} ← {file} ({im.width}×{im.height}, квадрат {side} с {x0},{y0})', os.path.getsize(path) // 1024, 'KB')
