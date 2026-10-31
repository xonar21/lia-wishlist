# Фактура холста, нарисованная с нуля (без скана): полотняное переплетение нитей.
#   python3 tools/bg/weave.py dist/assets/bg/canvas-weave.webp
# Отсканированная фактура из JPEG давала на сайте рябь (шум скана и блоки сжатия повторялись плиткой),
# поэтому нитки строятся геометрически:
#   - основа (вертикальные нити) и уток (горизонтальные) с шагом S px; в каждом перекрёстке сверху то одна,
#     то другая нить, как в настоящем полотняном переплетении; нить приподнята там, где лежит сверху;
#   - у нитей неровная толщина (утолщения), они чуть гуляют в стороны, вдоль них идут волокна;
#   - холст загрунтован: впадины между нитями наполовину заполнены грунтом;
#   - рельеф освещён сверху слева, в щелях лёгкая тень.
# Плитка бесшовная по построению: целое число нитей и периодический шум. Результат — серый слой
# вокруг 128 для режима overlay (как и прежняя плитка).
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

OUT = sys.argv[1]
S = 16          # шаг нитей, px (плитка в двойном разрешении: на десктопе 8 css px)
N = 64          # нитей на плитку по каждой оси → плитка 1024 px
T = S * N
rng = np.random.default_rng(26)


def pnoise(shape, sigma):
    # гладкий периодический шум σ=1
    n = nd.gaussian_filter(rng.standard_normal(shape), sigma, mode='wrap')
    return n / n.std()


y, x = np.mgrid[0:T, 0:T].astype(np.float64)

# --- основа: нить i проходит около x = (i + .5)·S, чуть виляя по y; толщина меняется по длине ---
# лён неровный: нити виляют, толщина плавает, местами утолщения; уток (горизонтальный) толще основы
wander_v = pnoise((N, T), (0, 22)) * .11 * S          # [нить, y]
thick_v = .70 + .10 * pnoise((N, T), (0, 18)) + .10 * np.clip(pnoise((N, T), (0, 4)), 0, None)
wander_h = pnoise((N, T), (0, 22)) * .11 * S          # [нить, x]
thick_h = .86 + .10 * pnoise((N, T), (0, 18)) + .10 * np.clip(pnoise((N, T), (0, 4)), 0, None)
# высота каждого перекрёстка своя — одни узелки выпуклее, другие почти утоплены в грунт
bump = np.repeat(np.repeat(np.clip(1 + .35 * rng.standard_normal((N, N)), .4, 1.7), S, 0), S, 1)
bump = nd.gaussian_filter(bump, S / 3, mode='wrap')

# нить может заходить в соседнюю клетку (виляет и бывает толще) — берём выше из трёх ближайших
fib_v = pnoise((T, T), (5, .7)); fib_h = pnoise((T, T), (.7, 5))   # волокна: шум, вытянутый вдоль нити
i0 = np.floor(x / S).astype(int); j0 = np.floor(y / S).astype(int); yi = y.astype(int); xi = x.astype(int)
h_v = np.zeros_like(x); h_h = np.zeros_like(x)
for k in (-1, 0, 1):
    i = (i0 + k) % N; j = (j0 + k) % N
    cx = (i0 + k + .5) * S + wander_v[i, yi]; cy = (j0 + k + .5) * S + wander_h[j, xi]
    pv = np.sqrt(np.clip(1 - (2 * (x - cx) / (thick_v[i, yi] * S)) ** 2, 0, 1))   # круглое сечение нити
    ph = np.sqrt(np.clip(1 - (2 * (y - cy) / (thick_h[j, xi] * S)) ** 2, 0, 1))
    # перекрёсток (i, j): при чётном i+j сверху основа, при нечётном — уток; сверху нить приподнята
    lv = np.cos(np.pi * (y / S - .5 - (i0 + k))); lh = -np.cos(np.pi * (x / S - .5 - (j0 + k)))
    h_v = np.maximum(h_v, pv * (.7 + .3 * lv * bump) + .06 * fib_v * (pv > 0))
    h_h = np.maximum(h_h, ph * (.7 + .3 * lh * bump) + .06 * fib_h * (ph > 0))
H = np.maximum(h_v, h_h)

# грунт: мягкий максимум с уровнем грунта — щели неглубокие
g = .66         # уровень грунта: чем выше, тем мельче щели между нитями (иначе выходит «скатерть»)
H = g + np.logaddexp(0, (H - g) / .08) * .08
H = nd.gaussian_filter(H, 1.0, mode='wrap')

# свет сверху слева + тень в щелях
gy, gx = np.gradient(np.pad(H, 2, mode='wrap'))
gy, gx = gy[2:-2, 2:-2], gx[2:-2, 2:-2]
k = 3.0
nx, ny, nz = -gx * k, -gy * k, np.ones_like(H)
norm = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
L = np.array([-.55, -.65, .52]); L /= np.linalg.norm(L)
shade = (nx * L[0] + ny * L[1] + nz * L[2]) / norm
ao = H - nd.gaussian_filter(H, 3, mode='wrap')
v = (shade - shade.mean()) / shade.std() + .35 * (ao - ao.mean()) / ao.std()
v = v / v.std()

AMP = 6.5       # ± яркость слоя overlay (σ): фактура видна, но не спорит с краской и текстом
out = np.clip(np.rint(128 + AMP * v), 0, 255).astype(np.uint8)
Image.fromarray(out).convert('RGB').save(OUT, quality=88, method=6)
print(OUT, out.shape, 'σ', out.std().round(2))
