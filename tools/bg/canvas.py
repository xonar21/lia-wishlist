# Фон ?bg=8 — живописный холст (персик и цветок). Запуск (нужны numpy, scipy, pillow):
#   python3 tools/bg/canvas.py <исходник.jpg> dist/assets/bg
# Как штукатурка и вельвет, фон делится на два слоя, которые в CSS складываются режимом overlay:
#   canvas.webp       — мягкие пятна краски без фактуры, в половинном разрешении (их можно растягивать).
#                       По раскладке заказчицы друг под другом идут четыре варианта картины: как есть,
#                       отражённая по вертикали, по горизонтали и в обе стороны. Персик встречается со своим
#                       отражением — там стык сходится сам; цветок — с зеркальным цветком, там варианты
#                       плавно перетекают друг в друга. Четвёртый вариант перетекает обратно в первый,
#                       так что лента повторяется по вертикали без шва. Картина занимает ZOOM ширины,
#                       по бокам — чистый холст: у краёв краска неровно и мягко растворяется в нём, как
#                       разбавленная акварель (граница — шум нескольких масштабов, от разводов до зерна). Граница и пятна на холсте
#                       тоже периодичны по вертикали, так что повтор ленты по-прежнему без шва;
#   canvas-weave.webp — фактура холста в полном разрешении, бесшовная плитка: края сшиты по линии
#                       наименьшего отличия (min-cut), так что нитки на стыке просто продолжаются.
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

SRC, OUT = sys.argv[1], sys.argv[2]
CROP = (8, 4, 1135, 2115)    # срезаем светлую кайму скана со всех сторон (снизу она дала бы линию на оси отражения)
SIGMA = 2.5                  # граница между «пятнами» и «нитками»
OVERLAP = .15                # доля высоты, на которой цветок перетекает в зеркальный цветок
ZOOM = .8                    # ширина картины относительно ширины ленты (на десктопе лента = ширина экрана)
BARE = (183, 167, 152)       # чистый холст — светлые незакрашенные места исходника
WEAVE_BOX = (880, 880, 1155, 1560)    # спокойный участок холста справа от персика
WEAVE_PERIOD = 6.45          # шаг нитей по вертикали, px (по спектру строк)


def img(a):
    return Image.fromarray(np.clip(np.rint(a), 0, 255).astype(np.uint8))


def save(im, name, q):
    p = os.path.join(OUT, name)
    im.save(p, quality=q, method=6)
    print(name, im.size, os.path.getsize(p) // 1024, 'KB')


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


a = np.asarray(Image.open(SRC).convert('RGB').crop(CROP)).astype(np.float64)
low = nd.gaussian_filter(a, (SIGMA, SIGMA, 0))

# --- пятна: четыре варианта подряд; стыки персик|персик — зеркальные, цветок|цветок — с перетеканием ---
P = np.asarray(img(low).resize((a.shape[1] // 2, a.shape[0] // 2), Image.LANCZOS)).astype(np.float64)
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
    # гладкий шум, периодичный по вертикали (как и лента) и нормированный к σ = 1
    n = nd.gaussian_filter(rng.standard_normal((T, W)), sigma, mode=('wrap', 'reflect'))
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
save(img(out), 'canvas.webp', 88)

# --- нитки: высокие частоты с поправкой на ослабление в overlay, плитка без шва ---
x0, y0, x1, y1 = WEAVE_BOX
src = a[y0:y1, x0:x1]; hp = src - nd.gaussian_filter(src, (SIGMA, SIGMA, 0))
lim = 3 * hp.std(); hp = np.clip(hp, -lim, lim)          # редкие соринки не должны повторяться сеткой
# сила фактуры по участку разная (где краска тоньше, нитки виднее) — выравниваем, иначе
# более гладкие места плитки повторялись бы пятнами
env = np.sqrt(nd.gaussian_filter((hp ** 2).mean(2), 14))[..., None]; hp = hp / env * env.mean()
c = low.mean((0, 1)) / 255; gain = np.where(c > .5, 1 / (2 * (1 - c)), 1 / (2 * c))
d = 128 + hp * gain


def cut(E):
    # путь сверху вниз по строкам E (по одному столбцу в строке, шаг ±1) с наименьшей суммой
    C = E.copy(); back = np.zeros(E.shape, int)
    for r in range(1, len(E)):
        p = C[r - 1]; cand = np.stack([np.r_[np.inf, p[:-1]], p, np.r_[p[1:], np.inf]])
        k = cand.argmin(0); back[r] = k - 1; C[r] += cand[k, np.arange(len(p))]
    path = [int(C[-1].argmin())]
    for r in range(len(E) - 1, 0, -1): path.append(path[-1] + int(back[r, path[-1]]))
    return np.array(path[::-1])


def wrap_x(d, ov):
    # плитка шириной W−ov: первые ov столбцов — слева от шва продолжение правого края, справа — исходные
    A, B = d[:, :ov], d[:, -ov:]
    E = nd.gaussian_filter(((A - B) ** 2).sum(2), 1); E[:, :4] = E[:, -4:] = np.inf
    m = nd.gaussian_filter1d((np.arange(ov)[None, :] >= cut(E)[:, None]).astype(float), 1, axis=1)[..., None]
    out = d[:, :-ov].copy(); out[:, :ov] = B * (1 - m) + A * m
    return out


# по горизонтали — шов min-cut; по вертикали тоже, но высота плитки — целое число шагов нитей,
# чтобы нитки в нахлёсте совпадали по фазе
d = wrap_x(d, 60)
n = int((d.shape[0] - 60) // WEAVE_PERIOD); ovy = d.shape[0] - int(round(n * WEAVE_PERIOD))
t = wrap_x(d.transpose(1, 0, 2), ovy).transpose(1, 0, 2)
# шов по второй оси сделан на уже замкнутой по x плитке, но сам путь не замкнут — проверяем стык
seam = np.abs(t[:, 0] - t[:, -1]).mean()
save(img(t), 'canvas-weave.webp', 90)
print('base color', np.round(low.mean((0, 1))), 'weave std', hp.std().round(2), 'gain', gain.round(2),
      'tile', t.shape[1], 'x', t.shape[0], 'rows ov', ovy, 'x-edge diff', seam.round(2))
