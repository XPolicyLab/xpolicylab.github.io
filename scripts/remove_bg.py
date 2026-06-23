from PIL import Image, ImageDraw, ImageFilter
import sys

src = sys.argv[1]
dst = sys.argv[2]
thresh = int(sys.argv[3]) if len(sys.argv) > 3 else 40

im = Image.open(src).convert("RGB")
w, h = im.size

# Flood fill the outer (white) background from every edge pixel with a unique key color.
KEY = (255, 0, 255)
work = im.copy()
seeds = []
step = 1
for x in range(0, w, step):
    seeds.append((x, 0))
    seeds.append((x, h - 1))
for y in range(0, h, step):
    seeds.append((0, y))
    seeds.append((w - 1, y))

px = work.load()
for sx, sy in seeds:
    r, g, b = px[sx, sy]
    # Only seed on near-white edge pixels.
    if r > 235 and g > 235 and b > 235:
        ImageDraw.floodfill(work, (sx, sy), KEY, thresh=thresh)

# Build alpha mask: transparent where filled with KEY.
mask = Image.new("L", (w, h), 255)
mpx = mask.load()
wpx = work.load()
for y in range(h):
    for x in range(w):
        if wpx[x, y] == KEY:
            mpx[x, y] = 0

# Slight smoothing of the mask edge to reduce harsh halo.
mask = mask.filter(ImageFilter.GaussianBlur(0.6))

out = im.convert("RGBA")
out.putalpha(mask)
out.save(dst)
print("saved", dst, out.size)
