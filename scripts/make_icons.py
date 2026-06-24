#!/usr/bin/env python3
"""Dependency-free PNG icon generator for SnapCal.

Draws a rounded green tile with a white camera glyph and a small
calorie-ring accent, then writes PNGs using only the stdlib (zlib+struct).
Run: python3 scripts/make_icons.py
"""
import zlib, struct, math, os

OUT = os.path.join(os.path.dirname(__file__), "..", "icons")

# Brand palette
GREEN_TOP = (34, 197, 94)    # #22c55e
GREEN_BOT = (21, 128, 61)    # #15803d
WHITE = (255, 255, 255)
RING = (250, 204, 21)        # amber accent #facc15
LENS = (21, 128, 61)


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def make_canvas(size, bg_alpha_outside=0, rounded=True):
    buf = [[(0, 0, 0, 0) for _ in range(size)] for _ in range(size)]
    r = int(size * 0.22)  # corner radius
    for y in range(size):
        t = y / (size - 1)
        col = lerp(GREEN_TOP, GREEN_BOT, t)
        for x in range(size):
            inside = True
            if rounded:
                # rounded-rect mask
                cx = min(max(x, r), size - 1 - r)
                cy = min(max(y, r), size - 1 - r)
                dx = x - cx
                dy = y - cy
                if dx * dx + dy * dy > r * r:
                    inside = False
            if inside:
                buf[y][x] = (col[0], col[1], col[2], 255)
    return buf


def fill_circle(buf, cx, cy, rad, color, alpha=255):
    size = len(buf)
    for y in range(max(0, int(cy - rad - 1)), min(size, int(cy + rad + 2))):
        for x in range(max(0, int(cx - rad - 1)), min(size, int(cx + rad + 2))):
            d = math.hypot(x - cx, y - cy)
            if d <= rad:
                if buf[y][x][3] == 0:
                    continue
                buf[y][x] = (color[0], color[1], color[2], alpha)


def ring(buf, cx, cy, rad, width, color):
    size = len(buf)
    inner = rad - width
    for y in range(max(0, int(cy - rad - 1)), min(size, int(cy + rad + 2))):
        for x in range(max(0, int(cx - rad - 1)), min(size, int(cx + rad + 2))):
            d = math.hypot(x - cx, y - cy)
            if inner <= d <= rad and buf[y][x][3] != 0:
                buf[y][x] = (color[0], color[1], color[2], 255)


def rounded_rect(buf, x0, y0, x1, y1, rad, color):
    for y in range(int(y0), int(y1)):
        for x in range(int(x0), int(x1)):
            if buf[y][x][3] == 0:
                continue
            cx = min(max(x, x0 + rad), x1 - rad)
            cy = min(max(y, y0 + rad), y1 - rad)
            if (x - cx) ** 2 + (y - cy) ** 2 <= rad * rad:
                buf[y][x] = (color[0], color[1], color[2], 255)


def draw_icon(size, maskable=False):
    buf = make_canvas(size)
    s = size
    # camera body
    bx0, by0 = s * 0.20, s * 0.34
    bx1, by1 = s * 0.80, s * 0.74
    rounded_rect(buf, bx0, by0, bx1, by1, s * 0.07, WHITE)
    # viewfinder bump
    rounded_rect(buf, s * 0.40, s * 0.27, s * 0.60, s * 0.36, s * 0.03, WHITE)
    # lens outer ring (amber) and inner lens (green)
    cx, cy = s * 0.5, s * 0.55
    fill_circle(buf, cx, cy, s * 0.155, RING)
    fill_circle(buf, cx, cy, s * 0.125, LENS)
    fill_circle(buf, cx, cy, s * 0.075, WHITE)
    # small highlight
    fill_circle(buf, cx - s * 0.04, cy - s * 0.04, s * 0.025, (235, 235, 235))
    return buf


def write_png(buf, path):
    size = len(buf)
    raw = bytearray()
    for y in range(size):
        raw.append(0)  # filter type none
        for x in range(size):
            r, g, b, a = buf[y][x]
            raw += bytes((r, g, b, a))
    comp = zlib.compress(bytes(raw), 9)

    def chunk(typ, data):
        c = typ + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xffffffff)

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", comp)
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)
    print("wrote", path, size)


def main():
    os.makedirs(OUT, exist_ok=True)
    for sz in (192, 512):
        write_png(draw_icon(sz), os.path.join(OUT, f"icon-{sz}.png"))
    write_png(draw_icon(512, maskable=True), os.path.join(OUT, "maskable-512.png"))
    write_png(draw_icon(180), os.path.join(OUT, "apple-touch-icon.png"))
    # tiny favicon
    write_png(draw_icon(32), os.path.join(OUT, "favicon-32.png"))


if __name__ == "__main__":
    main()
