# Фон по умолчанию (холст: персик и цветок) — слой краски. Запуск (нужны numpy, scipy, pillow):
#   python3 tools/bg/canvas.py <исходник.jpg> dist/assets/bg
#   python3 tools/bg/weave.py dist/assets/bg/canvas-weave.webp      — нитки холста (рисуются с нуля)
# В CSS слои складываются режимом overlay: canvas.webp — краска, поверх — плитка ниток.
#   canvas.webp — мягкие пятна краски в полном разрешении исходника. Из скана берём только цвет:
#                 фактуру холста, шум скана и блоки JPEG снимает guided-фильтр (сглаживает мелкие
#                 перепады и оставляет крупные границы цвета) — краска лежит чистыми заливками,
#                 как акварель, а нитки рисует weave.py. По раскладке заказчицы друг под другом идут
#                 четыре варианта картины: как есть, отражённая по вертикали, по горизонтали и в обе
#                 стороны. Персик встречается со своим отражением — там стык сходится сам; цветок — с
#                 зеркальным цветком, там варианты плавно перетекают друг в друга. Четвёртый вариант
#                 перетекает обратно в первый, так что лента повторяется по вертикали без шва. Картина
#                 занимает ZOOM ширины, по бокам — чистый холст: у краёв краска неровно и мягко
#                 растворяется в нём, как разбавленная акварель (граница — шум нескольких масштабов,
#                 от разводов до зерна). Граница и пятна на холсте тоже периодичны по вертикали.
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

SRC, OUT = sys.argv[1], sys.argv[2]
CROP = (8, 4, 1135, 2115)    # срезаем светлую кайму скана со всех сторон (снизу она дала бы линию на оси отражения)
GUIDED = (16, 90)            # радиус guided-фильтра, px, и порог (дисперсия): что тише — сглаживается
OVERLAP = .15                # доля высоты, на которой цветок перетекает в зеркальный цветок
ZOOM = .8                    # ширина картины относительно ширины ленты (на десктопе лента = ширина экрана)
BARE = (183, 167, 152)       # чистый холст — светлые незакрашенные места исходника


def img(a):
    return Image.fromarray(np.clip(np.rint(a), 0, 255).astype(np.uint8))


def save(im, name, q):
    p = os.path.join(OUT, name)
    im.save(p, quality=q, method=6)
    print(name, im.size, os.path.getsize(p) // 1024, 'KB')


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def box(x, r):
    return nd.uniform_filter(x, 2 * r + 1, mode='reflect')


def guided(p, I, r, eps):
    # guided filter (He et al.): в окне r выход — линейная функция от яркости I; где перепады
    # меньше порога eps, остаётся среднее по окну, где больше — граница сохраняется
    mI, mp = box(I, r), box(p, r)
    k = (box(I * p, r) - mI * mp) / (box(I * I, r) - mI * mI + eps)
    return box(k, r) * I + box(mp - k * mI, r)


a = np.asarray(Image.open(SRC).convert('RGB').crop(CROP)).astype(np.float64)
base = nd.gaussian_filter(a, (1.5, 1.5, 0))            # сначала убираем сами нитки и пиксельный шум
gray = base.mean(2)
low = np.stack([guided(base[..., c], gray, *GUIDED) for c in range(3)], 2)
low = nd.gaussian_filter(low, (1, 1, 0))

# --- пятна: четыре варианта подряд; стыки персик|персик — зеркальные, цветок|цветок — с перетеканием ---
P = low
h = P.shape[0]; ov = round(h * OVERLAP); T = 4 * h - 2 * ov
up = smooth(np.arange(ov) / ov); down = up[::-1]
blend_top = np.r_[up, np.ones(h - ov)]; blend_bottom = np.r_[np.ones(h - ov), down]
parts = [(P, 0, blend_top), (P[::-1], h, blend_bottom),                         # 1 → 2: персик в зеркало
         (P[:, ::-1], 2 * h - ov, blend_top), (P[::-1, ::-1], 3 * h - ov, blend_bottom)]   # 3 → 4 так же
acc = np.zeros((T, P.shape[1], 3)); wsum = np.zeros((T, 1, 1))
for copy, y, w in parts:
    rows = (y + np.arange(h)) % T                  # хвост четвёртого заходит на начало первого
    acc[rows] += copy * w[:, None, None]; wsum[rows] += w[:, None, None]
strip = acc / wsum
w = strip.shape[1]; side = round(w * (1 / ZOOM - 1) / 2); W = w + 2 * side
rng = np.random.default_rng(8)


def noise(sigma):
    # гладкий шум, периодичный по вертикали (как и лента) и нормированный к σ = 1;
    # σ задана в пикселях половинного разрешения (в нём подбирался рисунок края), отсюда ×2
    n = nd.gaussian_filter(rng.standard_normal((T, W)), 2 * sigma, mode=('wrap', 'reflect'))
    return n / n.std()


# чистый холст: ровный цвет с еле заметными разводами
canvas = np.array(BARE, float) * (1 + .018 * noise(60)[..., None] + .008 * noise(15)[..., None])
paint = np.zeros((T, W, 3)); paint[:, side:side + w] = strip
# расстояние до ближайшего бокового края картины; граница краски — отступ внутрь картины плюс шум
# трёх масштабов (крупные разводы, затёки, зерно), переход широкий — краска истончается постепенно.
# Граница всегда внутри картины, поэтому обрезанный рамкой край исходника не виден.
x = np.arange(W) - side; d = np.minimum(x, w - 1 - x).astype(float)[None, :]
edge = np.maximum(.06 * w + .03 * w * (noise(55) + .5 * noise(16) + .3 * noise(4)), .02 * w)
alpha = smooth((d - edge) / (.05 * w))
out = canvas * (1 - alpha[..., None]) + paint * alpha[..., None]
save(img(out), 'canvas.webp', 92)
print('base color', np.round(low.mean((0, 1))))
