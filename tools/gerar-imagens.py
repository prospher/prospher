"""
Gera og.png (1200x630), favicon.ico e apple-touch-icon.png a partir dos SVGs
da marca. Os dois SVGs sao um unico <path> com fill-rule="evenodd" e usam
apenas os comandos M, L, H, V, C, Z -- da para rasterizar sem dependencia
externa: flatten das curvas de Bezier + preenchimento even-odd via XOR de
mascaras, com supersampling para antialiasing.
"""
import io
import os
import re
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFont

ASSETS = sys.argv[1]
FONT_BOLD = sys.argv[2]
FONT_REG = sys.argv[3]

INK = (17, 17, 17)
WHITE = (255, 255, 255)
GREEN = (11, 79, 61)
MINT = (46, 204, 154)

TOKEN = re.compile(r"[MLHVCZmlhvcz]|-?\d*\.?\d+(?:[eE][-+]?\d+)?")


def parse_path(d):
    """Devolve lista de subpaths; cada subpath e uma lista de pontos (x, y)."""
    tokens = TOKEN.findall(d)
    i = 0
    subpaths = []
    cur = []
    x = y = 0.0
    start = (0.0, 0.0)
    cmd = None

    def num():
        nonlocal i
        v = float(tokens[i])
        i += 1
        return v

    def bezier(p0, p1, p2, p3, steps=24):
        pts = []
        for s in range(1, steps + 1):
            t = s / steps
            mt = 1 - t
            a, b, c, dd = mt ** 3, 3 * mt * mt * t, 3 * mt * t * t, t ** 3
            pts.append(
                (
                    a * p0[0] + b * p1[0] + c * p2[0] + dd * p3[0],
                    a * p0[1] + b * p1[1] + c * p2[1] + dd * p3[1],
                )
            )
        return pts

    while i < len(tokens):
        t = tokens[i]
        if t.isalpha():
            cmd = t
            i += 1
        # comandos aqui sao todos absolutos (verificado nos dois arquivos)
        if cmd == "M":
            if len(cur) > 2:
                subpaths.append(cur)
            x, y = num(), num()
            start = (x, y)
            cur = [(x, y)]
        elif cmd == "L":
            x, y = num(), num()
            cur.append((x, y))
        elif cmd == "H":
            x = num()
            cur.append((x, y))
        elif cmd == "V":
            y = num()
            cur.append((x, y))
        elif cmd == "C":
            p1 = (num(), num())
            p2 = (num(), num())
            p3 = (num(), num())
            cur.extend(bezier((x, y), p1, p2, p3))
            x, y = p3
        elif cmd in ("Z", "z"):
            if len(cur) > 2:
                cur.append(start)
                subpaths.append(cur)
            cur = []
            x, y = start
        else:
            raise ValueError("comando SVG nao suportado: %r" % cmd)

    if len(cur) > 2:
        subpaths.append(cur)
    return subpaths


def render_svg(svg_path, width, supersample=4):
    """Rasteriza o SVG como mascara 'L' (255 = tinta), na largura pedida."""
    src = open(svg_path, encoding="utf-8").read()
    vb = re.search(r'viewBox="([\d.\-\s]+)"', src).group(1).split()
    vw, vh = float(vb[2]), float(vb[3])
    d = re.search(r' d="([^"]+)"', src).group(1)

    height = max(1, round(width * vh / vw))
    W, H = width * supersample, height * supersample
    scale = W / vw

    acc = Image.new("1", (W, H), 0)
    for sub in parse_path(d):
        layer = Image.new("1", (W, H), 0)
        ImageDraw.Draw(layer).polygon([(px * scale, py * scale) for px, py in sub], fill=1)
        acc = ImageChops.logical_xor(acc, layer)  # fill-rule evenodd

    return acc.convert("L").resize((width, height), Image.LANCZOS)


def tinted(mask, color):
    """Aplica cor a uma mascara, devolvendo RGBA."""
    img = Image.new("RGBA", mask.size, color + (0,))
    img.putalpha(mask)
    return img


def load_font(size, bold=True):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size)


def build_og(out):
    """Card 1200x630 para preview de link (WhatsApp, LinkedIn, X)."""
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), INK)
    draw = ImageDraw.Draw(img)

    # faixa de acento no topo
    draw.rectangle([0, 0, W, 6], fill=GREEN)

    # marca + wordmark
    mark = render_svg(os.path.join(ASSETS, "mark.svg"), 84)
    img.paste(tinted(mark, WHITE), (90, 96), tinted(mark, WHITE))

    word = render_svg(os.path.join(ASSETS, "word.svg"), 300)
    img.paste(tinted(word, WHITE), (196, 96 + (84 - word.height) // 2), tinted(word, WHITE))

    # titulo
    title_font = load_font(74)
    draw.text((90, 250), "Pare de depender", font=title_font, fill=WHITE)
    draw.text((90, 336), "só de indicações.", font=title_font, fill=WHITE)

    # subtitulo
    sub_font = load_font(28, bold=False)
    draw.text(
        (90, 452),
        "Tráfego, página e atendimento para advogados autônomos.",
        font=sub_font,
        fill=(168, 168, 168),
    )

    # rodape
    foot_font = load_font(24)
    draw.text((90, 530), "prospher.com.br", font=foot_font, fill=MINT)

    img.save(out, "PNG", optimize=True)
    return out


def build_icons(ico_out, apple_out):
    # favicon.ico — marca preta sobre transparente, igual ao SVG ja usado
    sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
    base = render_svg(os.path.join(ASSETS, "mark.svg"), 64, supersample=8)
    square = Image.new("RGBA", (64, 64), INK + (0,))
    layer = tinted(base, INK)
    square.paste(layer, (0, (64 - base.height) // 2), layer)
    square.save(ico_out, format="ICO", sizes=sizes)

    # apple-touch-icon — iOS nao lida bem com transparencia: fundo solido
    canvas = Image.new("RGB", (180, 180), WHITE)
    m = render_svg(os.path.join(ASSETS, "mark.svg"), 124, supersample=6)
    layer = tinted(m, INK)
    canvas.paste(layer, ((180 - m.width) // 2, (180 - m.height) // 2), layer)
    canvas.save(apple_out, "PNG", optimize=True)


if __name__ == "__main__":
    root = os.path.dirname(ASSETS)
    og = build_og(os.path.join(ASSETS, "og.png"))
    build_icons(os.path.join(root, "favicon.ico"), os.path.join(root, "apple-touch-icon.png"))
    for f in [og, os.path.join(root, "favicon.ico"), os.path.join(root, "apple-touch-icon.png")]:
        print("%-28s %6.1f KB" % (os.path.basename(f), os.path.getsize(f) / 1024))
